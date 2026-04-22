import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
  }

  const items = await prisma.orderItem.findMany({
    where: { vendorId },
    include: { order: true },
  });

  let total = 0;
  let pending = 0;
  let paid = 0;

  for (const i of items) {
    const amount = i.vendorPayoutCents || 0;
    total += amount;

    if (i.order?.payoutStatus === "PAID") paid += amount;
    else pending += amount;
  }

  return NextResponse.json({
    total,
    pending,
    paid,
    count: items.length,
  });
}
