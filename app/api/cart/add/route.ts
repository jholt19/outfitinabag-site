import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/account");
  }

  const formData = await req.formData();
  const bundleId = String(formData.get("bundleId") || "");

  if (!bundleId) {
    redirect("/outfits?cartError=missingBundleId");
  }

  const bundle = await prisma.bundle.findUnique({
    where: { id: bundleId },
    select: {
      id: true,
      stock: true,
      published: true,
      isActive: true,
    },
  });

  if (!bundle) {
    redirect("/outfits?cartError=bundleNotFound");
  }

  if (!bundle.published || !bundle.isActive) {
    redirect("/outfits?cartError=unavailable");
  }

  if (bundle.stock <= 0) {
    redirect(`/outfits/${bundle.id}?cartError=soldOut`);
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_bundleId: {
        cartId: cart.id,
        bundleId: bundle.id,
      },
    },
  });

  const currentQuantity = existingItem?.quantity ?? 0;

  if (currentQuantity >= bundle.stock) {
    redirect(`/bag?cartError=notEnoughStock`);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: currentQuantity + 1,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        bundleId: bundle.id,
        quantity: 1,
      },
    });
  }

  redirect("/bag?added=true");
}