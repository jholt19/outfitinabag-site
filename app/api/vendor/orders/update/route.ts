import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/account");
  }

  const formData = await req.formData();

  const orderItemId = String(formData.get("orderItemId") || "");
  const fulfillmentStatus = String(formData.get("fulfillmentStatus") || "");
  const trackingCarrier = String(formData.get("trackingCarrier") || "").trim();
  const trackingNumber = String(formData.get("trackingNumber") || "").trim();

  if (!orderItemId || !ALLOWED_STATUSES.includes(fulfillmentStatus)) {
    redirect("/vendor/orders");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!vendor) {
    redirect("/vendor/claim");
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

  redirect("/vendor/orders");
}