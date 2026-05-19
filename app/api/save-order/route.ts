import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

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

    const amountTotal = session.amount_total || 0;
    const platformFeeCents = Math.round(amountTotal * 0.2);
    const vendorTotalCents = amountTotal - platformFeeCents;
    const netRevenueCents = platformFeeCents;

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    const orderItems = lineItems.data.map((item) => {
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

      return {
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
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        stripeSessionId: session.id,
        stripePaymentId: paymentIntent,
        email: session.customer_details?.email || session.customer_email || null,
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