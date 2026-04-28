import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function approveVendorApplication(formData: FormData) {
  "use server";

  const applicationId = String(formData.get("applicationId") || "");

  if (!applicationId) {
    throw new Error("Missing application ID");
  }

  const application = await prisma.vendorApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Vendor application not found");
  }

  await prisma.vendor.upsert({
    where: { email: application.contactEmail },
    update: {
      name: application.brandName,
      status: "approved",
    },
    create: {
      name: application.brandName,
      email: application.contactEmail,
      status: "approved",
    },
  });

  await prisma.vendorApplication.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
    },
  });

  revalidatePath("/admin/vendor-applications");
  revalidatePath("/admin/vendors");
}

async function rejectVendorApplication(formData: FormData) {
  "use server";

  const applicationId = String(formData.get("applicationId") || "");

  if (!applicationId) {
    throw new Error("Missing application ID");
  }

  await prisma.vendorApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
    },
  });

  revalidatePath("/admin/vendor-applications");
}

export default async function VendorApplicationsPage() {
  const applications = await prisma.vendorApplication.findMany({
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
          Vendor Applications
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          Review vendor applications, approve real vendors, or reject leads.
        </p>
      </section>

      <section className="mt-8 space-y-5">
        {applications.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-white p-6">
            No vendor applications yet.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="rounded-[24px] border border-black/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                    {app.brandName}
                  </h2>

                  <p className="mt-2 text-sm text-neutral-600">
                    {app.contactEmail}
                  </p>

                  {app.website && (
                    <p className="mt-1 text-sm text-neutral-600">
                      {app.website}
                    </p>
                  )}

                  {app.instagram && (
                    <p className="mt-1 text-sm text-neutral-600">
                      {app.instagram}
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    app.status === "APPROVED"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : app.status === "REJECTED"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-black/10 bg-[#f7f5f2] text-black"
                  }`}
                >
                  {app.status}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Products
                </div>

                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {app.products}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <form action={approveVendorApplication}>
                  <input type="hidden" name="applicationId" value={app.id} />

                  <button
                    type="submit"
                    disabled={app.status === "APPROVED"}
                    className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Approve Vendor
                  </button>
                </form>

                <form action={rejectVendorApplication}>
                  <input type="hidden" name="applicationId" value={app.id} />

                  <button
                    type="submit"
                    disabled={app.status === "REJECTED"}
                    className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reject
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