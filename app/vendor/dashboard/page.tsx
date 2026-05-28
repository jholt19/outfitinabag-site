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
            Claim your vendor account before viewing orders and analytics.
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

    include: {
      order: true,
      bundle: true,
    },

    orderBy: {
      createdAt: "desc",
    },

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

    if (item.payoutStatus === "PAID") {
      paidOut += amount;
    } else {
      pendingPayouts += amount;
    }

    if (item.fulfillmentStatus === "SHIPPED") {
      shippedCount++;
    }

    if (item.fulfillmentStatus === "DELIVERED") {
      deliveredCount++;
    }

    if (
      item.fulfillmentStatus === "PROCESSING" ||
      item.fulfillmentStatus === "PENDING"
    ) {
      processingCount++;
    }

    bundleSales[item.title] =
      (bundleSales[item.title] || 0) + item.quantity;
  }

  const averageOrderValue =
    items.length > 0
      ? Math.round(totalRevenue / items.length)
      : 0;

  const topSellingBundle =
    Object.entries(bundleSales).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No sales yet";

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
              Track sales, payouts, fulfillment, inventory, and recent customer
              activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/vendor/orders"
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              View Orders
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
    </main>
  );
}