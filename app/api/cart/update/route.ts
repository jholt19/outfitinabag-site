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
  const quantity = Number(formData.get("quantity") || 1);

  if (!cartItemId) {
    redirect("/bag");
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        cart: { userId },
      },
    });
  } else {
    await prisma.cartItem.updateMany({
      where: {
        id: cartItemId,
        cart: { userId },
      },
      data: { quantity },
    });
  }

  redirect("/bag");
}