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
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const vendorId = url.searchParams.get("vendorId");

    if (!vendorId) {
      return Response.json(
        { error: "Missing vendorId in URL." },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return Response.json({ error: "Vendor not found." }, { status: 404 });
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    let stripeAccountId = vendor.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: vendor.email,
        business_profile: {
          name: vendor.name,
        },
        metadata: {
          vendorId: vendor.id,
        },
      });

      stripeAccountId = account.id;

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          stripeAccountId,
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeOnboardingDone:
            account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled,
        },
      });
    } else {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeOnboardingDone:
            account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled,
        },
      });
    }

    const baseUrl = getBaseUrl();

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/vendor/connect?vendorId=${vendor.id}`,
      return_url: `${baseUrl}/vendor/dashboard?vendorId=${vendor.id}&stripe=connected`,
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