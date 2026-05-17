import Link from "next/link";

import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Admin
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Manage OutfitInABag.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
          Access your admin tools for bundles, vendors, orders, and payouts.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/dashboard"
            className="rounded-[24px] bg-black p-5 text-white transition hover:opacity-90"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em]">
              Dashboard
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Analytics
            </div>

            <p className="mt-2 text-sm text-white/70">
              Revenue, GMV, and marketplace insights.
            </p>
          </Link>

          <Link
            href="/admin/bundles"
            className="rounded-[24px] border border-black/10 bg-white p-5 transition hover:border-black"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
              Bundles
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Manage
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Review, publish, and feature outfit bundles.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-[24px] border border-black/10 bg-white p-5 transition hover:border-black"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
              Orders
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Fulfillment
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Track customer purchases and payouts.
            </p>
          </Link>

          <Link
            href="/admin/vendors"
            className="rounded-[24px] border border-black/10 bg-white p-5 transition hover:border-black"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
              Vendors
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
              Accounts
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Manage vendors and Stripe onboarding.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}