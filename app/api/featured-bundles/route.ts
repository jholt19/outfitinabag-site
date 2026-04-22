import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const bundles = await prisma.bundle.findMany({
    where: { published: true, isFeatured: true },
    take: 12,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      occasion: true,
      price: true,
      retailValue: true,
      image: true,
      tier: true,
    },
  });

  return NextResponse.json({ bundles });
}
