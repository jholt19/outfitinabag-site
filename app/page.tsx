import Link from "next/link";
import Image from "next/image";
import { OUTFITS } from "../lib/outfits";

export default function HomePage() {
  const trending = OUTFITS.slice(0, 3);

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
      {/* HERO */}
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
              href="/bag"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              View Bag
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
                Complete Looks
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                top • bottom • style
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
                One Checkout
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                fast • simple • clean
              </div>
            </div>
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

          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Featured Bundle
            </div>
            <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-black">
              Vacation-ready summer fit
            </div>
            <div className="mt-1 text-sm leading-6 text-neutral-600">
              Real outfit imagery with a premium, one-click shopping experience.
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY OCCASION */}
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

      {/* TRENDING FITS */}
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-black/10 bg-[#f7f5f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                    {o.occasion}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    3–5 pieces included
                  </span>
                </div>

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

      {/* LOOKBOOK */}
      <section className="mt-14 grid gap-6 rounded-[32px] border border-black/10 bg-[#f7f5f2] p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div className="self-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Editorial Feel
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            The OutfitInABag lookbook
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Outfits built for discovery, styled for occasions, and designed to
            help customers buy the full look faster.
          </p>

          <div className="mt-6">
            <Link
              href="/outfits"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Shop the Lookbook
            </Link>
          </div>
        </div>

        <div className="grid min-h-[360px] grid-cols-[1.2fr_1fr] grid-rows-2 gap-4">
          <div className="relative row-span-2 overflow-hidden rounded-[24px] border border-black/10">
            <Image
              src="/outfits/for-1.jpg"
              alt="Lookbook formal"
              fill
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="object-cover"
            />
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-black/10">
            <Image
              src="/outfits/vac-1.jpg"
              alt="Lookbook vacation"
              fill
              sizes="(max-width: 1024px) 100vw, 15vw"
              className="object-cover"
            />
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-black/10">
            <Image
              src="/outfits/cas-2.jpg"
              alt="Lookbook casual"
              fill
              sizes="(max-width: 1024px) 100vw, 15vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FOR BRANDS */}
      <section className="mt-14 grid gap-6 rounded-[32px] border border-black/10 bg-white p-5 sm:p-7 lg:grid-cols-2 lg:p-8">
        <div className="self-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            For Brands
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Curated from independent brands
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            OutfitInABag helps brands get discovered through complete looks, not
            just single items. Customers shop the full outfit in one place.
          </p>
        </div>

        <div className="grid gap-4 rounded-[24px] border border-black/10 bg-[#f7f5f2] p-5">
          <div>
            <div className="text-3xl font-semibold tracking-[-0.05em] text-black">
              80%
            </div>
            <div className="mt-1 text-sm text-neutral-600">vendor payout</div>
          </div>

          <div>
            <div className="text-3xl font-semibold tracking-[-0.05em] text-black">
              1 click
            </div>
            <div className="mt-1 text-sm text-neutral-600">to buy the fit</div>
          </div>

          <div>
            <div className="text-3xl font-semibold tracking-[-0.05em] text-black">
              Styled
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              for real occasions
            </div>
          </div>

          <Link
            href="/sell"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Become a Founding Brand
          </Link>
        </div>
      </section>
    </main>
  );
}