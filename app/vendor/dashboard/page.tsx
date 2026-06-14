import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import VendorPicker from "./VendorPicker";
import { submitBundleForReview } from "../bundles/actions/submitForReview";
import { updateBundleInventory } from "./actions/inventory";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusBadge(label: string, active: boolean) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {label} {active ? "✅" : "⏳"}
    </div>
  );
}

export default async function VendorDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>
          <p className="mt-3 text-neutral-600">
            Please sign in to view your vendor dashboard.
          </p>
        </section>
      </main>
    );
  }

  const selectedVendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
  });

  if (!selectedVendor) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Vendor account not connected
          </h1>
          <p className="mt-3 text-neutral-600">
            Claim your vendor account before viewing orders, payouts, and
            dashboard analytics.
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

  const vendorId = selectedVendor.id;
  const vendors = [selectedVendor];

  const bundles = await prisma.bundle.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

  const items = await prisma.orderItem.findMany({
    where: { vendorId },
    include: { order: true, bundle: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  let totalRevenue = 0;
  let pendingPayouts = 0;
  let paidOut = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let processingCount = 0;

  const bundleSales: Record<string, number> = {};

  for (const item of items) {
    const amount = item.vendorPayoutCents ?? 0;
    totalRevenue += amount;

    if (item.payoutStatus === "PAID") paidOut += amount;
    else pendingPayouts += amount;

    if (item.fulfillmentStatus === "SHIPPED") shippedCount++;
    if (item.fulfillmentStatus === "DELIVERED") deliveredCount++;

    if (
      item.fulfillmentStatus === "PROCESSING" ||
      item.fulfillmentStatus === "PENDING"
    ) {
      processingCount++;
    }

    bundleSales[item.title] = (bundleSales[item.title] || 0) + item.quantity;
  }

  const averageOrderValue =
    items.length > 0 ? Math.round(totalRevenue / items.length) : 0;

  const topSellingBundle =
    Object.entries(bundleSales).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No sales yet";

  const totalUnitsSold = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalOrders = items.length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = items
    .filter((item) => item.createdAt >= thisMonth)
    .reduce((sum, item) => sum + (item.vendorPayoutCents || 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Vendor Portal
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              {selectedVendor.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Manage bundles, inventory, promo codes, referrals, payouts,
              sales, and your storefront.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/vendor/profile"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Edit Profile
            </Link>

            <Link
              href="/vendor/orders"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              View Orders
            </Link>

            <Link
              href="/vendor/promos"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Promo Codes
            </Link>

            <Link
              href="/vendor/referrals"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Referrals
            </Link>

            <Link
              href="/vendor/connect"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Stripe Connect
            </Link>

            <Link
              href="/vendor/bundles/new"
              className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New Bundle
            </Link>
          </div>
        </div>

        <VendorPicker vendors={vendors} vendorId={vendorId} />
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Stripe Connect Status
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Payout Readiness
            </h2>
          </div>

          <Link
            href="/vendor/connect"
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Manage Stripe
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {statusBadge("Account Connected", !!selectedVendor.stripeAccountId)}
          {statusBadge("Onboarding Done", selectedVendor.stripeOnboardingDone)}
          {statusBadge("Charges Enabled", selectedVendor.stripeChargesEnabled)}
          {statusBadge("Payouts Enabled", selectedVendor.stripePayoutsEnabled)}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Total Revenue
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(totalRevenue)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Pending Payouts
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(pendingPayouts)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Paid Out
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(paidOut)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Avg Order Value
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(averageOrderValue)}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Monthly Revenue
          </div>

          <div className="mt-2 text-3xl font-semibold text-black">
            {fmtCents(monthlyRevenue)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Orders
          </div>

          <div className="mt-2 text-3xl font-semibold text-black">
            {totalOrders}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Units Sold
          </div>

          <div className="mt-2 text-3xl font-semibold text-black">
            {totalUnitsSold}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Delivered
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-900">
            {deliveredCount}
          </div>
        </div>

        <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Shipped
          </div>
          <div className="mt-2 text-3xl font-semibold text-blue-900">
            {shippedCount}
          </div>
        </div>

        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Processing
          </div>
          <div className="mt-2 text-3xl font-semibold text-amber-900">
            {processingCount}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Top Seller
          </div>
          <div className="mt-2 text-lg font-semibold text-black">
            {topSellingBundle}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Bundles & Inventory
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              My Bundles
            </h2>
          </div>

          <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
            {bundles.length} Total
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {bundles.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
              No bundles yet.
            </div>
          ) : (
            bundles.map((bundle) => {
              const isSoldOut = bundle.stock <= 0;
              const isLowStock =
                bundle.stock > 0 && bundle.stock <= bundle.lowStockThreshold;

              const status = bundle.published
                ? "Published"
                : bundle.submittedForReview
                  ? "Awaiting Review"
                  : "Draft";

              return (
                <div
                  key={bundle.id}
                  className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        {bundle.occasion}
                      </div>

                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                        {bundle.title}
                      </h3>

                      <p className="mt-2 text-sm text-neutral-600">
                        Price: <strong>{fmtCents(bundle.price)}</strong>
                      </p>

                      <p className="mt-1 text-sm text-neutral-600">
                        Status: <strong>{status}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isSoldOut ? (
                        <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          In Stock
                        </span>
                      )}

                      {!bundle.published && !bundle.submittedForReview ? (
                        <form action={submitBundleForReview}>
                          <input
                            type="hidden"
                            name="bundleId"
                            value={bundle.id}
                          />
                          <input
                            type="hidden"
                            name="vendorId"
                            value={vendorId}
                          />

                          <button
                            type="submit"
                            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            Submit for Review
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  <form
                    action={updateBundleInventory}
                    className="mt-5 grid gap-4 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input type="hidden" name="bundleId" value={bundle.id} />

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Stock Quantity
                      </label>

                      <input
                        type="number"
                        name="stock"
                        min="0"
                        defaultValue={bundle.stock}
                        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Low Stock Alert
                      </label>

                      <input
                        type="number"
                        name="lowStockThreshold"
                        min="0"
                        defaultValue={bundle.lowStockThreshold}
                        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Update Inventory
                      </button>
                    </div>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}