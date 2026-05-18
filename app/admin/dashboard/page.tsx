import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalOrders,
    totalVendors,
    totalBundles,
    orders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.vendor.count(),
    prisma.bundle.count(),
    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
  ]);

  const grossRevenue = orders.reduce((sum, order) => {
    return sum + (order.amountTotal || 0);
  }, 0);

  const platformRevenue = orders.reduce((sum, order) => {
    return sum + (order.platformFeeCents || 0);
  }, 0);

  const vendorPayouts = orders.reduce((sum, order) => {
    return sum + (order.vendorTotalCents || 0);
  }, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Admin Dashboard
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Marketplace control center.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          Monitor marketplace performance, vendors, payouts, and orders.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Gross Revenue
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(grossRevenue)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Platform Revenue
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(platformRevenue)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Vendor Payouts
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(vendorPayouts)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Total Orders
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {totalOrders}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/orders"
          className="rounded-[28px] border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Orders
          </div>

          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            {totalOrders}
          </div>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            View customer orders, refunds, payouts, and fulfillment.
          </p>
        </Link>

        <Link
          href="/admin/vendors"
          className="rounded-[28px] border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Vendors
          </div>

          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            {totalVendors}
          </div>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Manage vendor approvals and Stripe onboarding.
          </p>
        </Link>

        <Link
          href="/admin/bundles"
          className="rounded-[28px] border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Bundles
          </div>

          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black">
            {totalBundles}
          </div>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Publish, feature, and manage outfit bundles.
          </p>
        </Link>
      </section>

      <section className="mt-8 rounded-[32px] border border-black/10 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Recent Orders
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Latest transactions
            </h2>
          </div>

          <Link
            href="/admin/orders"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            View All Orders
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="rounded-2xl border border-black/10 bg-[#f7f5f2]"
                >
                  <td className="rounded-l-2xl px-4 py-4 text-sm text-black">
                    {order.email ?? "Customer"}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-black">
                    {fmtCents(order.amountTotal || 0)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        order.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {order.status ?? "unknown"}
                    </span>
                  </td>

                  <td className="rounded-r-2xl px-4 py-4 text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}