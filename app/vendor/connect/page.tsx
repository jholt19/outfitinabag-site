import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export default async function VendorConnectPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to manage Stripe Connect.
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
            Claim your vendor account before managing Stripe payouts.
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

  return (
    <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Stripe Connect
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Connect your payouts.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          Manage Stripe payouts for <strong>{vendor.name}</strong>.
        </p>

        <div className="mt-8 rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-sm font-semibold text-black">
            Vendor Account
          </div>

          <div className="mt-3 rounded-2xl border border-black bg-black px-4 py-3 text-sm font-semibold text-white">
            {vendor.name}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {statusBadge("Account Connected", !!vendor.stripeAccountId)}
            {statusBadge("Onboarding Done", vendor.stripeOnboardingDone)}
            {statusBadge("Charges Enabled", vendor.stripeChargesEnabled)}
            {statusBadge("Payouts Enabled", vendor.stripePayoutsEnabled)}
          </div>

          {vendor.stripeAccountId ? (
            <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Stripe Account ID
              </div>

              <div className="mt-2 break-all font-mono text-sm text-black">
                {vendor.stripeAccountId}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/api/stripe/connect?vendorId=${vendor.id}`}
            className="inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {vendor.stripeAccountId
              ? "Update Stripe Account"
              : "Connect Stripe Account"}
          </Link>

          <Link
            href="/vendor/dashboard"
            className="inline-flex rounded-full border border-black/15 bg-white px-6 py-4 text-sm font-semibold text-black transition hover:border-black"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}