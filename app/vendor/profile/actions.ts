"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function updateVendorProfile(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  if (!vendor) {
    redirect("/vendor/claim");
  }

  await prisma.vendor.update({
    where: {
      id: vendor.id,
    },
    data: {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim() || null,
      logo: String(formData.get("logo") || "").trim() || null,
      bannerImage: String(formData.get("bannerImage") || "").trim() || null,
      instagram: String(formData.get("instagram") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
    },
  });

  redirect("/vendor/profile?success=updated");
}