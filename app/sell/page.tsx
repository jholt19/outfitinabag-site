import Link from "next/link";
import Image from "next/image";

export default function SellPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="grid items-center gap-8 rounded-[32px] border border-black/10 bg-[#f7f5f2] p-5 sm:p-7 lg:grid-cols-2 lg:p-10">
        <div>
          <div className="inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px]">
            Sell on OutfitInABag
          </div>

          <h1 className="mt-5 max-w-[11ch] text-[clamp(2.7rem,8vw,6rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Put your brand inside complete outfits.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            OutfitInABag helps independent brands get discovered through curated
            looks, styled occasions, and one-click outfit shopping.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#apply"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Apply as a Vendor
            </a>

            <Link
              href="/outfits"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              View Example Fits
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["80%", "vendor payout"],
              ["1 click", "full outfit checkout"],
              ["Featured", "lookbook visibility"],
            ].map(([top, bottom]) => (
              <div
                key={top}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3"
              >
                <div className="text-xl font-semibold tracking-[-0.04em] text-black">
                  {top}
                </div>
                <div className="mt-1 text-sm text-neutral-500">{bottom}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative h-[380px] overflow-hidden rounded-[28px] border border-black/10 bg-white sm:h-[460px] lg:h-[560px]">
            <Image
              src="/outfits/for-1.jpg"
              alt="Brand feature preview"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Founding Brands
            </div>
            <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-black">
              Get featured in curated fits
            </div>
            <div className="mt-1 text-sm leading-6 text-neutral-600">
              Early brands can appear across homepage, lookbook, and occasion
              collections.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          How It Works
        </div>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
          A simple vendor flow
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {[
            [
              "01",
              "Apply",
              "Tell us about your brand, products, audience, and style category.",
            ],
            [
              "02",
              "Get styled",
              "Your products can be placed inside curated looks built around real occasions.",
            ],
            [
              "03",
              "Fulfill & earn",
              "Customers buy the full fit. You fulfill your product and keep 80%.",
            ],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-[24px] border border-black/10 bg-white p-6"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {number}
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                {title}
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY BRANDS JOIN */}
      <section className="mt-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Why Brands Join
        </div>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
          More than another product listing
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {[
            [
              "Sell complete looks",
              "Your pieces are shown with context, style, and occasion instead of sitting alone in a product grid.",
            ],
            [
              "Reach new customers",
              "Get discovered through curated outfit feeds, lookbooks, and occasion-based collections.",
            ],
            [
              "Look premium on-platform",
              "The site is built to feel editorial, clean, and elevated so your brand presentation stays strong.",
            ],
            [
              "Keep your fulfillment flow",
              "You do not need to hand over inventory. You continue fulfilling your products.",
            ],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-[24px] border border-black/10 bg-white p-6"
            >
              <div className="text-xl font-semibold tracking-[-0.04em] text-black">
                {title}
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ECONOMICS */}
      <section className="mt-14 grid gap-6 rounded-[32px] border border-black/10 bg-[#f7f5f2] p-5 sm:p-7 lg:grid-cols-2 lg:p-8">
        <div className="self-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Vendor Earnings
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Transparent economics
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Customers buy complete outfits. The platform keeps 20%. Vendors keep
            80% of the sale based on the products included in the fit.
          </p>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          {[
            ["Example outfit price", "$200.00"],
            ["Vendor payout 80%", "$160.00"],
            ["Platform fee 20%", "$40.00"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-black/10 py-4 last:border-b-0"
            >
              <span className="text-sm text-neutral-600">{label}</span>
              <strong className="text-lg font-semibold text-black">
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* APPLY */}
      <section
        id="apply"
        className="mt-14 grid gap-6 rounded-[32px] border border-black/10 bg-white p-5 sm:p-7 lg:grid-cols-[0.85fr_1.15fr] lg:p-8"
      >
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Apply
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Become a founding vendor
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Submit your brand information and we’ll review it for upcoming fit
            collections and launch features.
          </p>
        </div>

        <form className="grid gap-4 rounded-[24px] border border-black/10 bg-[#f7f5f2] p-5">
          {[
            ["Brand name", "Your brand name", "text"],
            ["Contact email", "name@brand.com", "email"],
            ["Website", "https://yourbrand.com", "text"],
            ["Instagram / social handle", "@yourbrand", "text"],
          ].map(([label, placeholder, type]) => (
            <label
              key={label}
              className="grid gap-2 text-sm font-semibold text-black"
            >
              {label}
              <input
                type={type}
                placeholder={placeholder}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm font-semibold text-black">
            What do you sell?
            <textarea
              placeholder="Streetwear, casual basics, accessories, premium pieces, etc."
              className="min-h-[120px] resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <button
            type="button"
            className="mt-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Apply as a Vendor
          </button>

          <p className="text-xs leading-5 text-neutral-500">
            This form is ready visually. Next, we can connect it to save vendor
            applications.
          </p>
        </form>
      </section>
    </main>
  );
}