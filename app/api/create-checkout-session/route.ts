import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function createStripeCoupon(
  stripe: Stripe,
  promo: {
    code: string;
    percentOff: number | null;
    amountOffCents: number | null;
  }
) {
  const coupon = await stripe.coupons.create({
    duration: "once",
    name: promo.code,
    ...(promo.percentOff
      ? { percent_off: promo.percentOff }
      : {
          amount_off: promo.amountOffCents || 0,
          currency: "usd",
        }),
  });

  return coupon.id;
}

export async function GET(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return Response.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const url = new URL(req.url);

    const bundleId = url.searchParams.get("bundleId");
    const cartCheckout = url.searchParams.get("cart") === "true";

    const promoCodeInput = String(url.searchParams.get("promo") || "")
      .trim()
      .toUpperCase();

    const baseUrl = getBaseUrl();

    const { userId } = await auth();
    const user = await currentUser();

    const userEmail =
      user?.emailAddresses?.[0]?.emailAddress || undefined;

    let promo = null;

    if (promoCodeInput) {
      promo = await prisma.promoCode.findFirst({
        where: {
          code: promoCodeInput,
          isActive: true,
        },
      });

      if (!promo) {
        return Response.redirect(`${baseUrl}/bag?promoError=invalid`, 303);
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return Response.redirect(`${baseUrl}/bag?promoError=maxUses`, 303);
      }

      if (promo.startsAt && new Date() < promo.startsAt) {
        return Response.redirect(`${baseUrl}/bag?promoError=notStarted`, 303);
      }

      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return Response.redirect(`${baseUrl}/bag?promoError=expired`, 303);
      }
    }

    if (cartCheckout) {
      if (!userId) {
        return Response.redirect(`${baseUrl}/account`, 303);
      }

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              bundle: {
                include: {
                  vendor: true,
                },
              },
            },
          },
        },
      });

      const items = cart?.items ?? [];

      if (items.length === 0) {
        return Response.json(
          { ok: false, error: "Your cart is empty." },
          { status: 400 }
        );
      }

      for (const item of items) {
        const bundle = item.bundle;

        if (!bundle) {
          return Response.redirect(
            `${baseUrl}/bag?cartError=missingBundle`,
            303
          );
        }

        if (!bundle.published || !bundle.isActive) {
          return Response.redirect(
            `${baseUrl}/bag?cartError=unavailable`,
            303
          );
        }

        if (bundle.stock <= 0) {
          return Response.redirect(`${baseUrl}/bag?cartError=soldOut`, 303);
        }

        if (item.quantity > bundle.stock) {
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: bundle.stock },
          });

          return Response.redirect(
            `${baseUrl}/bag?cartError=stockAdjusted`,
            303
          );
        }
      }

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
        items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.bundle.price,
            product_data: {
              name: item.bundle.title,
              images:
                item.bundle.image && item.bundle.image.startsWith("http")
                  ? [item.bundle.image]
                  : [],
              metadata: {
                bundleId: item.bundle.id,
                vendorId: item.bundle.vendorId,
                cartItemId: item.id,
              },
            },
          },
        }));

      const subtotal = items.reduce((sum, item) => {
        return sum + item.bundle.price * item.quantity;
      }, 0);

      const vendorIds = Array.from(
        new Set(items.map((item) => item.bundle.vendorId))
      );

      const singleVendor =
        vendorIds.length === 1 ? items[0]?.bundle.vendor : null;

      let estimatedDiscountAmount = 0;

      if (promo) {
        if (promo.percentOff) {
          estimatedDiscountAmount = Math.round(
            subtotal * (promo.percentOff / 100)
          );
        } else if (promo.amountOffCents) {
          estimatedDiscountAmount = promo.amountOffCents;
        }

        estimatedDiscountAmount = Math.min(
          estimatedDiscountAmount,
          subtotal
        );
      }

      const discountedSubtotal = Math.max(
        0,
        subtotal - estimatedDiscountAmount
      );

      const platformFeeCents = Math.round(discountedSubtotal * 0.2);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: userEmail,
        line_items,
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/bag`,

        metadata: {
          checkoutType: "cart",
          cartId: cart?.id ?? "",
          userId,
          vendorIds: vendorIds.join(","),
          promoCode: promo?.code || "",
          discountAmount: String(estimatedDiscountAmount),
          platformFeeCents: String(platformFeeCents),
        },
      };

      if (promo) {
        sessionParams.discounts = [
          {
            coupon: await createStripeCoupon(stripe, {
              code: promo.code,
              percentOff: promo.percentOff,
              amountOffCents: promo.amountOffCents,
            }),
          },
        ];
      }

      if (singleVendor?.stripeAccountId) {
        sessionParams.payment_intent_data = {
          application_fee_amount: platformFeeCents,
          transfer_data: {
            destination: singleVendor.stripeAccountId,
          },
          metadata: {
            checkoutType: "cart",
            cartId: cart?.id ?? "",
            userId,
            vendorId: singleVendor.id,
            promoCode: promo?.code || "",
            discountAmount: String(estimatedDiscountAmount),
            platformFeeCents: String(platformFeeCents),
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      if (!session.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      if (promo) {
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return Response.redirect(session.url, 303);
    }

    if (!bundleId) {
      return Response.json(
        { ok: false, error: "Missing bundleId." },
        { status: 400 }
      );
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { vendor: true },
    });

    if (!bundle) {
      return Response.json(
        { ok: false, error: "Bundle not found." },
        { status: 404 }
      );
    }

    if (!bundle.published || !bundle.isActive) {
      return Response.json(
        { ok: false, error: "This outfit is currently unavailable." },
        { status: 400 }
      );
    }

    if (bundle.stock <= 0) {
      return Response.json(
        { ok: false, error: "This outfit is sold out." },
        { status: 400 }
      );
    }

    if (!bundle.vendor?.stripeAccountId) {
      return Response.json(
        { ok: false, error: "This vendor has not connected Stripe yet." },
        { status: 400 }
      );
    }

    const platformFeeCents = Math.round(bundle.price * 0.2);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: bundle.price,
            product_data: {
              name: bundle.title,
              images:
                bundle.image && bundle.image.startsWith("http")
                  ? [bundle.image]
                  : [],
              metadata: {
                bundleId: bundle.id,
                vendorId: bundle.vendorId,
              },
            },
          },
        },
      ],

      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: bundle.vendor.stripeAccountId,
        },
        metadata: {
          checkoutType: "single",
          bundleId: bundle.id,
          vendorId: bundle.vendorId,
          platformFeeCents: String(platformFeeCents),
        },
      },

      metadata: {
        checkoutType: "single",
        bundleId: bundle.id,
        vendorId: bundle.vendorId,
        platformFeeCents: String(platformFeeCents),
      },

      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bag`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return Response.redirect(session.url, 303);
  } catch (error: any) {
    console.error("create-checkout-session GET error:", error);

    return Response.json(
      {
        ok: false,
        error: error?.message || "Checkout failed.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return Response.json(
    { ok: false, error: "Use GET checkout link." },
    { status: 405 }
  );
}