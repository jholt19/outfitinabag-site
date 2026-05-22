"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleInventory(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const bundleId = String(formData.get("bundleId") || "");
  const stock = Number(formData.get("stock") || 0);
  const lowStockThreshold = Number(formData.get("lowStockThreshold") || 5);

  if (!bundleId) {
    throw new Error("Missing bundle ID.");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!vendor) {
    throw new Error("Vendor account not connected.");
  }

  await prisma.bundle.updateMany({
    where: {
      id: bundleId,
      vendorId: vendor.id,
    },
    data: {
      stock: Math.max(0, stock),
      lowStockThreshold: Math.max(0, lowStockThreshold),
    },
  });

  revalidatePath("/vendor/dashboard");
  revalidatePath("/vendor/orders");
  revalidatePath("/outfits");
}