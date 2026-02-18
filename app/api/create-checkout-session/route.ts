import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    // Basic safety
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "No items provided" }, { status: 400 });
    }

    // Convert your items to Stripe line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: it.title ?? "Outfit bundle",
          images: it.image ? [new URL(it.image, "https://www.outfitinabag.com").toString()] : [],
        },
        unit_amount: Number(it.unitPrice ?? it.price ?? 0),
      },
      quantity: Number(it.quantity ?? it.qty ?? 1),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `https://www.outfitinabag.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.outfitinabag.com/bag`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// Optional: if someone GETs the URL in a browser, return a friendly message instead of 405
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST for this endpoint." },
    { status: 405 }
  );
}
