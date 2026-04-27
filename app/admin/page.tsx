import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Admin
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Manage OutfitInABag.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
          Access your admin tools for bundles, vendors, and orders.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/bundles"
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Bundles
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Orders
          </Link>

          <Link
            href="/admin/vendors"
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Vendors
          </Link>
        </div>
      </section>
    </main>
  );
}