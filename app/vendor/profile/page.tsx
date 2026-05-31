import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { updateVendorProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function VendorProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to edit your vendor profile.
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
            Claim your vendor account before editing your public profile.
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
        <Link
          href="/vendor/dashboard"
          className="inline-flex rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vendor Profile
          </div>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Edit Storefront
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            Customize how your brand appears on your public vendor storefront.
          </p>
        </div>
      </section>

      <form
        action={updateVendorProfile}
        className="mt-8 rounded-[28px] border border-black/10 bg-white p-6"
      >
        <div className="grid gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Brand Name
            </label>

            <input
              name="name"
              defaultValue={vendor.name}
              required
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Category
            </label>

            <input
              name="category"
              defaultValue={vendor.category ?? ""}
              placeholder="Luxury Casualwear, Formalwear, Streetwear"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Bio
            </label>

            <textarea
              name="bio"
              defaultValue={vendor.bio ?? ""}
              rows={5}
              placeholder="Tell customers about your brand..."
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Logo Image URL
            </label>

            <input
              name="logo"
              defaultValue={vendor.logo ?? ""}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Banner Image URL
            </label>

            <input
              name="bannerImage"
              defaultValue={vendor.bannerImage ?? ""}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Instagram URL
            </label>

            <input
              name="instagram"
              defaultValue={vendor.instagram ?? ""}
              placeholder="https://instagram.com/yourbrand"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Website URL
            </label>

            <input
              name="website"
              defaultValue={vendor.website ?? ""}
              placeholder="https://yourbrand.com"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Save Vendor Profile
          </button>
        </div>
      </form>
    </main>
  );
}