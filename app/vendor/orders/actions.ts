"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function updateFulfillmentStatus(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const orderItemId = String(formData.get("orderItemId") || "");
  const fulfillmentStatus = String(formData.get("fulfillmentStatus") || "");
  const trackingNumber = String(formData.get("trackingNumber") || "").trim();
  const trackingCarrier = String(formData.get("trackingCarrier") || "").trim();

  if (!orderItemId || !ALLOWED_STATUSES.includes(fulfillmentStatus)) {
    throw new Error("Invalid fulfillment status.");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!vendor) {
    throw new Error("Vendor account not connected.");
  }

  await prisma.orderItem.updateMany({
    where: {
      id: orderItemId,
      vendorId: vendor.id,
    },
    data: {
      fulfillmentStatus,
      trackingNumber: trackingNumber || null,
      trackingCarrier: trackingCarrier || null,
    },
  });

  revalidatePath("/vendor/orders");
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
}