import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: {
      bundles: {
        where: {
          published: true,
        },
        take: 1,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Featured Vendors
          </div>

          <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Premium brands.
            <br />
            Curated inside
            <br />
            complete outfits.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            Discover premium vendors creating complete outfit experiences for
            every occasion.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sell"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Become a Vendor
            </Link>

            <Link
              href="/outfits"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Shop Looks
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Current Partners
        </div>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
          Vendor storefronts
        </h2>

        {vendors.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-8 text-neutral-600">
            No vendors available yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => {
              const featuredBundle = vendor.bundles?.[0];

              return (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="overflow-hidden rounded-[28px] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-[320px] bg-[#f7f5f2]">
                    {featuredBundle?.image ? (
                      <Image
                        src={featuredBundle.image}
                        alt={vendor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        No vendor image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      Vendor Storefront
                    </div>

                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                      {vendor.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      Explore curated outfit collections, featured styles, and
                      premium looks from this vendor.
                    </p>

                    <div className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
                      View Storefront
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}