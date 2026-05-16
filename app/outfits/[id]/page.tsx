import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { toggleSavedOutfit } from "./actions";
import { addBundleToCart } from "@/app/cart/actions";

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
        <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white">
          {bundle.image ? (
            <img
              src={bundle.image}
              alt={bundle.title}
              className="h-full min-h-[620px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[620px] items-center justify-center bg-[#f7f5f2] text-neutral-400">
              No image available
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            {bundle.occasion}
          </div>

          <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            {bundle.title}
          </h1>

          <p className="mt-5 text-base leading-7 text-neutral-600">
            {bundle.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
              Vendor: {bundle.vendor?.name ?? "OutfitInABag"}
            </div>

            {bundle.tier ? (
              <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
                {bundle.tier}
              </div>
            ) : null}
          </div>

          <div className="mt-10 text-5xl font-semibold tracking-[-0.05em] text-black">
            {fmtPrice(bundle.price)}
          </div>

          <div className="mt-10 grid gap-3">
            {userId ? (
              <form action={addBundleToCart}>
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