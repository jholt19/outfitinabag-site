"use client";

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

        <form
          className="grid gap-4 rounded-[24px] border border-black/10 bg-[#f7f5f2] p-5"
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const formData = new FormData(form);

            const payload = {
              brandName: formData.get("brandName"),
              contactEmail: formData.get("contactEmail"),
              website: formData.get("website"),
              instagram: formData.get("instagram"),
              products: formData.get("products"),
            };

            const res = await fetch("/api/vendor-applications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data?.error || "Failed to submit application.");
              return;
            }

            alert("Vendor application submitted successfully!");
            form.reset();
          }}
        >
          <label className="grid gap-2 text-sm font-semibold text-black">
            Brand name
            <input
              name="brandName"
              type="text"
              required
              placeholder="Your brand name"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-black">
            Contact email
            <input
              name="contactEmail"
              type="email"
              required
              placeholder="name@brand.com"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-black">
            Website
            <input
              name="website"
              type="text"
              placeholder="https://yourbrand.com"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-black">
            Instagram / social handle
            <input
              name="instagram"
              type="text"
              placeholder="@yourbrand"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-black">
            What do you sell?
            <textarea
              name="products"
              required
              placeholder="Streetwear, casual basics, accessories, premium pieces, etc."
              className="min-h-[120px] resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Apply as a Vendor
          </button>

          <p className="text-xs leading-5 text-neutral-500">
            Your application will be reviewed for upcoming curated outfit collections.
          </p>
        </form>
      </section>
    </main>
  );
}