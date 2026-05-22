"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPromoCode(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const percentOff = Number(formData.get("percentOff") || 0);
  const amountOffCents = Math.round(
    Number(formData.get("amountOffDollars") || 0) * 100
  );
  const maxUses = Number(formData.get("maxUses") || 0);

  if (!code) {
    throw new Error("Promo code is required.");
  }

  await prisma.promoCode.create({
    data: {
      code,
      description: description || null,
      percentOff: percentOff > 0 ? percentOff : null,
      amountOffCents: amountOffCents > 0 ? amountOffCents : null,
      maxUses: maxUses > 0 ? maxUses : null,
    },
  });

  revalidatePath("/admin/promo");
}

export async function togglePromoCode(formData: FormData) {
  await requireAdmin();

  const promoId = String(formData.get("promoId") || "");

  const promo = await prisma.promoCode.findUnique({
    where: { id: promoId },
  });

  if (!promo) return;

  await prisma.promoCode.update({
    where: { id: promoId },
    data: { isActive: !promo.isActive },
  });

  revalidatePath("/admin/promo");
}