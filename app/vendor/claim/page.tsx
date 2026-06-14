import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const normalized = status.toLowerCase();

  const styles =
    normalized === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "rejected"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div
      className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${styles}`}
    >
      {status}
    </div>
  );
}

export default async function ClaimVendorPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vendor Claim
          </div>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Sign in required.
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Please sign in using the same email address you used on your vendor
            application.
          </p>

          <Link
            href="/account"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Sign In
          </Link>
        </section>
      </main>
    );
  }

  const user = await currentUser();

  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";

  const existingClaim = await prisma.vendor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  if (existingClaim) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vendor Connected
          </div>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Account already claimed.
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Your login is already connected to this vendor account.
          </p>

          <div className="mt-6 rounded-2xl bg-[#f7f5f2] p-5">
            <div className="text-2xl font-semibold text-black">
              {existingClaim.name}
            </div>

            <div className="mt-2 text-neutral-600">{existingClaim.email}</div>

            <div className="mt-4">{statusBadge(existingClaim.status)}</div>
          </div>

          <Link
            href="/vendor/dashboard"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white"
          >
            Go to Vendor Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      email,
    },
  });

  if (!vendor) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vendor Claim
          </div>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            No vendor found.
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            We could not find a vendor account connected to this signed-in
            email address:
          </p>

          <div className="mt-5 rounded-2xl bg-[#f7f5f2] p-5 font-semibold text-black">
            {email || "No email found"}
          </div>

          <p className="mt-5 text-sm leading-6 text-neutral-600">
            Make sure you signed in with the same email used on your vendor
            application. If you have not applied yet, submit a vendor
            application first.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/vendor/apply"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Apply as Vendor
            </Link>

            <Link
              href="/account"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Switch Account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (vendor.clerkUserId && vendor.clerkUserId !== userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Already Claimed
          </div>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Vendor already connected.
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            This vendor account has already been claimed by another login.
          </p>
        </section>
      </main>
    );
  }

  const claimedVendor = await prisma.vendor.update({
    where: {
      id: vendor.id,
    },
    data: {
      clerkUserId: userId,
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[32px] border border-black/10 bg-white p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Vendor Connected
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Vendor account claimed.
        </h1>

        <p className="mt-4 text-base leading-7 text-neutral-600">
          Your login is now connected to your OutfitInABag vendor account.
        </p>

        <div className="mt-6 rounded-2xl bg-[#f7f5f2] p-5">
          <div className="text-2xl font-semibold text-black">
            {claimedVendor.name}
          </div>

          <div className="mt-2 text-neutral-600">{claimedVendor.email}</div>

          <div className="mt-4">{statusBadge(claimedVendor.status)}</div>
        </div>

        {claimedVendor.status.toLowerCase() === "approved" ? (
          <Link
            href="/vendor/dashboard"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white"
          >
            Go to Vendor Dashboard
          </Link>
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
            Your vendor account is connected, but it is still waiting for admin
            approval. You will receive an email once approved.
          </div>
        )}
      </section>
    </main>
  );
}