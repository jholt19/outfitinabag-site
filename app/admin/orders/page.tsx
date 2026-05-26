import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: Date) {
  return new Date(date).toLocaleString();
}

function fulfillmentColor(status?: string | null) {
  switch (status) {
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "shipped":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "processing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-black/10 bg-[#f7f5f2] text-black";
  }
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },

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
              Manage customer purchases, fulfillment, tracking, payouts, and
              shipment activity.
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
            <p className="m-0 font-semibold text-black">
              No orders yet.
            </p>

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
                className="rounded-[30px] border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                        {fmtDate(order.createdAt)}
                      </div>

                      <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                        #{order.orderNumber ?? order.id.slice(0, 8)}
                      </div>
                    </div>

                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
                      {firstItem?.title ?? "Order"}
                    </h2>

                    <div className="mt-4 space-y-1 text-sm text-neutral-600">
                      <p>
                        Customer:{" "}
                        <span className="font-medium text-black">
                          {order.email ?? "—"}
                        </span>
                      </p>

                      <p>
                        Vendor:{" "}
                        <span className="font-medium text-black">
                          {firstItem?.vendor?.name ?? "—"}
                        </span>
                      </p>

                      <p>
                        Items:{" "}
                        <span className="font-medium text-black">
                          {order.items.length}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                        order.status === "paid"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-black/10 bg-[#f7f5f2] text-black"
                      }`}
                    >
                      Payment: {order.status ?? "unknown"}
                    </div>

                    <div
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${fulfillmentColor(
                        firstItem?.fulfillmentStatus
                      )}`}
                    >
                      Fulfillment:{" "}
                      {firstItem?.fulfillmentStatus ?? "pending"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
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

                    <div className="mt-2 text-lg font-semibold capitalize text-black">
                      {order.payoutStatus ?? "pending"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Shipment Tracking
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <div className="text-neutral-500">
                          Tracking Number
                        </div>

                        <div className="mt-1 font-medium text-black">
                          {firstItem?.trackingNumber ?? "Not Added"}
                        </div>
                      </div>

                      <div>
                        <div className="text-neutral-500">
                          Carrier
                        </div>

                        <div className="mt-1 font-medium text-black">
                          {firstItem?.trackingCarrier ?? "Not Added"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Stripe Session
                    </div>

                    <div className="mt-3 break-all rounded-xl bg-white p-3 font-mono text-xs text-neutral-700">
                      {order.stripeSessionId}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Manage Order
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