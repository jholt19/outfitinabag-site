import Stripe from "stripe";

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

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return Response.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const account = await stripe.accounts.create({
      type: "express",
    });

    const baseUrl = getBaseUrl();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/vendor/connect`,
      return_url: `${baseUrl}/vendor/dashboard`,
      type: "account_onboarding",
    });

    return Response.redirect(accountLink.url, 303);
  } catch (error: any) {
    console.error("Stripe Connect error:", error);

    return Response.json(
      {
        error: error?.message || "Failed to create Stripe Connect account.",
      },
      { status: 500 }
    );
  }
}