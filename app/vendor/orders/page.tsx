import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FULFILLMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fulfillmentBadge(status: string) {
  const styles =
    status === "DELIVERED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "SHIPPED"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : status === "PROCESSING"
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : status === "CANCELLED"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles}`}
    >
      {status}
    </span>
  );
}

export default async function VendorOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to view vendor orders.
          </p>
        </section>
      </main>
    );
  }

  const vendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
  });

  if (!vendor) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Vendor account not connected
          </h1>

          <p className="mt-3 text-neutral-600">
            Claim your vendor account first.
          </p>

          <Link
            href="/vendor/claim"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Claim Vendor Account
          </Link>
        </section>
      </main>
    );
  }

  const items = await prisma.orderItem.findMany({
    where: {
      vendorId: vendor.id,
      order: {
        is: {
          status: "paid",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      quantity: true,
      unitPrice: true,
      vendorPayoutCents: true,
      payoutStatus: true,
      fulfillmentStatus: true,
      trackingNumber: true,
      trackingCarrier: true,
      paidAt: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          email: true,
          amountTotal: true,
          status: true,
        },
      },
    },
  });

  const byOrder = new Map<string, typeof items>();

  for (const item of items) {
    const orderId = item.order?.id ?? "unknown";
    const arr = byOrder.get(orderId) ?? [];
    arr.push(item);
    byOrder.set(orderId, arr);
  }

  const orders = Array.from(byOrder.entries())
    .map(([orderId, orderItems]) => {
      const order = orderItems[0]?.order;

      const payoutTotal = orderItems.reduce(
        (sum, item) => sum + (item.vendorPayoutCents ?? 0),
        0
      );

      const pending = orderItems
        .filter((item) => item.payoutStatus !== "PAID")
        .reduce((sum, item) => sum + (item.vendorPayoutCents ?? 0), 0);

      const paid = orderItems
        .filter((item) => item.payoutStatus === "PAID")
        .reduce((sum, item) => sum + (item.vendorPayoutCents ?? 0), 0);

      return {
        orderId,
        order,
        orderItems,
        payoutTotal,
        pending,
        paid,
      };
    })
    .sort((a, b) => {
      const ta = a.order?.createdAt
        ? new Date(a.order.createdAt).getTime()
        : 0;

      const tb = b.order?.createdAt
        ? new Date(b.order.createdAt).getTime()
        : 0;

      return tb - ta;
    });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Vendor Orders
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              {vendor.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Manage orders, fulfillment status, tracking numbers, and payout
              information.
            </p>
          </div>

          <Link
            href="/vendor/dashboard"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </section>

      {orders.length === 0 ? (
        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
          <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
            No orders yet for this vendor.
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6">
          {orders.map((orderGroup) => (
            <article
              key={orderGroup.orderId}
              className="rounded-[28px] border border-black/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Order
                  </div>

                  <div className="mt-2 font-mono text-sm text-black">
                    OIAB-{orderGroup.order?.orderNumber ?? "—"}
                  </div>

                  <div className="mt-3 text-sm text-neutral-600">
                    {orderGroup.order?.createdAt
                      ? new Date(orderGroup.order.createdAt).toLocaleString()
                      : "—"}
                  </div>

                  <div className="mt-1 text-sm text-neutral-600">
                    {orderGroup.order?.email ?? "Customer"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Your Payout
                  </div>

                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {fmtCents(orderGroup.payoutTotal)}
                  </div>

                  <div className="mt-2 text-sm text-neutral-600">
                    Pending: {fmtCents(orderGroup.pending)}
                  </div>

                  <div className="text-sm text-neutral-600">
                    Paid: {fmtCents(orderGroup.paid)}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-black/10 pt-6">
                {orderGroup.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-black">
                          {item.title}
                        </div>

                        <div className="mt-2 text-sm text-neutral-600">
                          Qty {item.quantity}
                        </div>

                        <div className="text-sm text-neutral-600">
                          Unit Price: {fmtCents(item.unitPrice ?? 0)}
                        </div>

                        <div className="text-sm text-neutral-600">
                          Vendor Payout:{" "}
                          {fmtCents(item.vendorPayoutCents ?? 0)}
                        </div>

                        <div className="mt-4">
                          {fulfillmentBadge(item.fulfillmentStatus)}
                        </div>

                        {item.trackingNumber ? (
                          <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                              Tracking
                            </div>

                            <div className="mt-2 text-sm font-semibold text-black">
                              {item.trackingCarrier || "Carrier"} —{" "}
                              {item.trackingNumber}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-[260px] text-right">
                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-black">
                          {item.payoutStatus === "PAID"
                            ? "PAID ✅"
                            : "PENDING ⏳"}
                        </div>

                        <form
                          action="/api/vendor/orders/update"
                          method="POST"
                          className="mt-4 grid gap-2 text-left"
                        >
                          <input
                            type="hidden"
                            name="orderItemId"
                            value={item.id}
                          />

                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Fulfillment Status
                          </label>

                          <select
                            name="fulfillmentStatus"
                            defaultValue={item.fulfillmentStatus}
                            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                          >
                            {FULFILLMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <label className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Carrier
                          </label>

                          <input
                            name="trackingCarrier"
                            defaultValue={item.trackingCarrier ?? ""}
                            placeholder="USPS, UPS, FedEx"
                            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                          />

                          <label className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Tracking Number
                          </label>

                          <input
                            name="trackingNumber"
                            defaultValue={item.trackingNumber ?? ""}
                            placeholder="Enter tracking number"
                            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-black"
                          />

                          <button
                            type="submit"
                            className="mt-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            Update Fulfillment
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}