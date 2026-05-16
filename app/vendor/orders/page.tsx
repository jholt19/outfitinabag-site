import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
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
    where: {
      clerkUserId: userId,
    },
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

  const vendorId = vendor.id;

  const items = await prisma.orderItem.findMany({
    where: {
      vendorId,
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
      paidAt: true,
      createdAt: true,
      order: {
        select: {
          id: true,
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
        (sum, x) => sum + (x.vendorPayoutCents ?? 0),
        0
      );

      const pending = orderItems
        .filter((x) => x.payoutStatus !== "PAID")
        .reduce((sum, x) => sum + (x.vendorPayoutCents ?? 0), 0);

      const paid = orderItems
        .filter((x) => x.payoutStatus === "PAID")
        .reduce((sum, x) => sum + (x.vendorPayoutCents ?? 0), 0);

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
              Orders containing your bundles and payout tracking information.
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
          {orders.map((o) => (
            <article
              key={o.orderId}
              className="rounded-[28px] border border-black/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Order
                  </div>

                  <div className="mt-2 font-mono text-sm text-black">
                    {o.orderId}
                  </div>

                  <div className="mt-3 text-sm text-neutral-600">
                    {o.order?.createdAt
                      ? new Date(o.order.createdAt).toLocaleString()
                      : "—"}
                  </div>

                  <div className="mt-1 text-sm text-neutral-600">
                    {o.order?.email ?? "Customer"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Your Payout
                  </div>

                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {fmtCents(o.payoutTotal)}
                  </div>

                  <div className="mt-2 text-sm text-neutral-600">
                    Pending: {fmtCents(o.pending)}
                  </div>

                  <div className="text-sm text-neutral-600">
                    Paid: {fmtCents(o.paid)}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-black/10 pt-6">
                {o.orderItems.map((item) => (
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
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-black">
                          {item.payoutStatus === "PAID"
                            ? "PAID ✅"
                            : "PENDING ⏳"}
                        </div>

                        <div className="mt-2 text-xs text-neutral-500">
                          {item.paidAt
                            ? `Paid: ${new Date(
                                item.paidAt
                              ).toLocaleDateString()}`
                            : ""}
                        </div>
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
