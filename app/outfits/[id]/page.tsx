import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { toggleSavedOutfit } from "./actions";

export const dynamic = "force-dynamic";

function fmtPrice(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: {
      vendor: true,
    },
  });

  if (!bundle) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Outfit not found.
          </h1>

          <p className="mt-3 text-neutral-600">
            This outfit may have been removed.
          </p>

          <Link
            href="/outfits"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Browse Outfits
          </Link>
        </div>
      </main>
    );
  }

  const isSoldOut = bundle.stock <= 0;

  const isLowStock =
    bundle.stock > 0 && bundle.stock <= bundle.lowStockThreshold;

  const saved = userId
    ? await prisma.savedOutfit.findUnique({
        where: {
          userId_bundleId: {
            userId,
            bundleId: bundle.id,
          },
        },
      })
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <Link href="/outfits" className="text-sm font-semibold text-black">
        ← Back to outfits
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white">
          {bundle.image ? (
            <img
              src={bundle.image}
              alt={bundle.title}
              className={`h-full min-h-[620px] w-full object-cover ${
                isSoldOut ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex min-h-[620px] items-center justify-center bg-[#f7f5f2] text-neutral-400">
              No image available
            </div>
          )}

          {isSoldOut ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black">
                Sold Out
              </span>
            </div>
          ) : null}
        </div>

        <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {bundle.occasion}
            </div>

            {bundle.isFeatured ? (
              <div className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-700">
                Featured
              </div>
            ) : null}

            {isSoldOut ? (
              <div className="inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700">
                Sold Out
              </div>
            ) : isLowStock ? (
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                Only {bundle.stock} Left
              </div>
            ) : (
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                In Stock
              </div>
            )}
          </div>

          <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            {bundle.title}
          </h1>

          <p className="mt-5 text-base leading-7 text-neutral-600">
            {bundle.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {bundle.vendor ? (
              <Link
                href={`/vendors/${bundle.vendor.id}`}
                className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black transition hover:border-black"
              >
                Vendor: {bundle.vendor.name}
              </Link>
            ) : (
              <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
                Vendor: OutfitInABag
              </div>
            )}

            {bundle.tier ? (
              <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
                {bundle.tier}
              </div>
            ) : null}

            {!isSoldOut ? (
              <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
                {bundle.stock} available
              </div>
            ) : null}
          </div>

          <div className="mt-10 text-5xl font-semibold tracking-[-0.05em] text-black">
            {fmtPrice(bundle.price)}
          </div>

          <div className="mt-10 grid gap-3">
            {isSoldOut ? (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-neutral-300 px-6 py-4 text-sm font-semibold text-neutral-600"
              >
                Sold Out
              </button>
            ) : userId ? (
              <form action="/api/cart/add" method="POST">
                <input type="hidden" name="bundleId" value={bundle.id} />

                <button
                  type="submit"
                  className="w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Add Full Fit to Bag
                </button>
              </form>
            ) : (
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Sign In to Add to Bag
              </Link>
            )}

            {userId ? (
              <form action={toggleSavedOutfit}>
                <input type="hidden" name="bundleId" value={bundle.id} />

                <button
                  type="submit"
                  className="w-full rounded-full border border-black/15 bg-white px-6 py-4 text-sm font-semibold text-black transition hover:border-black"
                >
                  {saved ? "Saved ❤️" : "Save Outfit ♡"}
                </button>
              </form>
            ) : (
              <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-6 py-4 text-center text-sm font-medium text-neutral-500">
                Sign in to save outfits
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}