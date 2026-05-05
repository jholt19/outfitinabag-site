import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BagPage({
  searchParams,
}: {
  searchParams?: Promise<{ addBundleId?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const bundleId = params?.addBundleId;

  const bundle = bundleId
    ? await prisma.bundle.findUnique({
        where: { id: bundleId },
        include: { vendor: true },
      })
    : null;

  if (!bundle) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Your bag is empty.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Browse curated outfits and add a full fit to your bag.
          </p>

          <Link
            href="/outfits"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Outfits
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Your Bag
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Review your outfit.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          Your selected full-fit bundle is ready for checkout.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[28px] border border-black/10 bg-white p-5">
          {bundle.image ? (
            <img
  src={bundle.image}
  alt={bundle.title}
  className="w-full h-[360px] rounded-2xl object-contain bg-[#f7f5f2] p-4"
/>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-2xl bg-[#f7f5f2] text-neutral-400">
              No image
            </div>
          )}

          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {bundle.occasion}
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              {bundle.title}
            </h2>

            <p className="mt-3 text-base leading-7 text-neutral-600">
              {bundle.description}
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              By {bundle.vendor?.name ?? "OutfitInABag"}
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Order Summary
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <strong className="text-black">
                ${(bundle.price / 100).toFixed(2)}
              </strong>
            </div>

            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Shipping</span>
              <strong className="text-black">Calculated at checkout</strong>
            </div>

            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-black">Total</span>
              <strong className="text-black">
                ${(bundle.price / 100).toFixed(2)}
              </strong>
            </div>
          </div>

          <form action="/api/create-checkout-session" method="POST">
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Checkout Securely
            </button>
          </form>

          <Link
            href="/outfits"
            className="mt-4 inline-flex w-full justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Continue Shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}