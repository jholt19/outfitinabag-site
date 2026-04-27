"use server";

import { revalidatePath } from "next/cache";
import { BundleTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function updateBundleTier(formData: FormData) {
  const id = String(formData.get("bundleId") || "");
  const tier = formData.get("tier");

  const cleanTier =
    typeof tier === "string" && Object.values(BundleTier).includes(tier as BundleTier)
      ? (tier as BundleTier)
      : null;

  if (!id) {
    throw new Error("Missing bundleId");
  }

  await prisma.bundle.update({
    where: { id },
    data: { tier: cleanTier },
  });

  revalidatePath("/admin/bundles");
}