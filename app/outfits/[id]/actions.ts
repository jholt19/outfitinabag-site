"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSavedOutfit(formData: FormData) {
  const { userId } = await auth();

  const bundleId = String(formData.get("bundleId") || "");

  if (!userId) {
    throw new Error("You must be signed in.");
  }

  if (!bundleId) {
    throw new Error("Missing bundle ID.");
  }

  const existing = await prisma.savedOutfit.findUnique({
    where: {
      userId_bundleId: {
        userId,
        bundleId,
      },
    },
  });

  if (existing) {
    await prisma.savedOutfit.delete({
      where: {
        id: existing.id,
      },
    });
  } else {
    await prisma.savedOutfit.create({
      data: {
        userId,
        bundleId,
      },
    });
  }

  revalidatePath(`/outfits/${bundleId}`);
  revalidatePath("/account");
}