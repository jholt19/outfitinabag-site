import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function statusLabel(status: string | null | undefined) {
  return status || "PROCESSING";
}

export default async function AccountOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to view your orders.
          </p>

          <Link
            href="/account"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Account
          </Link>
        </section>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      clerkUserId: userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Account
        </div>

        <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          My Orders
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          Track your OutfitInABag purchases, order status, and shipment details.
        </p>
      </section>

      <section className="mt-8 space-y-5">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
              No orders yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Your completed purchases will appear here.
            </p>

            <Link
              href="/outfits"
              className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Shop Outfits
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-[28px] border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Order
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                    #{order.orderNumber ?? order.id.slice(-6).toUpperCase()}
                  </h2>

                  <p className="mt-2 text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                  {statusLabel(order.status)}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Items
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-black">
                    {order.items.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Total
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-black">
                    {fmtCents(order.amountTotal)}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Tracking
                  </div>

                  <div className="mt-2 text-sm font-semibold text-black">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}