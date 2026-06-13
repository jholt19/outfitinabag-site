import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (!cents) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function promoValueLabel(promo: {
  percentOff: number | null;
  amountOffCents: number | null;
}) {
  if (promo.percentOff) return `${promo.percentOff}% off`;
  if (promo.amountOffCents) return `${fmtCents(promo.amountOffCents)} off`;
  return "No discount";
}

export default async function VendorPromosPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to manage vendor promo codes.
          </p>
        </section>
      </main>
    );
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      clerkUserId: userId,
    },
    include: {
      promoCodes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!vendor) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Vendor account not connected
          </h1>

          <p className="mt-3 text-neutral-600">
            Claim your vendor account before creating promo codes.
          </p>

          <Link
            href="/vendor/claim"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Claim Vendor Account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Vendor Promos
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Discount codes.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
              Create promo codes customers can use at checkout for your vendor
              products.
            </p>
          </div>

          <Link
            href="/vendor/dashboard"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            ← Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="h-fit rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Create Promo Code
          </div>

          <form
            action="/api/vendor/promos/create"
            method="POST"
            className="mt-6 grid gap-4"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Code
              </label>

              <input
                name="code"
                placeholder="HOLT10"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm font-semibold uppercase text-black"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Description
              </label>

              <input
                name="description"
                placeholder="10% off launch promo"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Percent Off
              </label>

              <input
                name="percentOff"
                type="number"
                min="1"
                max="90"
                placeholder="10"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />

              <p className="mt-2 text-xs text-neutral-500">
                Use percent off for now. Leave blank if using fixed dollar
                amount later.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Max Uses
              </label>

              <input
                name="maxUses"
                type="number"
                min="1"
                placeholder="100"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create Promo
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Your Codes
              </div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                {vendor.promoCodes.length} Promo
                {vendor.promoCodes.length === 1 ? "" : "s"}
              </h2>
            </div>
          </div>

          {vendor.promoCodes.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-sm text-neutral-600">
              No promo codes yet. Create your first discount code.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {vendor.promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-semibold tracking-[-0.04em] text-black">
                        {promo.code}
                      </div>

                      <p className="mt-2 text-sm text-neutral-600">
                        {promo.description || "No description"}
                      </p>
                    </div>

                    <div
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                        promo.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-black/10 bg-white text-neutral-500"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        Discount
                      </div>

                      <div className="mt-2 text-xl font-semibold text-black">
                        {promoValueLabel(promo)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        Used
                      </div>

                      <div className="mt-2 text-xl font-semibold text-black">
                        {promo.usedCount}
                        {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        Created
                      </div>

                      <div className="mt-2 text-sm font-semibold text-black">
                        {new Date(promo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <form
                    action="/api/vendor/promos/toggle"
                    method="POST"
                    className="mt-5"
                  >
                    <input type="hidden" name="promoId" value={promo.id} />

                    <button
                      type="submit"
                      className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
                    >
                      {promo.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}