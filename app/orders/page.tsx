import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          My Orders
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Track your outfit orders.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
          Order tracking is coming soon. After checkout, your order details will
          appear here.
        </p>

        <Link
          href="/outfits"
          className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Shop Outfits
        </Link>
      </section>
    </main>
  );
}