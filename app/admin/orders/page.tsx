import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: Date) {
  return new Date(date).toLocaleString();
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: {
        include: {
          vendor: true,
          bundle: true,
        },
      },
    },
  });

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (order.amountTotal || 0);
  }, 0);

  const totalPlatformFees = orders.reduce((sum, order) => {
    return sum + (order.platformFeeCents || 0);
  }, 0);

  const totalVendorPayouts = orders.reduce((sum, order) => {
    return sum + (order.vendorTotalCents || 0);
  }, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Admin
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Orders
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Review customer orders, vendor payouts, platform fees, and payment
              status.
            </p>
          </div>

          <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
            {orders.length} Orders
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Gross Sales
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(totalRevenue)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Platform Fees
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(totalPlatformFees)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Vendor Payouts
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(totalVendorPayouts)}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        {orders.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-white p-6">
            <p className="m-0 font-semibold text-black">No orders yet.</p>
            <p className="mt-2 text-sm text-neutral-600">
              Orders will appear here once customers complete checkout.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const firstItem = order.items[0];

            return (
              <div
                key={order.id}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {fmtDate(order.createdAt)}
                    </div>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                      {firstItem?.title ?? "Order"}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-600">
                      Customer: {order.email ?? "—"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      Vendor: {firstItem?.vendor?.name ?? "—"}
                    </p>
                  </div>

                  <div
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                      order.status === "paid"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-black/10 bg-[#f7f5f2] text-black"
                    }`}
                  >
                    {order.status ?? "unknown"}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Total Paid
                    </div>
                    <div className="mt-2 text-lg font-semibold text-black">
                      {fmtCents(order.amountTotal)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Platform Fee
                    </div>
                    <div className="mt-2 text-lg font-semibold text-black">
                      {fmtCents(order.platformFeeCents)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Vendor Payout
                    </div>
                    <div className="mt-2 text-lg font-semibold text-black">
                      {fmtCents(order.vendorTotalCents)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Payout Status
                    </div>
                    <div className="mt-2 text-lg font-semibold text-black">
                      {order.payoutStatus}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Stripe Session
                  </div>

                  <div className="mt-2 break-all font-mono text-xs text-neutral-700">
                    {order.stripeSessionId}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    View Order Details
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}