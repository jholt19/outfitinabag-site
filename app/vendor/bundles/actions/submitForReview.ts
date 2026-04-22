"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitBundleForReview(formData: FormData) {
  const bundleId = String(formData.get("bundleId") || "");
  const vendorId = String(formData.get("vendorId") || "");

  if (!bundleId) return;

  await prisma.bundle.update({
    where: { id: bundleId },
    data: { submittedForReview: true },
  });

  revalidatePath(`/vendor/dashboard?vendorId=${vendorId}`);
  revalidatePath("/vendor/dashboard");
  revalidatePath("/admin/bundles");
}
