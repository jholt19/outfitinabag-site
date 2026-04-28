import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
          Review and manage incoming vendor applications.
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
                  <h2 className="text-2xl font-semibold text-black">
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

                <div className="rounded-full border border-black/10 bg-[#f7f5f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
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
            </div>
          ))
        )}
      </section>
    </main>
  );
}