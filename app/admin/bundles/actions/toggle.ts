"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBundlePublished(formData: FormData) {
  const id = formData.get("bundleId") as string;

  const bundle = await prisma.bundle.findUnique({ where: { id } });
  if (!bundle) return;

  await prisma.bundle.update({
    where: { id },
    data: { published: !bundle.published },
  });

  revalidatePath("/admin/bundles");
}

export async function toggleBundleFeatured(formData: FormData) {
  const id = formData.get("bundleId") as string;

  const bundle = await prisma.bundle.findUnique({ where: { id } });
  if (!bundle) return;

  await prisma.bundle.update({
    where: { id },
    data: { isFeatured: !bundle.isFeatured },
  });

  revalidatePath("/admin/bundles");
}
