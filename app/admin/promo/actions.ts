"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function cleanCode(value: FormDataEntryValue | null) {
  return String(value || "").trim().toUpperCase();
}

function cleanNumber(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  return raw ? Number(raw) : 0;
}

function validatePromoInput({
  code,
  percentOff,
  amountOffCents,
}: {
  code: string;
  percentOff: number;
  amountOffCents: number;
}) {
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
}

export async function createPromoCode(formData: FormData) {
  await requireAdmin();

  const code = cleanCode(formData.get("code"));
  const description = String(formData.get("description") || "").trim();

  const percentOff = cleanNumber(formData.get("percentOff"));
  const amountOffCents = Math.round(
    cleanNumber(formData.get("amountOffDollars")) * 100
  );
  const maxUses = cleanNumber(formData.get("maxUses"));

  validatePromoInput({ code, percentOff, amountOffCents });

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

export async function updatePromoCode(formData: FormData) {
  await requireAdmin();

  const promoId = String(formData.get("promoId") || "").trim();
  const code = cleanCode(formData.get("code"));
  const description = String(formData.get("description") || "").trim();

  const percentOff = cleanNumber(formData.get("percentOff"));
  const amountOffCents = Math.round(
    cleanNumber(formData.get("amountOffDollars")) * 100
  );
  const maxUses = cleanNumber(formData.get("maxUses"));

  if (!promoId) redirect("/admin/promo?error=missingPromoId");

  validatePromoInput({ code, percentOff, amountOffCents });

  await prisma.promoCode.update({
    where: { id: promoId },
    data: {
      code,
      description: description || null,
      percentOff: percentOff > 0 ? percentOff : null,
      amountOffCents: amountOffCents > 0 ? amountOffCents : null,
      maxUses: maxUses > 0 ? maxUses : null,
    },
  });

  revalidatePath("/admin/promo");
  redirect("/admin/promo?updated=true");
}

export async function togglePromoCode(formData: FormData) {
  await requireAdmin();

  const promoId = String(formData.get("promoId") || "").trim();

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

export async function deletePromoCode(formData: FormData) {
  await requireAdmin();

  const promoId = String(formData.get("promoId") || "").trim();

  if (!promoId) redirect("/admin/promo?error=missingPromoId");

  await prisma.promoCode.delete({
    where: { id: promoId },
  });

  revalidatePath("/admin/promo");
  redirect("/admin/promo?deleted=true");
}