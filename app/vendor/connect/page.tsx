import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VendorConnectPage({
  searchParams,
}: {
  searchParams?: Promise<{ vendorId?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const vendorId = params?.vendorId || "";

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });

  const selectedVendor = vendorId
    ? vendors.find((vendor) => vendor.id === vendorId)
    : null;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Stripe Connect
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Connect your payouts.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          Select your vendor account, then connect Stripe to receive payouts.
        </p>

        <div className="mt-8 rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-sm font-semibold text-black">Vendor Account</div>

          <div className="mt-4 grid gap-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendor/connect?vendorId=${vendor.id}`}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  vendor.id === vendorId
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-[#f7f5f2] text-black hover:border-black"
                }`}
              >
                {vendor.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {selectedVendor ? (
            <Link
              href={`/api/stripe/connect?vendorId=${selectedVendor.id}`}
              className="inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Connect Stripe Account
            </Link>
          ) : (
            <span className="inline-flex rounded-full bg-neutral-300 px-6 py-4 text-sm font-semibold text-neutral-600">
              Select Vendor First
            </span>
          )}

          <Link
            href={
              selectedVendor
                ? `/vendor/dashboard?vendorId=${selectedVendor.id}`
                : "/vendor/dashboard"
            }
            className="inline-flex rounded-full border border-black/15 bg-white px-6 py-4 text-sm font-semibold text-black transition hover:border-black"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}