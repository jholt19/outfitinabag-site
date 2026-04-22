"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markVendorPaidForOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const vendorId = String(formData.get("vendorId") || "");
  if (!orderId || !vendorId) return;

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

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payouts");
  revalidatePath(`/vendor/orders?vendorId=${vendorId}`);
  revalidatePath(`/vendor/dashboard?vendorId=${vendorId}`);
}
