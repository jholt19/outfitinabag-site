import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: vendorId,
    },
    include: {
      bundles: {
        where: {
          published: true,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!vendor || vendor.status !== "approved") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8 lg:p-10">
        <Link
          href="/vendors"
          className="inline-flex rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
        >
          ← Back to Vendors
        </Link>

        {vendor.bannerImage ? (
          <div className="relative mt-6 h-[260px] overflow-hidden rounded-[28px] bg-white">
            <Image
              src={vendor.bannerImage}
              alt={vendor.name}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-8 max-w-3xl">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Vendor Storefront
          </div>

          {vendor.logo ? (
            <div className="relative mt-6 h-24 w-24 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
              <Image
                src={vendor.logo}
                alt={`${vendor.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            {vendor.name}
          </h1>

          {vendor.category ? (
            <div className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              {vendor.category}
            </div>
          ) : null}

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            {vendor.bio ||
              `Explore complete outfit bundles curated by ${vendor.name}.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {vendor.instagram ? (
              <a
                href={vendor.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
              >
                Instagram
              </a>
            ) : null}

            {vendor.website ? (
              <a
                href={vendor.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
              >
                Website
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Published Looks
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {vendor.bundles.length}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Store Status
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            Approved
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Brand
          </div>

          <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
            {vendor.name}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Outfit Collection
        </div>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
          Complete looks from {vendor.name}
        </h2>

        {vendor.bundles.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-8 text-neutral-600">
            This vendor does not have any published outfits yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendor.bundles.map((bundle) => {
              const isSoldOut = bundle.stock <= 0;
              const isLowStock =
                bundle.stock > 0 && bundle.stock <= bundle.lowStockThreshold;

              return (
                <article
                  key={bundle.id}
                  className={`overflow-hidden rounded-[28px] border border-black/10 bg-white ${
                    isSoldOut ? "opacity-75" : ""
                  }`}
                >
                  <Link href={`/outfits/${bundle.id}`}>
                    <div className="relative h-[360px] bg-[#f7f5f2]">
                      {bundle.image ? (
                        <Image
                          src={bundle.image}
                          alt={bundle.title}
                          fill
                          className={`object-cover ${
                            isSoldOut ? "grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                          No image
                        </div>
                      )}

                      {isSoldOut ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                          <span className="rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black">
                            Sold Out
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                        {bundle.occasion}
                      </div>

                      {isLowStock ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                          Only {bundle.stock} Left
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                      {bundle.title}
                    </h3>

                    {bundle.description ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                        {bundle.description}
                      </p>
                    ) : null}

                    <div className="mt-4 text-xl font-semibold text-black">
                      {fmtCents(bundle.price)}
                    </div>

                    <div className="mt-5 grid gap-3">
                      <Link
                        href={`/outfits/${bundle.id}`}
                        className="rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        View Outfit
                      </Link>

                      {isSoldOut ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-full border border-black/10 bg-neutral-200 px-5 py-3 text-center text-sm font-semibold text-neutral-500"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <form action="/api/cart/add" method="POST">
                          <input
                            type="hidden"
                            name="bundleId"
                            value={bundle.id}
                          />

                          <button
                            type="submit"
                            className="w-full rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-black"
                          >
                            Add to Bag
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}