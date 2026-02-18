import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getBaseUrl(req: Request) {
  // Prefer the request origin (best on Vercel), fallback to env var, then localhost
  const origin = req.headers.get("origin");
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const base = origin || envUrl || "http://localhost:3000";

  // If someone accidentally saved without https://, fix it
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    return `https://${base}`;
  }
  return base;
}

export async function POST(req: Request) {
  try {
    const baseUrl = getBaseUrl(req);

    const body = await req.json().catch(() => ({}));
    const { items } = body as { items?: { title: string; unitPrice: number; quantity: number }[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ ok: false, error: "No items provided" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((it) => ({
        quantity: it.quantity ?? 1,
        price_data: {
          currency: "usd",
          unit_amount: it.unitPrice,
          product_data: { name: it.title },
        },
      })),
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bag`,
    });

    return Response.json({ ok: true, url: session.url });
  } catch (err: any) {
    // IMPORTANT: Always return JSON so your frontend doesn't crash on r.json()
    return Response.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
