import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClaimVendorPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-semibold">Sign in required</h1>

        <p className="mt-4 text-neutral-600">
          Please sign in to claim your vendor account.
        </p>
      </main>
    );
  }

  const user = await currentUser();

  const email =
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";

  const vendor = await prisma.vendor.findFirst({
    where: {
      email,
    },
  });

  if (!vendor) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-semibold">No vendor found</h1>

        <p className="mt-4 text-neutral-600">
          No vendor account exists for:
        </p>

        <div className="mt-4 rounded-xl bg-[#f7f5f2] p-4 font-medium">
          {email}
        </div>
      </main>
    );
  }

  if (!vendor.clerkUserId) {
    await prisma.vendor.update({
      where: {
        id: vendor.id,
      },
      data: {
        clerkUserId: userId,
      },
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-[32px] border border-black/10 bg-white p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Vendor Connected
        </div>

        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">
          Vendor account claimed.
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          Your Clerk login is now connected to:
        </p>

        <div className="mt-5 rounded-2xl bg-[#f7f5f2] p-5">
          <div className="text-2xl font-semibold">
            {vendor.name}
          </div>

          <div className="mt-2 text-neutral-600">
            {vendor.email}
          </div>
        </div>

        <a
          href="/vendor/dashboard"
          className="mt-8 inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white"
        >
          Go to Vendor Dashboard
        </a>
      </div>
    </main>
  );
}