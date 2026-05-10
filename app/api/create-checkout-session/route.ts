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

type CheckoutItem = {
  id: string;
  title: string;
  image?: string | null;
  price: number;
  quantity: number;
};

async function getCheckoutItems(req: Request): Promise<CheckoutItem[]> {
  const contentType = req.headers.get("content-type") || "";

  // Form submit from bag page
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    const bundleId = String(formData.get("bundleId") || "");

    if (!bundleId) return [];

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    });

    if (!bundle) return [];

    return [
      {
        id: bundle.id,
        title: bundle.title,
        image: bundle.image,
        price: bundle.price,
        quantity: 1,
      },
    ];
  }

  // JSON submit from old cart/client flow
  const body = await req.json().catch(() => null);
  const bundleId = body?.bundleId;

  if (bundleId) {
    const bundle = await prisma.bundle.findUnique({
      where: { id: String(bundleId) },
    });

    if (!bundle) return [];

    return [
      {
        id: bundle.id,
        title: bundle.title,
        image: bundle.image,
        price: bundle.price,
        quantity: 1,
      },
    ];
  }

  const rawItems = body?.items || body?.cart || [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item: any) => ({
    id: String(item.id || ""),
    title: String(item.title || "Outfit Bundle"),
    image: item.image || null,
    price: Number(item.price ?? item.unitPrice ?? item.amount),
    quantity: Number(item.qty ?? item.quantity ?? 1) || 1,
  }));
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return Response.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY in env." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const baseUrl = getBaseUrl();
    const items = await getCheckoutItems(req);

    if (!items.length) {
      return Response.json(
        { ok: false, error: "No cart items received." },
        { status: 400 }
      );
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => {
        if (!Number.isFinite(item.price) || item.price <= 0) {
          throw new Error(`Bad price for "${item.title}".`);
        }

        const imageUrl =
          item.image && item.image.startsWith("http")
            ? item.image
            : item.image
            ? `${baseUrl}${item.image.startsWith("/") ? "" : "/"}${item.image}`
            : undefined;

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price),
            product_data: {
              name: item.title,
              images: imageUrl ? [imageUrl] : [],
              metadata: {
                bundleId: item.id,
                outfitId: item.id,
              },
            },
          },
        };
      });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bag`,
      metadata: {
        bundleIds: items.map((item) => item.id).join(","),
      },
    });

    const contentType = req.headers.get("content-type") || "";

    // Browser form submit should redirect straight to Stripe
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return Response.redirect(session.url || baseUrl, 303);
    }

    return Response.json({
      ok: true,
      url: session.url,
    });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);

    return Response.json(
      {
        ok: false,
        error: err?.message || "Server error creating checkout session.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    { ok: false, error: "Use POST" },
    { status: 405 }
  );
}