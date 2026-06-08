import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to leave a review." },
        { status: 401 }
      );
    }

    const { vendorId } = await params;

    const formData = await req.formData();

    const rating = Number(formData.get("rating"));
    const comment = String(formData.get("comment") || "").trim();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found." },
        { status: 404 }
      );
    }

    await prisma.vendorReview.create({
      data: {
        vendorId,
        userId,
        rating,
        comment,
      },
    });

    return NextResponse.redirect(
      new URL(`/vendors/${vendorId}?review=success`, req.url)
    );
  } catch (error) {
    console.error("Vendor review error:", error);

    return NextResponse.json(
      { error: "Failed to create review." },
      { status: 500 }
    );
  }
}