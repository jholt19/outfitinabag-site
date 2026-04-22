"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleTitle(formData: FormData) {
  const id = formData.get("bundleId") as string;
  const title = (formData.get("title") as string)?.trim();

  if (!id || !title) return;

  await prisma.bundle.update({
    where: { id },
    data: { title },
  });

  revalidatePath("/admin/bundles");
}
