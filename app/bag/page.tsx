import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { removeCartItem, updateCartItemQuantity } from "@/app/cart/actions";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function BagPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Sign in to view your bag.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Your cart is connected to your account so you can save outfits
            across devices.
          </p>
        </section>
      </main>
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          bundle: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  });

  const items = cart?.items ?? [];

  const subtotal = items.reduce((sum, item) => {
    return sum + item.bundle.price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Your bag is empty.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Browse curated outfits and add a full fit to your bag.
          </p>

          <Link
            href="/outfits"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Outfits
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Your Bag
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Review your outfits.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          You have {items.length} item{items.length === 1 ? "" : "s"} ready for
          checkout.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 rounded-[28px] border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[180px_1fr]"
            >
              <Link href={`/outfits/${item.bundle.id}`}>
                {item.bundle.image ? (
                  <img
                    src={item.bundle.image}
                    alt={item.bundle.title}
                    className="h-[220px] w-full rounded-2xl bg-[#f7f5f2] object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center rounded-2xl bg-[#f7f5f2] text-neutral-400 md:h-full">
                    No image
                  </div>
                )}
              </Link>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {item.bundle.occasion}
                </div>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  {item.bundle.title}
                </h2>

                <p className="mt-2 text-sm text-neutral-600">
                  Vendor: {item.bundle.vendor?.name ?? "OutfitInABag"}
                </p>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.bundle.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Price
                    </div>

                    <div className="mt-1 text-xl font-semibold text-black">
                      {fmtCents(item.bundle.price)}
                    </div>
                  </div>

                  <form
                    action={updateCartItemQuantity}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="cartItemId" value={item.id} />

                    <label className="text-sm font-semibold text-neutral-600">
                      Qty
                    </label>

                    <select
                      name="quantity"
                      defaultValue={item.quantity}
                      className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-black"
                    >
                      Update
                    </button>
                  </form>

                  <form action={removeCartItem}>
                    <input type="hidden" name="cartItemId" value={item.id} />

                    <button
                      type="submit"
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Order Summary
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <strong className="text-black">{fmtCents(subtotal)}</strong>
            </div>

            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Shipping</span>
              <strong className="text-black">Calculated at checkout</strong>
            </div>

            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-black">Total</span>
              <strong className="text-black">{fmtCents(subtotal)}</strong>
            </div>
          </div>

          <Link
            href="/api/create-checkout-session?cart=true"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Checkout Securely
          </Link>

          <Link
            href="/outfits"
            className="mt-4 inline-flex w-full justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Continue Shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}