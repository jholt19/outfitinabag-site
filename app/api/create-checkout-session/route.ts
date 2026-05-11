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

async function createCheckout(bundleId: string) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const bundle = await prisma.bundle.findUnique({
    where: { id: bundleId },
    include: { vendor: true },
  });

  if (!bundle) {
    throw new Error("Bundle not found");
  }

  const stripe = new Stripe(key, {
    apiVersion: "2026-01-28.clover",
  });

  const baseUrl = getBaseUrl();

  return stripe.checkout.sessions.create({
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
    metadata: {
      bundleId: bundle.id,
      vendorId: bundle.vendorId,
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/bag?addBundleId=${bundle.id}`,
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bundleId = url.searchParams.get("bundleId");

    if (!bundleId) {
      return Response.json(
        { ok: false, error: "Missing bundleId." },
        { status: 400 }
      );
    }

    const session = await createCheckout(bundleId);

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return Response.redirect(session.url, 303);
  } catch (err: any) {
    console.error("checkout GET error:", err);

    return Response.json(
      { ok: false, error: err?.message || "Checkout failed." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const bundleId = String(formData.get("bundleId") || "");

    if (!bundleId) {
      return Response.json(
        { ok: false, error: "Missing bundleId." },
        { status: 400 }
      );
    }

    const session = await createCheckout(bundleId);

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return Response.redirect(session.url, 303);
  } catch (err: any) {
    console.error("checkout POST error:", err);

    return Response.json(
      { ok: false, error: err?.message || "Checkout failed." },
      { status: 500 }
    );
  }
}