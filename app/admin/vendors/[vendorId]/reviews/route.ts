import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    vendorId: string;
  }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const { vendorId } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: vendorId,
      status: "approved",
    },
  });

  if (!vendor) {
    return NextResponse.redirect(new URL("/vendors", req.url));
  }

  const formData = await req.formData();

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.redirect(
      new URL(`/vendors/${vendorId}?error=invalid-rating`, req.url)
    );
  }

  await prisma.vendorReview.upsert({
    where: {
      vendorId_userId: {
        vendorId,
        userId,
      },
    },
    update: {
      rating,
      comment: comment || null,
    },
    create: {
      vendorId,
      userId,
      rating,
      comment: comment || null,
    },
  });

  return NextResponse.redirect(
    new URL(`/vendors/${vendorId}?success=review-saved`, req.url)
  );
}