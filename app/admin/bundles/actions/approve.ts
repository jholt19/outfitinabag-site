"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveBundle(formData: FormData) {
  const id = String(formData.get("bundleId") || "");
  if (!id) return;

  await prisma.bundle.update({
    where: { id },
    data: {
      submittedForReview: false,
      published: true,
    },
  });

  revalidatePath("/admin/bundles");
  revalidatePath("/");
  revalidatePath("/bag");
}
