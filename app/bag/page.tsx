"use client";

import { useEffect, useMemo, useState } from "react";
import { OUTFITS } from "@/lib/outfits";
import Image from "next/image";
import Link from "next/link";

type BagItem = {
  id: string;
  title: string;
  image: string;
  occasion: string;
  price: number;
};

export default function BagPage() {
  const [items, setItems] = useState<BagItem[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bundleId = params.get("addBundleId");

    if (bundleId) {
      const found = OUTFITS.find((o) => String(o.id) === String(bundleId));

      if (found) {
        setItems([found]);
        setJustAdded(true);
      }
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price, 0),
    [items]
  );

  async function handleCheckout() {
    if (items.length === 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            qty: 1,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Your Bag
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Review your outfit.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
              Your selected outfit bundle is ready for checkout.
            </p>
          </div>

          <Link
            href="/outfits"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      {justAdded && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
          Full outfit added to your bag.
        </div>
      )}

      {items.length === 0 ? (
        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
            Your bag is empty
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
            Browse curated outfit bundles and add a complete look to your bag.
          </p>

          <Link
            href="/outfits"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Outfits
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-[28px] border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-[140px_1fr]"
              >
                <div className="relative h-[220px] overflow-hidden rounded-[22px] border border-black/10 sm:h-[140px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      Full Outfit • {item.occasion}
                    </div>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Complete curated look selected for one-click checkout.
                    </p>
                  </div>

                  <div className="mt-4 text-xl font-semibold text-black">
                    ${(item.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Order Summary
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <strong className="text-black">
                  ${(subtotal / 100).toFixed(2)}
                </strong>
              </div>

              <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
                <span className="text-neutral-600">Estimated shipping</span>
                <strong className="text-black">Calculated at checkout</strong>
              </div>

              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-black">Total</span>
                <strong className="text-black">
                  ${(subtotal / 100).toFixed(2)}
                </strong>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Starting Checkout..." : "Checkout Securely"}
            </button>

            <div className="mt-5 grid gap-3 text-xs leading-5 text-neutral-500">
              <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                Secure checkout powered by Stripe.
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                Your full outfit bundle stays together in one order.
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}