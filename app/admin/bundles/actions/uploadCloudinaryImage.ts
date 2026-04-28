"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadCloudinaryImage(formData: FormData) {
  const bundleId = String(formData.get("bundleId") || "");
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  if (!bundleId) throw new Error("Missing bundle ID");
  if (!imageUrl) throw new Error("Missing image URL");

  const uploaded = await cloudinary.uploader.upload(imageUrl, {
    folder: "outfitinabag/bundles",
  });

  await prisma.bundle.update({
    where: { id: bundleId },
    data: { image: uploaded.secure_url },
  });

  revalidatePath("/admin/bundles");
}