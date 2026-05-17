"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function removeCartItem(formData: FormData) {
  const { userId } = await auth();
  const cartItemId = String(formData.get("cartItemId") || "");

  if (!userId || !cartItemId) {
    redirect("/bag");
  }

  await prisma.cartItem.deleteMany({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
  });

  revalidatePath("/bag");
  redirect("/bag");
}

export async function updateCartItemQuantity(formData: FormData) {
  const { userId } = await auth();
  const cartItemId = String(formData.get("cartItemId") || "");
  const quantity = Number(formData.get("quantity") || 1);

  if (!userId || !cartItemId) {
    redirect("/bag");
  }

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
  redirect("/bag");
}