"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPromoCode(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();

  const percentOffRaw = String(formData.get("percentOff") || "").trim();
  const amountOffRaw = String(formData.get("amountOffDollars") || "").trim();
  const maxUsesRaw = String(formData.get("maxUses") || "").trim();

  const percentOff = percentOffRaw ? Number(percentOffRaw) : 0;
  const amountOffCents = amountOffRaw
    ? Math.round(Number(amountOffRaw) * 100)
    : 0;
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : 0;

  if (!code) redirect("/admin/promo?error=missingCode");

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    redirect("/admin/promo?error=invalidCode");
  }

  if (percentOff > 0 && amountOffCents > 0) {
    redirect("/admin/promo?error=chooseOneDiscount");
  }

  if (percentOff <= 0 && amountOffCents <= 0) {
    redirect("/admin/promo?error=missingDiscount");
  }

  if (percentOff > 100) {
    redirect("/admin/promo?error=percentTooHigh");
  }

  await prisma.promoCode.upsert({
    where: { code },
    update: {
      description: description || null,
      percentOff: percentOff > 0 ? percentOff : null,
      amountOffCents: amountOffCents > 0 ? amountOffCents : null,
      maxUses: maxUses > 0 ? maxUses : null,
      isActive: true,
    },
    create: {
      code,
      description: description || null,
      percentOff: percentOff > 0 ? percentOff : null,
      amountOffCents: amountOffCents > 0 ? amountOffCents : null,
      maxUses: maxUses > 0 ? maxUses : null,
      isActive: true,
    },
  });

  revalidatePath("/admin/promo");
  redirect("/admin/promo?created=true");
}

export async function togglePromoCode(formData: FormData) {
  await requireAdmin();

  const promoId = String(formData.get("promoId") || "");

  if (!promoId) redirect("/admin/promo?error=missingPromoId");

  const promo = await prisma.promoCode.findUnique({
    where: { id: promoId },
  });

  if (!promo) redirect("/admin/promo?error=promoNotFound");

  await prisma.promoCode.update({
    where: { id: promoId },
    data: { isActive: !promo.isActive },
  });

  revalidatePath("/admin/promo");
  redirect("/admin/promo?updated=true");
}