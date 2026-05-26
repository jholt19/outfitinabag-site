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
  if (promo.percentOff) {
    return `${promo.percentOff}% off`;
  }

  if (promo.amountOffCents) {
    return `$${(promo.amountOffCents / 100).toFixed(2)} off`;
  }

  return "No discount";
}

function getMessage(
  error?: string,
  created?: string,
  updated?: string,
  deleted?: string
) {
  if (created) {
    return {
      type: "success",
      text: "Promo code saved successfully.",
    };
  }

  if (updated) {
    return {
      type: "success",
      text: "Promo code updated successfully.",
    };
  }

  if (deleted) {
    return {
      type: "success",
      text: "Promo code deleted successfully.",
    };
  }

  if (error === "missingCode") {
    return {
      type: "error",
      text: "Enter a promo code.",
    };
  }

  if (error === "invalidCode") {
    return {
      type: "error",
      text: "Code must be 3–30 characters using letters, numbers, underscores, or dashes.",
    };
  }

  if (error === "chooseOneDiscount") {
    return {
      type: "error",
      text: "Use either Percent Off OR Dollar Off.",
    };
  }

  if (error === "missingDiscount") {
    return {
      type: "error",
      text: "Enter a discount amount.",
    };
  }

  if (error === "percentTooHigh") {
    return {
      type: "error",
      text: "Percent off cannot exceed 100.",
    };
  }

  return null;
}

export default async function AdminPromoPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    created?: string;
    updated?: string;
    deleted?: string;
  }>;
}) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};

  const message = getMessage(
    params.error,
    params.created,
    params.updated,
    params.deleted
  );

  const promos = await prisma.promoCode.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      {/* HERO */}
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
              Create, edit, disable, and delete customer discount codes.
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

      {/* ALERT */}
      {message && (
        <section
          className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* CREATE */}
        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Create Promo
          </div>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            New discount
          </h2>

          <form action={createPromoCode} className="mt-6 grid gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Code
              </label>

              <input
                name="code"
                required
                placeholder="WELCOME10"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm font-semibold uppercase text-black"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Description
              </label>

              <input
                name="description"
                placeholder="10% off first order"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Percent Off
                </label>

                <input
                  name="percentOff"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="10"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Dollar Off
                </label>

                <input
                  name="amountOffDollars"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Leave blank"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Max Uses
              </label>

              <input
                name="maxUses"
                type="number"
                min="1"
                placeholder="Unlimited"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm text-black"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Save Promo Code
            </button>
          </form>
        </div>

        {/* PROMO LIST */}
        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Active Codes
              </div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                Promotions
              </h2>
            </div>

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
                    {/* INFO */}
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
                        {promo.maxUses
                          ? ` / ${promo.maxUses}`
                          : " times"}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="w-full xl:w-[320px]">
                      <form
                        action={updatePromoCode}
                        className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4"
                      >
                        <input
                          type="hidden"
                          name="promoId"
                          value={promo.id}
                        />

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
                                ? (
                                    promo.amountOffCents / 100
                                  ).toFixed(2)
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

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="submit"
                            className="rounded-full bg-black px-4 py-3 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                      </form>

                      <form action={togglePromoCode}>
                        <input
                          type="hidden"
                          name="promoId"
                          value={promo.id}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-xs font-semibold text-black"
                        >
                          {promo.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>

                      <form action={deletePromoCode}>
                        <input
                          type="hidden"
                          name="promoId"
                          value={promo.id}
                        />

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
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}