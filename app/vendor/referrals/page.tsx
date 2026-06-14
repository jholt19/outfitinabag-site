import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.outfitinabag.com"
  );
}

export default async function VendorReferralsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>
          <p className="mt-3 text-neutral-600">
            Please sign in to view your referral link.
          </p>
        </section>
      </main>
    );
  }

  const vendor = await prisma.vendor.findFirst({
    where: { clerkUserId: userId },
    include: {
      referralsSent: {
        include: {
          referredVendor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
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
            Claim your vendor account before using referrals.
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

  const referralCode = vendor.apiKey || vendor.id;
  const referralLink = `${siteUrl()}/vendor/apply?ref=${encodeURIComponent(
    referralCode
  )}`;

  const totalReferrals = vendor.referralsSent.length;
  const approvedReferrals = vendor.referralsSent.filter(
    (referral) => referral.referredVendor.status.toLowerCase() === "approved"
  ).length;
  const pendingReferrals = vendor.referralsSent.filter(
    (referral) => referral.referredVendor.status.toLowerCase() !== "approved"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Vendor Referrals
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Invite brands.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Share your referral link with other brands. When they apply,
              OutfitInABag tracks that you referred them.
            </p>
          </div>

          <Link
            href="/vendor/dashboard"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            ← Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Total Referrals
          </div>
          <div className="mt-2 text-3xl font-semibold text-black">
            {totalReferrals}
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Approved
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-900">
            {approvedReferrals}
          </div>
        </div>

        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Pending
          </div>
          <div className="mt-2 text-3xl font-semibold text-amber-900">
            {pendingReferrals}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Your Referral Link
        </div>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
          Share this with other brands
        </h2>

        <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
          <div className="break-all text-sm font-semibold text-black">
            {referralLink}
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Copy this link and send it to boutique owners, clothing brands,
          sneaker shops, accessory brands, and fashion creators.
        </p>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Referral History
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Brands you referred
            </h2>
          </div>
        </div>

        {vendor.referralsSent.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-sm text-neutral-600">
            No referrals yet. Share your link to start growing the marketplace.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {vendor.referralsSent.map((referral) => (
              <div
                key={referral.id}
                className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                      {referral.referredVendor.name}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-600">
                      {referral.referredVendor.email}
                    </p>

                    <p className="mt-2 text-xs text-neutral-400">
                      Referred on{" "}
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                    {referral.referredVendor.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}