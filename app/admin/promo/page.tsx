import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

import {
  createPromoCode,
  togglePromoCode,
  deletePromoCode,
  updatePromoCode,
} from "./actions";

export const dynamic = "force-dynamic";

function fmtPromo(promo: {
  percentOff: number | null;
  amountOffCents: number | null;
}) {
  if (promo.percentOff) return `${promo.percentOff}% off`;
  if (promo.amountOffCents) return `$${(promo.amountOffCents / 100).toFixed(2)} off`;
  return "No discount";
}

export default async function AdminPromoPage() {
  await requireAdmin();

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Admin
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Promo Codes
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Create, edit, disable, and delete discount codes.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            ← Admin Home
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
            New discount
          </h2>

          <form action={createPromoCode} className="mt-6 grid gap-4">
            <input
              name="code"
              required
              placeholder="WELCOME10"
              className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm font-semibold uppercase text-black"
            />

            <input
              name="description"
              placeholder="10% off first order"
              className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="percentOff"
                type="number"
                min="1"
                max="100"
                placeholder="% Off"
                className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />

              <input
                name="amountOffDollars"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="$ Off"
                className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />
            </div>

            <input
              name="maxUses"
              type="number"
              min="1"
              placeholder="Max uses"
              className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
            />

            <button
              type="submit"
              className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Create Promo Code
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">
              Promotions
            </h2>

            <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-sm font-semibold text-black">
              {promos.length} Total
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            {promos.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
                No promo codes yet.
              </div>
            ) : (
              promos.map((promo) => (
                <div
                  key={promo.id}
                  className="rounded-3xl border border-black/10 bg-[#f7f5f2] p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="font-mono text-2xl font-semibold text-black">
                          {promo.code}
                        </div>

                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                            promo.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {promo.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-neutral-600">
                        {promo.description || "No description"}
                      </div>

                      <div className="mt-3 text-lg font-semibold text-black">
                        {fmtPromo(promo)}
                      </div>

                      <div className="mt-2 text-xs text-neutral-500">
                        Used {promo.usedCount}
                        {promo.maxUses ? ` / ${promo.maxUses}` : " times"}
                      </div>
                    </div>

                    <div className="w-full xl:w-[320px]">
                      <form
                        action={updatePromoCode}
                        className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4"
                      >
                        <input type="hidden" name="promoId" value={promo.id} />

                        <input
                          name="code"
                          defaultValue={promo.code}
                          className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold uppercase text-black"
                        />

                        <input
                          name="description"
                          defaultValue={promo.description || ""}
                          placeholder="Description"
                          className="rounded-xl border border-black/10 px-4 py-3 text-sm text-black"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            name="percentOff"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="% Off"
                            defaultValue={promo.percentOff || ""}
                            className="rounded-xl border border-black/10 px-4 py-3 text-sm text-black"
                          />

                          <input
                            name="amountOffDollars"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="$ Off"
                            defaultValue={
                              promo.amountOffCents
                                ? (promo.amountOffCents / 100).toFixed(2)
                                : ""
                            }
                            className="rounded-xl border border-black/10 px-4 py-3 text-sm text-black"
                          />
                        </div>

                        <input
                          name="maxUses"
                          type="number"
                          min="1"
                          placeholder="Max Uses"
                          defaultValue={promo.maxUses || ""}
                          className="rounded-xl border border-black/10 px-4 py-3 text-sm text-black"
                        />

                        <button
                          type="submit"
                          className="rounded-full bg-black px-4 py-3 text-xs font-semibold text-white"
                        >
                          Save Changes
                        </button>
                      </form>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <form action={togglePromoCode}>
                          <input type="hidden" name="promoId" value={promo.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-xs font-semibold text-black"
                          >
                            {promo.isActive ? "Disable" : "Enable"}
                          </button>
                        </form>

                        <form action={deletePromoCode}>
                          <input type="hidden" name="promoId" value={promo.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}