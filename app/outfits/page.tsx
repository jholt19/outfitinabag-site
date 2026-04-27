"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OUTFITS, type Occasion } from "../../lib/outfits";

const OCCASIONS: (Occasion | "ALL")[] = [
  "ALL",
  "VACATION",
  "FORMAL",
  "CASUAL",
  "WEDDING",
];

export default function OutfitsPage() {
  const [category, setCategory] = useState<Occasion | "ALL">("ALL");

  const filtered = useMemo(() => {
    return category === "ALL"
      ? OUTFITS
      : OUTFITS.filter((o) => o.occasion === category);
  }, [category]);

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
              Pick an occasion and shop a complete outfit bundle in one place.
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
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                category === c
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black hover:border-black"
              }`}
            >
              {c === "ALL" ? "All" : c.toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o) => (
          <article
            key={o.id}
            className="group overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <Link href={`/outfits/${o.id}`} className="block">
              <div className="relative h-[360px] overflow-hidden bg-[#f7f5f2]">
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-black/10 bg-[#f7f5f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black">
                  {o.occasion}
                </span>

                <span className="text-sm font-semibold text-black">
                  ${(o.price / 100).toFixed(2)}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
                {o.title}
              </h2>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-neutral-600">
                {o.description}
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href={`/bag?addBundleId=${o.id}`}
                  className="rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Add Full Fit to Bag
                </Link>

                <Link
                  href={`/outfits/${o.id}`}
                  className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-black"
                >
                  View Outfit
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}