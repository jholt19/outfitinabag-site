import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type Props = {
  params: Promise<{
    vendorId: string;
  }>;
};

export default async function AdminEditVendorPage({ params }: Props) {
  await requireAdmin();

  const { vendorId } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex gap-3">
        <Link
          href="/admin/vendors"
          className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
        >
          ← Vendors
        </Link>

        <Link
          href={`/vendors/${vendor.id}`}
          className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
        >
          View Storefront
        </Link>
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white p-6">
        <h1 className="text-4xl font-semibold tracking-[-0.04em]">
          Edit Vendor Profile
        </h1>

        <p className="mt-2 text-neutral-600">
          Admin editing for {vendor.name}
        </p>

        <form
          action={`/api/admin/vendors/${vendor.id}/update`}
          method="POST"
          className="mt-8 grid gap-5"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Vendor Name
            </label>

            <input
              name="name"
              defaultValue={vendor.name}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Category
            </label>

            <input
              name="category"
              defaultValue={vendor.category ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Bio
            </label>

            <textarea
              name="bio"
              rows={6}
              defaultValue={vendor.bio ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Logo URL
            </label>

            <input
              name="logo"
              defaultValue={vendor.logo ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Banner URL
            </label>

            <input
              name="bannerImage"
              defaultValue={vendor.bannerImage ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Instagram
            </label>

            <input
              name="instagram"
              defaultValue={vendor.instagram ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Website
            </label>

            <input
              name="website"
              defaultValue={vendor.website ?? ""}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Save Vendor
          </button>
        </form>
      </div>
    </main>
  );
}