"use server";

import { revalidatePath } from "next/cache";
import { BundleTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function updateTier(id: string, tier: string | null) {
  const cleanTier =
    tier && Object.values(BundleTier).includes(tier as BundleTier)
      ? (tier as BundleTier)
      : null;

  await prisma.bundle.update({
    where: { id },
    data: { tier: cleanTier },
  });

  revalidatePath("/admin/bundles");
}