import Stripe from "stripe";

export const runtime = "nodejs";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

type IncomingCartItem = {
  id?: string;          // bundleId
  title?: string;
  image?: string;
  qty?: number;
  quantity?: number;
  price?: number;       // cents
  unitPrice?: number;   // cents
  amount?: number;      // cents
};

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return Response.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY in env." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

    const body = await req.json().catch(() => null);
    const items: IncomingCartItem[] = body?.items || body?.cart || [];

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ ok: false, error: "No cart items received." }, { status: 400 });
    }

    const baseUrl = getBaseUrl();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => {
      const name = String(it.title || "Outfit Bundle");
      const qty = Number(it.qty ?? it.quantity ?? 1) || 1;

      const centsRaw = it.price ?? it.unitPrice ?? it.amount;
      const unit_amount = Number(centsRaw);

      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error(`Bad price for "${name}". Got: ${String(centsRaw)}`);
      }

      const img = it.image ? String(it.image) : "";
      const imageUrl =
        img && img.startsWith("http")
          ? img
          : img
          ? `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`
          : undefined;

      const bundleId = String(it.id || "");

      return {
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(unit_amount),
          product_data: {
            name,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              outfitId: bundleId, // legacy
              bundleId,           // ✅ used by /api/save-order
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
    });

    return Response.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Server error creating checkout session." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ ok: false, error: "Use POST" }, { status: 405 });
}
