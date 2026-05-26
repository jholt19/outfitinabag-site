import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
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
      return NextResponse.redirect(
        new URL("/sign-in", req.url)
      );
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        clerkUserId: userId,
      },
    });

    if (!vendor) {
      return NextResponse.redirect(
        new URL("/vendor/claim", req.url)
      );
    }

    const formData = await req.formData();

    const orderItemId = String(
      formData.get("orderItemId") || ""
    );

    const fulfillmentStatus = String(
      formData.get("fulfillmentStatus") || "PENDING"
    ).toUpperCase();

    const trackingNumber = String(
      formData.get("trackingNumber") || ""
    ).trim();

    const trackingCarrier = String(
      formData.get("trackingCarrier") || ""
    ).trim();

    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.redirect(
        new URL(
          "/vendor/orders?error=invalid-status",
          req.url
        )
      );
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        vendorId: vendor.id,
      },
    });

    if (!orderItem) {
      return NextResponse.redirect(
        new URL(
          "/vendor/orders?error=not-found",
          req.url
        )
      );
    }

    await prisma.orderItem.update({
      where: {
        id: orderItem.id,
      },

      data: {
        fulfillmentStatus,
        trackingNumber:
          trackingNumber.length > 0
            ? trackingNumber
            : null,

        trackingCarrier:
          trackingCarrier.length > 0
            ? trackingCarrier
            : null,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/vendor/orders?success=updated",
        req.url
      )
    );
  } catch (error) {
    console.error(
      "[VENDOR_ORDER_UPDATE_ERROR]",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/vendor/orders?error=server-error",
        req.url
      )
    );
  }
}