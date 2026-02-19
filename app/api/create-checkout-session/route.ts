import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getBaseUrl() {
  // Production (Vercel)
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  // Vercel preview fallback
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Local fallback
  return "http://localhost:3000";
}

type IncomingCartItem = {
  id?: string;
  title?: string;
  image?: string;
  qty?: number;
  quantity?: number;
  // different code paths sometimes name price differently:
  price?: number;       // cents
  unitPrice?: number;   // cents
  amount?: number;      // cents
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const items: IncomingCartItem[] = body?.items || body?.cart || [];

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ ok: false, error: "No cart items received." }, { status: 400 });
    }

    const baseUrl = getBaseUrl();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => {
      const name = String(it.title || "Outfit Bundle");
      const qty = Number(it.qty ?? it.quantity ?? 1) || 1;

      // ✅ IMPORTANT: find the unit amount (in cents)
      const centsRaw = it.price ?? it.unitPrice ?? it.amount;
      const unit_amount = Number(centsRaw);

      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error(`Bad price for "${name}". Got: ${String(centsRaw)}`);
      }

      const img = it.image ? String(it.image) : undefined;
      const imageUrl =
        img && img.startsWith("http")
          ? img
          : img
          ? `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`
          : undefined;

      return {
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(unit_amount),
          product_data: {
            name,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              outfitId: String(it.id || ""),
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
    return Response.json(
      { ok: false, error: err?.message || "Server error creating checkout session." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // If someone visits the route in browser, avoid 405 confusion
  return Response.json({ ok: false, error: "Use POST" }, { status: 405 });
}
