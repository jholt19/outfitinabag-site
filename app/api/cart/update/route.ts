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
  const cartItemId = String(formData.get("cartItemId") || "");
  const requestedQuantity = Number(formData.get("quantity") || 1);

  if (!cartItemId) {
    redirect("/bag");
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
    include: {
      bundle: {
        select: {
          id: true,
          stock: true,
          published: true,
          isActive: true,
        },
      },
    },
  });

  if (!cartItem) {
    redirect("/bag?cartError=itemNotFound");
  }

  if (requestedQuantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    redirect("/bag?removed=true");
  }

  if (!cartItem.bundle.published || !cartItem.bundle.isActive) {
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    redirect("/bag?cartError=unavailable");
  }

  if (cartItem.bundle.stock <= 0) {
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    redirect("/bag?cartError=soldOut");
  }

  const safeQuantity = Math.min(requestedQuantity, cartItem.bundle.stock);

  await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },
    data: {
      quantity: safeQuantity,
    },
  });

  if (requestedQuantity > cartItem.bundle.stock) {
    redirect("/bag?cartError=notEnoughStock");
  }

  redirect("/bag?updated=true");
}