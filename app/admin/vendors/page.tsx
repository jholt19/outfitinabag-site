import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Admin
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Vendors
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          Review all vendors across the platform including approved and pending accounts.
        </p>
      </section>

      <section className="mt-8 space-y-5">
        {vendors.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-white p-6">
            No vendors found yet.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-[24px] border border-black/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                    {vendor.name}
                  </h2>

                  <p className="mt-2 text-sm text-neutral-600">
                    {vendor.email}
                  </p>

                  <p className="mt-2 text-xs text-neutral-400">
                    Created: {new Date(vendor.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    vendor.status === "approved"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : vendor.status === "rejected"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-black/10 bg-[#f7f5f2] text-black"
                  }`}
                >
                  {vendor.status}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <div className="mt-8">
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}