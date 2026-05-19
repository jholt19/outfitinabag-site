import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderItemId = String(body.orderItemId || "");
    const fulfillmentStatus = String(body.fulfillmentStatus || "");
    const trackingCarrier = String(body.trackingCarrier || "").trim();
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (
      !orderItemId ||
      !ALLOWED_STATUSES.includes(fulfillmentStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    await prisma.orderItem.updateMany({
      where: {
        id: orderItemId,
        vendorId: vendor.id,
      },
      data: {
        fulfillmentStatus,
        trackingCarrier: trackingCarrier || null,
        trackingNumber: trackingNumber || null,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error: any) {
    console.error("vendor update order error:", error);

    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}