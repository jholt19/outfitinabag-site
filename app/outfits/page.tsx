import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Occasion } from "@prisma/client";

export const dynamic = "force-dynamic";

const OCCASIONS: (Occasion | "ALL")[] = [
  "ALL",
  "VACATION",
  "FORMAL",
  "CASUAL",
  "WEDDING",
];

export default async function OutfitsPage({
  searchParams,
}: {
  searchParams?: Promise<{ occasion?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedOccasion = (params?.occasion || "ALL") as Occasion | "ALL";

  const bundles = await prisma.bundle.findMany({
    where: {
      published: true,
      ...(selectedOccasion !== "ALL"
        ? { occasion: selectedOccasion as Occasion }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { vendor: true },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Shop Outfits
            </div>

            <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Curated looks.
              <br />
              Built for the moment.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
              Shop complete outfit bundles from approved brands.
            </p>
          </div>

          <Link
            href="/bag"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            View Bag
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {OCCASIONS.map((c) => (
            <Link
              key={c}
              href={c === "ALL" ? "/outfits" : `/outfits?occasion=${c}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                selectedOccasion === c
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black hover:border-black"
              }`}
            >
              {c === "ALL" ? "All" : c.toLowerCase()}
            </Link>
          ))}
        </div>
      </section>

      {bundles.length === 0 ? (
        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
            No published outfits yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
            Publish bundles from the admin dashboard and they will appear here.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const isSoldOut = bundle.stock <= 0;
            const isLowStock =
              bundle.stock > 0 && bundle.stock <= bundle.lowStockThreshold;

            return (
              <article
                key={bundle.id}
                className={`group overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition ${
                  isSoldOut
                    ? "opacity-75"
                    : "hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                <Link href={`/outfits/${bundle.id}`} className="block">
                  <div className="relative h-[360px] overflow-hidden bg-[#f7f5f2]">
                    {bundle.image ? (
                      <img
                        src={bundle.image}
                        alt={bundle.title}
                        className={`h-full w-full object-cover transition duration-500 ${
                          isSoldOut
                            ? "grayscale"
                            : "group-hover:scale-[1.03]"
                        }`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-neutral-400">
                        No image yet
                      </div>
                    )}

                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-black/10 bg-[#f7f5f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                      {bundle.occasion}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {bundle.isFeatured && (
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                          Featured
                        </span>
                      )}

                      {isSoldOut ? (
                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                          Low Stock
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                    {bundle.title}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-neutral-600">
                    {bundle.description}
                  </p>

                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    By {bundle.vendor?.name ?? "OutfitInABag"}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div className="text-xl font-semibold text-black">
                      ${(bundle.price / 100).toFixed(2)}
                    </div>

                    {!isSoldOut && (
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        {bundle.stock} left
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3">
                    {isSoldOut ? (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-full bg-neutral-300 px-5 py-3 text-center text-sm font-semibold text-neutral-600"
                      >
                        Sold Out
                      </button>
                    ) : (
                      <form action="/api/cart/add" method="POST">
                        <input type="hidden" name="bundleId" value={bundle.id} />

                        <button
                          type="submit"
                          className="w-full rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Add Full Fit to Bag
                        </button>
                      </form>
                    )}

                    <Link
                      href={`/outfits/${bundle.id}`}
                      className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-black"
                    >
                      View Outfit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}