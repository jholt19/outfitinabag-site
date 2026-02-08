import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

    const token = String(req.query.token || "");
    if (!process.env.ADMIN_TOKEN) return res.status(500).json({ error: "Missing ADMIN_TOKEN in .env.local" });
    if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });

    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });

    const { orderId, paymentIntentId, amount } = req.body as {
      orderId?: string;
      paymentIntentId?: string;
      amount?: number; // cents (optional)
    };

    if (!orderId) return res.status(400).json({ error: "Missing orderId" });
    if (!paymentIntentId) return res.status(400).json({ error: "Missing paymentIntentId" });

    // Prevent refunding twice (simple safety)
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return res.status(404).json({ error: "Order not found" });
    if (existing.refundId) return res.status(400).json({ error: "Order already refunded" });

    // Create refund in Stripe
    const refund = await stripe.refunds.create(
      amount && amount > 0
        ? { payment_intent: paymentIntentId, amount }
        : { payment_intent: paymentIntentId }
    );

    // Save refund info in Neon
    await prisma.order.update({
      where: { id: orderId },
      data: {
        refundId: refund.id,
        refundStatus: refund.status || "unknown",
        refundedAt: new Date(),
        refundAmount: amount && amount > 0 ? amount : existing.amountTotal ?? null,
        status: "refunded", // optional: keep or remove if you prefer
      },
    });

    return res.status(200).json({ ok: true, refund });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "Refund failed" });
  }
}
