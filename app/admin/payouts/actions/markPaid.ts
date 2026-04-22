"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markVendorPaid(formData: FormData) {
  const vendorId = String(formData.get("vendorId") || "");
  if (!vendorId) return;

  // Mark all unpaid payout items for this vendor (paid orders only)
  await prisma.orderItem.updateMany({
    where: {
      vendorId,
      payoutStatus: { not: "PAID" },
      order: { is: { status: "paid" } },
    },
    data: {
      payoutStatus: "PAID",
      paidAt: new Date(),
    },
  });

  // Force UI to refresh
  revalidatePath("/admin/payouts");
  revalidatePath("/admin/metrics");

  // Bounce back so you SEE the update immediately
  redirect("/admin/payouts?marked=1");
}
