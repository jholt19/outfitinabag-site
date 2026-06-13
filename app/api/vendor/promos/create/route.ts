import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  if (!vendor) {
    return NextResponse.redirect(new URL("/vendor/claim", req.url));
  }

  const formData = await req.formData();

  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();

  const description = String(formData.get("description") || "").trim();

  const percentOffRaw = String(formData.get("percentOff") || "").trim();
  const maxUsesRaw = String(formData.get("maxUses") || "").trim();

  const percentOff = percentOffRaw ? Number(percentOffRaw) : null;
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;

  if (!code) {
    return NextResponse.redirect(
      new URL("/vendor/promos?error=missing-code", req.url)
    );
  }

  if (!percentOff || percentOff < 1 || percentOff > 90) {
    return NextResponse.redirect(
      new URL("/vendor/promos?error=invalid-percent", req.url)
    );
  }

  const existingPromo = await prisma.promoCode.findUnique({
    where: {
      code,
    },
  });

  if (existingPromo) {
    return NextResponse.redirect(
      new URL("/vendor/promos?error=code-exists", req.url)
    );
  }

  await prisma.promoCode.create({
    data: {
      vendorId: vendor.id,
      code,
      description: description || null,
      percentOff,
      maxUses,
      isActive: true,
    },
  });

  return NextResponse.redirect(
    new URL("/vendor/promos?success=created", req.url)
  );
}