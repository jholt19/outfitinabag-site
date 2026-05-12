"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markVendorPaidForOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const vendorId = String(formData.get("vendorId") || "");

  if (!orderId || !vendorId) {
    throw new Error("Missing orderId or vendorId");
  }

  await prisma.orderItem.updateMany({
    where: {
      orderId,
      vendorId,
      payoutStatus: "PENDING",
    },
    data: {
      payoutStatus: "PAID",
      paidAt: new Date(),
    },
  });

  const remainingPendingItems = await prisma.orderItem.count({
    where: {
      orderId,
      payoutStatus: "PENDING",
    },
  });

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payoutStatus: remainingPendingItems === 0 ? "PAID" : "PARTIAL",
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payouts");
  revalidatePath(`/vendor/orders?vendorId=${vendorId}`);
  revalidatePath(`/vendor/dashboard?vendorId=${vendorId}`);
}