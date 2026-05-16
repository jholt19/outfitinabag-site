import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ count: 0 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  const count =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return Response.json({ count });
}