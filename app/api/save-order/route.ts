import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/emails";

export const runtime = "nodejs";

function isStripeProduct(
  product: Stripe.Product | Stripe.DeletedProduct | null
): product is Stripe.Product {
  return !!product && !product.deleted;
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);

    const session_id = body?.session_id;
    const clearCart = Boolean(body?.clear_cart);

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, {
      expand: ["data.price.product"],
    });

    const checkoutType = String(session.metadata?.checkoutType || "single");
    const cartId = String(session.metadata?.cartId || "");
    const userId = String(session.metadata?.userId || "");

    const bundleId = String(session.metadata?.bundleId || "");
    const vendorId = String(session.metadata?.vendorId || "");

    /*
    ==========================================
    PREVENT DUPLICATE ORDERS
    ==========================================
    */

    const existingOrder = await prisma.order.findUnique({
      where: {
        stripeSessionId: session.id,
      },
    });

    if (existingOrder) {
      if (userId && !existingOrder.clerkUserId) {
        await prisma.order.update({
          where: {
            id: existingOrder.id,
          },
          data: {
            clerkUserId: userId,
          },
        });
      }

      if (clearCart && checkoutType === "cart" && cartId) {
        await prisma.cartItem.deleteMany({
          where: {
            cartId,
            ...(userId
              ? {
                  cart: {
                    userId,
                  },
                }
              : {}),
          },
        });
      }

      return NextResponse.json({
        ok: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        message: "Order already saved. Bag cleared.",
      });
    }

    /*
    ==========================================
    ORDER NUMBER
    ==========================================
    */

    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          not: null,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
      select: {
        orderNumber: true,
      },
    });

    const nextOrderNumber = (lastOrder?.orderNumber || 1000) + 1;

    /*
    ==========================================
    FINANCIALS
    ==========================================
    */

    const amountTotal = session.amount_total || 0;
    const platformFeeCents = Math.round(amountTotal * 0.2);
    const vendorTotalCents = amountTotal - platformFeeCents;
    const netRevenueCents = platformFeeCents;

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    /*
    ==========================================
    BUILD ORDER ITEMS
    ==========================================
    */

    const orderItems = [];

    for (const item of lineItems.data) {
      const rawProduct =
        typeof item.price?.product === "string"
          ? null
          : item.price?.product ?? null;

      const product: Stripe.Product | null = isStripeProduct(rawProduct)
        ? rawProduct
        : null;

      const itemBundleId =
        String(product?.metadata?.bundleId || bundleId || "") || null;

      const itemVendorId = String(
        product?.metadata?.vendorId || vendorId || ""
      );

      if (!itemVendorId) {
        throw new Error("Missing vendorId for order item.");
      }

      const quantity = item.quantity || 1;
      const unitPrice = item.price?.unit_amount || 0;
      const total = unitPrice * quantity;

      /*
      ==========================================
      INVENTORY REDUCTION
      ==========================================
      */

      if (itemBundleId) {
        const bundle = await prisma.bundle.findUnique({
          where: {
            id: itemBundleId,
          },
          select: {
            id: true,
            stock: true,
            title: true,
          },
        });

        if (!bundle) {
          throw new Error("Bundle not found during inventory update.");
        }

        if (bundle.stock < quantity) {
          throw new Error(
            `Not enough stock remaining for ${bundle.title}.`
          );
        }

        await prisma.bundle.update({
          where: {
            id: bundle.id,
          },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      orderItems.push({
        title: item.description || product?.name || "Outfit Bundle",
        quantity,
        unitPrice,
        image: product?.images?.[0] || null,
        outfitId: itemBundleId,
        bundleId: itemBundleId,
        vendorId: itemVendorId,
        vendorPayoutCents: Math.round(total * 0.8),
        payoutStatus: "PENDING",
        fulfillmentStatus: "PENDING",
      });
    }

    /*
    ==========================================
    CREATE ORDER
    ==========================================
    */

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,

        stripeSessionId: session.id,

        stripePaymentId: paymentIntent,

        email:
          session.customer_details?.email ||
          session.customer_email ||
          null,

        clerkUserId: userId || null,

        amountTotal,

        currency: session.currency || "usd",

        status: session.payment_status || "unknown",

        gmvCents: amountTotal,

        platformFeeCents,

        vendorTotalCents,

        stripeFeeCents: 0,

        netRevenueCents,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: true,
      },
    });

    /*
    ==========================================
    CLEAR CART
    ==========================================
    */

    if (clearCart && checkoutType === "cart" && cartId) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId,

          ...(userId
            ? {
                cart: {
                  userId,
                },
              }
            : {}),
        },
      });
    }

    /*
    ==========================================
    SEND EMAIL
    ==========================================
    */

    if (order.email) {
      try {
        await sendOrderConfirmationEmail({
          to: order.email,
          orderNumber: `OIAB-${order.orderNumber}`,
          total: `$${((order.amountTotal || 0) / 100).toFixed(2)}`,
        });
      } catch (emailError) {
        console.error("Order email failed:", emailError);
      }
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items.length,
      message:
        checkoutType === "cart"
          ? "Order saved and bag cleared."
          : "Order saved.",
    });
  } catch (error: any) {
    console.error("save-order POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to save order",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}