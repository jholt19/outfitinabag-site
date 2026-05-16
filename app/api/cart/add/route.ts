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
    select: { id: true },
  });

  if (!bundle) {
    redirect("/outfits?cartError=bundleNotFound");
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
        bundleId: bundle.id,
      },
    },
    update: {
      quantity: {
        increment: 1,
      },
    },
    create: {
      cartId: cart.id,
      bundleId: bundle.id,
      quantity: 1,
    },
  });

  redirect("/bag?added=true");
}