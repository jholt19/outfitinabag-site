import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { OUTFITS } from "../lib/outfits";

export const dynamic = "force-dynamic";

function averageRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;

  return (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  );
}

function reviewSummary(reviews: { rating: number }[]) {
  if (reviews.length === 0) {
    return "No reviews yet";
  }

  const average = averageRating(reviews);

  return `${average.toFixed(1)} ★ · ${reviews.length} Review${
    reviews.length === 1 ? "" : "s"
  }`;
}

export default async function HomePage() {
  const trending = OUTFITS.slice(0, 3);

  const featuredVendors = await prisma.vendor.findMany({
    where: {
      status: "approved",
      isFeatured: true,
    },
    take: 3,
    include: {
      reviews: true,
      bundles: {
        where: {
          published: true,
        },
        take: 1,
      },
    },
  });

  const vendors = await prisma.vendor.findMany({
    where: {
      status: "approved",
    },
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reviews: true,
      bundles: {
        where: {
          published: true,
        },
        take: 1,
      },
    },
  });

  const topRatedVendors = [...vendors]
    .filter((vendor) => vendor.reviews.length > 0)
    .sort((a, b) => {
      const ratingDiff = averageRating(b.reviews) - averageRating(a.reviews);

      if (ratingDiff !== 0) return ratingDiff;

      return b.reviews.length - a.reviews.length;
    })
    .slice(0, 3);

  const occasions = [
    {
      title: "Date Night",
      subtitle: "Sharp looks for nights out",
      image: "/outfits/for-1.jpg",
      href: "/outfits?occasion=FORMAL",
    },
    {
      title: "Airport Travel",
      subtitle: "Comfortable fits that still hit",
      image: "/outfits/cas-2.jpg",
      href: "/outfits?occasion=CASUAL",
    },
    {
      title: "Weekend Casual",
      subtitle: "Clean everyday style",
      image: "/outfits/cas-2.jpg",
      href: "/outfits?occasion=CASUAL",
    },
    {
      title: "Vacation",
      subtitle: "Warm-weather ready looks",
      image: "/outfits/vac-1.jpg",
      href: "/outfits?occasion=VACATION",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <section className="grid items-center gap-8 rounded-[32px] border border-black/10 bg-[#f7f5f2] p-5 sm:p-7 lg:grid-cols-2 lg:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px]">
            Curated looks • One checkout
          </div>

          <h1 className="mt-5 max-w-[10ch] text-[clamp(2.7rem,8vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Complete outfits for every occasion.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            Curated looks from independent brands, bundled to save time and
            simplify getting dressed. Shop the full fit in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/outfits"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Shop Outfits
            </Link>

            <Link
              href="/vendors"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Explore Brands
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative h-[360px] overflow-hidden rounded-[28px] border border-black/10 bg-white sm:h-[440px] lg:h-[560px]">
            <Image
              src="/outfits/vac-2.jpg"
              alt="Featured outfit"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {featuredVendors.length > 0 ? (
        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Featured Partners
              </div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
                Hand selected brands
              </h2>
            </div>

            <Link
              href="/vendors"
              className="text-sm font-semibold text-black transition hover:opacity-70"
            >
              View all vendors →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredVendors.map((vendor) => {
              const featuredBundle = vendor.bundles?.[0];
              const image = vendor.bannerImage || featuredBundle?.image;

              return (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="group overflow-hidden rounded-[28px] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-[260px] bg-[#f7f5f2]">
                    {image ? (
                      <Image
                        src={image}
                        alt={vendor.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        Vendor image coming soon
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 shadow-sm">
                      Featured ⭐
                    </div>

                    <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-black shadow-sm backdrop-blur">
                      {reviewSummary(vendor.reviews)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {vendor.category || "Featured Vendor"}
                    </div>

                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                      {vendor.name}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {vendor.bio || "Premium featured marketplace partner."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {topRatedVendors.length > 0 ? (
        <section className="mt-14 rounded-[32px] border border-black/10 bg-black p-6 text-white sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Top Rated Vendors
              </div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Customer favorites
              </h2>
            </div>

            <Link
              href="/vendors"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              View all vendors
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {topRatedVendors.map((vendor, index) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="rounded-[24px] border border-white/10 bg-white/10 p-5 transition hover:-translate-y-1 hover:bg-white/15"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                    #{index + 1} Top Rated
                  </div>

                  <div className="text-sm font-semibold">
                    {reviewSummary(vendor.reviews)}
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                  {vendor.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                  {vendor.bio ||
                    "Explore curated outfit collections from this vendor."}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Featured Brands
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Shop the marketplace
            </h2>
          </div>

          <Link
            href="/vendors"
            className="text-sm font-semibold text-black transition hover:opacity-70"
          >
            View all vendors →
          </Link>
        </div>

        {vendors.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-white p-6 text-neutral-600">
            Vendor brands will appear here soon.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => {
              const featuredBundle = vendor.bundles?.[0];
              const image = vendor.bannerImage || featuredBundle?.image;

              return (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="group overflow-hidden rounded-[28px] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-[280px] bg-[#f7f5f2]">
                    {image ? (
                      <Image
                        src={image}
                        alt={vendor.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        Vendor image coming soon
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-black shadow-sm backdrop-blur">
                      {reviewSummary(vendor.reviews)}
                    </div>

                    {vendor.logo ? (
                      <div className="absolute bottom-4 left-4 h-16 w-16 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-lg">
                        <Image
                          src={vendor.logo}
                          alt={`${vendor.name} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {vendor.category || "Vendor Storefront"}
                    </div>

                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                      {vendor.name}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {vendor.bio ||
                        "Explore curated outfit collections from this vendor."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Shop by Occasion
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Fits for the moment
            </h2>
          </div>

          <Link
            href="/outfits"
            className="text-sm font-semibold text-black transition hover:opacity-70"
          >
            View all outfits →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {occasions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group overflow-hidden rounded-[24px] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-[260px] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-5">
                <div className="text-xl font-semibold tracking-[-0.03em] text-black">
                  {item.title}
                </div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">
                  {item.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Discover
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
              Trending Fits
            </h2>
          </div>

          <Link
            href="/outfits"
            className="text-sm font-semibold text-black transition hover:opacity-70"
          >
            Shop all →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {trending.map((o) => (
            <Link
              key={o.id}
              href={`/outfits/${o.id}`}
              className="group overflow-hidden rounded-[24px] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-[360px] overflow-hidden">
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-5">
                <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                  {o.title}
                </div>

                <div className="mt-2 text-sm leading-6 text-neutral-600">
                  {o.description}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-black">
                    ${(o.price / 100).toFixed(2)}
                  </div>

                  <span className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    Buy the Fit
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}