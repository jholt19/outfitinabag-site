import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session_id = String(req.query.session_id || "");

  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: `Session not paid: ${session.payment_status}` });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, { limit: 100 });

    const order = await prisma.order.upsert({
      where: { stripeSessionId: session_id },
      update: {
        stripePaymentId: session.payment_intent?.toString() || null,
        email: session.customer_details?.email || null,
        amountTotal: session.amount_total || null,
        currency: session.currency || null,
        status: session.payment_status || null,
      },
      create: {
        stripeSessionId: session_id,
        stripePaymentId: session.payment_intent?.toString() || null,
        email: session.customer_details?.email || null,
        amountTotal: session.amount_total || null,
        currency: session.currency || null,
        status: session.payment_status || null,
        items: {
          create: lineItems.data.map((li) => ({
            title: li.description || "Item",
            quantity: li.quantity || 1,
            unitPrice: li.price?.unit_amount ?? null,
          })),
        },
      },
      include: { items: true },
    });

    return res.status(200).json({ ok: true, order });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
