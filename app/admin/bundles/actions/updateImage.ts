"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleImage(formData: FormData) {
  const id = formData.get("bundleId") as string;
  const image = (formData.get("image") as string)?.trim();

  if (!id) return;

  await prisma.bundle.update({
    where: { id },
    data: { image: image ? image : null },
  });

  revalidatePath("/admin/bundles");
}
