"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function vendorCreateBundle(formData: FormData) {
  const vendorId = String(formData.get("vendorId") || "");
  const title = String(formData.get("title") || "").trim();
  const occasion = String(formData.get("occasion") || "FORMAL").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const retailValueRaw = String(formData.get("retailValue") || "").trim();
  const retailValue = retailValueRaw ? Number(retailValueRaw) : null;
  const tierRaw = String(formData.get("tier") || "").trim();
  const tier = tierRaw ? tierRaw : null;
  const imageRaw = String(formData.get("image") || "").trim();
  const image = imageRaw ? imageRaw : null;

  if (!vendorId || !title || !description || !price) {
    throw new Error("Missing required fields");
  }

  await prisma.bundle.create({
    data: {
      vendorId,
      title,
      occasion: occasion as any,
      description,
      price: Math.round(price),
      retailValue: retailValue && Number.isFinite(retailValue) ? Math.round(retailValue) : null,
      tier: tier as any,
      image,
      isActive: true,
      published: false,
      isFeatured: false,
    },
  });

  redirect("/vendor/dashboard");
}
