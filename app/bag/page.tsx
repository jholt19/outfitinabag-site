"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addBundleToCart(formData: FormData) {
  const { userId } = await auth();
  const bundleId = String(formData.get("bundleId") || "");

  if (!userId) {
    redirect("/account");
  }

  if (!bundleId) {
    throw new Error("Missing bundle ID.");
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_bundleId: {
        cartId: cart.id,
        bundleId,
      },
    },
    update: {
      quantity: {
        increment: 1,
      },
    },
    create: {
      cartId: cart.id,
      bundleId,
      quantity: 1,
    },
  });

  revalidatePath("/bag");
  revalidatePath(`/outfits/${bundleId}`);

  redirect("/bag");
}

export async function removeCartItem(formData: FormData) {
  const { userId } = await auth();
  const cartItemId = String(formData.get("cartItemId") || "");

  if (!userId || !cartItemId) return;

  await prisma.cartItem.deleteMany({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
  });

  revalidatePath("/bag");
}

export async function updateCartItemQuantity(formData: FormData) {
  const { userId } = await auth();
  const cartItemId = String(formData.get("cartItemId") || "");
  const quantity = Number(formData.get("quantity") || 1);

  if (!userId || !cartItemId) return;

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        cart: {
          userId,
        },
      },
    });
  } else {
    await prisma.cartItem.updateMany({
      where: {
        id: cartItemId,
        cart: {
          userId,
        },
      },
      data: {
        quantity,
      },
    });
  }

  revalidatePath("/bag");
}