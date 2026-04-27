import Link from "next/link";
import Image from "next/image";

const featuredVendors = [
  {
    name: "Monroe Collection",
    category: "Luxury Casualwear",
    image: "/outfits/cas-1.jpg",
  },
  {
    name: "Prestige Formal",
    category: "Formal Essentials",
    image: "/outfits/form-1.jpg",
  },
  {
    name: "Golden Hour",
    category: "Resort & Vacation Looks",
    image: "/outfits/for-1.jpg",
  },
];

export default function VendorsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      {/* HERO */}
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
            OutfitInABag partners with brands that elevate the full shopping
            experience. Customers discover complete looks, not random products.
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

      {/* VENDOR GRID */}
      <section className="mt-14">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Current Partners
        </div>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
          Featured vendor brands
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredVendors.map((vendor) => (
            <div
              key={vendor.name}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white"
            >
              <div className="relative h-[320px]">
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {vendor.category}
                </div>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                  {vendor.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Featured in curated occasion-based outfits and styled lookbook
                  collections across the platform.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="mt-14 grid gap-6 rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Why It Works
          </div>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl">
            Better than a normal marketplace
          </h2>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Instead of endless product grids, vendors are placed inside complete
            outfits built around occasions, style, and real customer intent.
          </p>
        </div>

        <div className="grid gap-4">
          {[
            "Higher-value purchases through complete outfits",
            "Better discovery through curated styling",
            "Premium editorial presentation for your brand",
            "Stronger trust and conversion for customers",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-5 py-4 text-sm font-medium text-black"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-[32px] border border-black/10 bg-black p-6 text-white sm:p-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Founding Vendor Program
          </div>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Join early. Get premium visibility.
          </h2>

          <p className="mt-4 text-base leading-7 text-white/80">
            Founding vendors receive stronger homepage placement, featured
            lookbook exposure, and launch visibility as the platform grows.
          </p>

          <Link
            href="/sell"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}