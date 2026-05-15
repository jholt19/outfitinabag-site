import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in to view your account.
          </h1>

          <p className="mt-3 text-neutral-600">
            Once you sign in, your orders and saved outfits will appear here.
          </p>
        </section>
      </main>
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const orders = email
    ? await prisma.order.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: {
              bundle: true,
              vendor: true,
            },
          },
        },
      })
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          My Account
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Welcome back.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          {email || "Your OutfitInABag customer account"}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/outfits"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Shop Outfits
          </Link>

          <Link
            href="/orders"
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            View Orders
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Orders
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {orders.length}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Total Spent
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(
              orders.reduce((sum, order) => sum + (order.amountTotal || 0), 0)
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Saved Outfits
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            Soon
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Recent Orders
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Order History
            </h2>
          </div>

          <Link
            href="/orders"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
              No orders found for this email yet.
            </div>
          ) : (
            orders.map((order) => {
              const firstItem = order.items[0];

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-black">
                        {firstItem?.title ?? "Order"}
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>

                      <div className="mt-2 text-sm text-neutral-600">
                        Vendor: {firstItem?.vendor?.name ?? "—"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-black">
                        {fmtCents(order.amountTotal)}
                      </div>

                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        {order.status ?? "unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}