import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // If your frontend sends items, we support it.
    // If it doesn't, we still create a session with a default line item.
    const items = body?.items;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      Array.isArray(items) && items.length
        ? items.map((i: any) => ({
            quantity: Number(i.quantity || 1),
            price_data: {
              currency: "usd",
              unit_amount: Number(i.unitPrice || i.price || 0),
              product_data: {
                name: String(i.title || "Outfit Bundle"),
                images: i.image ? [String(i.image)] : undefined,
              },
            },
          }))
        : [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: 19900,
                product_data: { name: "OutfitInABag Purchase" },
              },
            },
          ];

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/bag`,
      customer_email: body?.email ? String(body.email) : undefined,
    });

    return Response.json({ ok: true, url: session.url });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// (Optional) helps debugging if you accidentally hit the route with GET in browser
export async function GET() {
  return Response.json(
    { ok: false, error: "Use POST" },
    { status: 405 }
  );
}
