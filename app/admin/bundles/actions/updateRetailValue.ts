"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleRetailValue(formData: FormData) {
  const id = formData.get("bundleId") as string;
  const raw = (formData.get("retailValue") as string)?.trim();

  if (!id) return;

  const value = raw ? Number(raw) : null;
  const retailValue = value && Number.isFinite(value) && value > 0 ? Math.round(value) : null;

  await prisma.bundle.update({
    where: { id },
    data: { retailValue },
  });

  revalidatePath("/admin/bundles");
}
