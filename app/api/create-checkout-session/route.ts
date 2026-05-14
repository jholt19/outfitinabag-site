import Stripe from "stripe";
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

export async function GET(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return Response.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const bundleId = url.searchParams.get("bundleId");

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

    if (!bundle.vendor?.stripeAccountId) {
      return Response.json(
        {
          ok: false,
          error:
            "This vendor has not connected Stripe yet. Connect payouts before checkout.",
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const baseUrl = getBaseUrl();

    const platformFeeCents = Math.round(bundle.price * 0.2);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

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
          bundleId: bundle.id,
          vendorId: bundle.vendorId,
          platformFeeCents: String(platformFeeCents),
        },
      },

      metadata: {
        bundleId: bundle.id,
        vendorId: bundle.vendorId,
        platformFeeCents: String(platformFeeCents),
        stripeConnectDestination: bundle.vendor.stripeAccountId,
      },

      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bag?addBundleId=${bundle.id}`,
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