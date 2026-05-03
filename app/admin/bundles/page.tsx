import { prisma } from "@/lib/prisma";
import { toggleBundleFeatured, toggleBundlePublished } from "./actions/toggle";
import { updateBundleTitle } from "./actions/updateTitle";
import { updateBundleImage } from "./actions/updateImage";
import { updateBundleRetailValue } from "./actions/updateRetailValue";
import { updateBundleTier } from "./actions/updateTier";
import { approveBundle } from "./actions/approve";
import { uploadCloudinaryImage } from "./actions/uploadCloudinaryImage";
import Image from "next/image";
export const dynamic = "force-dynamic";

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundle.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: true },
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
              Bundle Review
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Review vendor bundles, upload premium images, publish to storefront,
              and feature top-performing fits.
            </p>
          </div>

          <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
            {bundles.length} Total Bundles
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        {bundles.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-white p-6">
            No bundles found in the database.
          </div>
        ) : (
          bundles.map((b) => (
            <div
              key={b.id}
              className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    {b.occasion}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                    {b.title}
                  </h2>

                  <p className="mt-2 text-sm text-neutral-600">
                    Vendor: {b.vendor?.name ?? "—"}
                  </p>

                  <p className="mt-1 text-sm text-neutral-600">
                    Price: ${(b.price / 100).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {b.submittedForReview ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      Submitted
                    </span>
                  ) : (
                    <span className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                      Draft
                    </span>
                  )}

                  {b.published && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      Published
                    </span>
                  )}

                  {b.isFeatured && (
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-purple-700">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {b.image && (
                <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm break-all text-neutral-700">
                  <strong>Current Image:</strong>
                  <br />
                  {b.image}
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <form action={updateBundleTitle} className="grid gap-2">
                  <input type="hidden" name="bundleId" value={b.id} />

                  <label className="text-sm font-semibold text-black">
                    Title
                  </label>

                  <input
                    name="title"
                    defaultValue={b.title}
                    className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm"
                  />

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black"
                  >
                    Save Title
                  </button>
                </form>

                <form action={updateBundleImage} className="grid gap-2">
                  <input type="hidden" name="bundleId" value={b.id} />

                  <label className="text-sm font-semibold text-black">
                    Manual Image URL / Path
                  </label>

                  <input
                    name="image"
                    defaultValue={b.image ?? ""}
                    placeholder="/outfits/for-1.jpg or https://..."
                    className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm"
                  />

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black"
                  >
                    Save Image
                  </button>
                </form>
              </div>

              <form
                action={uploadCloudinaryImage}
                className="mt-6 grid gap-2 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4"
              >
                <input type="hidden" name="bundleId" value={b.id} />

                <label className="text-sm font-semibold text-black">
                  Upload Image to Cloudinary
                </label>

                <input
                  name="imageUrl"
                  required
                  placeholder="Paste image URL here"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
                />

                <button
                  type="submit"
                  className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Upload & Save Image
                </button>
              </form>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <form action={updateBundleTier} className="grid gap-2">
                  <input type="hidden" name="bundleId" value={b.id} />

                  <label className="text-sm font-semibold text-black">
                    Tier
                  </label>

                  <select
                    name="tier"
                    defaultValue={b.tier ?? ""}
                    className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm"
                  >
                    <option value="">Select Tier</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PLUS">PLUS</option>
                    <option value="ELITE">ELITE</option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black"
                  >
                    Save Tier
                  </button>
                </form>

                <form action={updateBundleRetailValue} className="grid gap-2">
                  <input type="hidden" name="bundleId" value={b.id} />

                  <label className="text-sm font-semibold text-black">
                    Retail Value
                  </label>

                  <input
                    name="retailValue"
                    defaultValue={b.retailValue ?? ""}
                    placeholder="249"
                    className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm"
                  />

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black"
                  >
                    Save Retail
                  </button>
                </form>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {b.submittedForReview && !b.published && (
                  <form action={approveBundle}>
                    <input type="hidden" name="bundleId" value={b.id} />

                    <button
                      type="submit"
                      className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Approve Bundle
                    </button>
                  </form>
                )}

                <form action={toggleBundlePublished}>
                  <input type="hidden" name="bundleId" value={b.id} />

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black"
                  >
                    {b.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <form action={toggleBundleFeatured}>
                  <input type="hidden" name="bundleId" value={b.id} />

                  <button
                    type="submit"
                    className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black"
                  >
                    {b.isFeatured ? "Remove Feature" : "Feature Bundle"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}