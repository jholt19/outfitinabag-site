import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Missing email" });

    const orders = await prisma.order.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 25,
    });

    return res.status(200).json({ ok: true, orders });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Failed" });
  }
}
