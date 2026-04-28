"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBundleImage(formData: FormData) {
  const id = String(formData.get("bundleId") || "");
  const image = String(formData.get("image") || "").trim();

  if (!id) {
    throw new Error("Missing bundle ID");
  }

  /*
    For now:
    We support image URL or uploaded hosted image path.

    Next upgrade:
    Cloudinary / UploadThing direct uploads

    Example accepted values:
    /outfits/form-1.jpg
    https://images.unsplash.com/...
    https://res.cloudinary.com/...
  */

  if (
    image &&
    !image.startsWith("/") &&
    !image.startsWith("http://") &&
    !image.startsWith("https://")
  ) {
    throw new Error(
      "Image must start with / or http:// or https://"
    );
  }

  await prisma.bundle.update({
    where: { id },
    data: {
      image: image || null,
    },
  });

  revalidatePath("/admin/bundles");
  revalidatePath("/outfits");
}