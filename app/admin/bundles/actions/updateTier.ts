"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleTier(formData: FormData) {
  const id = formData.get("bundleId") as string;
  const tier = (formData.get("tier") as string)?.trim() || null;

  if (!id) return;

  await prisma.bundle.update({
    where: { id },
    data: { tier: tier || null },
  });

  revalidatePath("/admin/bundles");
}
