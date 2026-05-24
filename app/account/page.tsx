import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusColor(status?: string | null) {
  switch ((status || "").toUpperCase()) {
    case "PAID":
    case "COMPLETE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PROCESSING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "SHIPPED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-black/10 bg-[#f7f5f2] text-neutral-700";
  }
}

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in to view your account.
          </h1>

          <p className="mt-3 text-neutral-600">
            Once you sign in, your orders and saved outfits will appear here.
          </p>
        </section>
      </main>
    );
  }

  const user = await currentUser();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const orders = email
    ? await prisma.order.findMany({
        where: {
          OR: [
            { email },
            { clerkUserId: userId },
          ],
        },

        include: {
          items: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      })
    : [];

  const savedOutfits = await prisma.savedOutfit.findMany({
    where: {
      userId,
    },

    include: {
      bundle: {
        include: {
          vendor: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.amountTotal || 0),
    0
  );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          My Account
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Welcome back.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          {email}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/outfits"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Shop Outfits
          </Link>

          <Link
            href="/bag"
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            View Bag
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Orders
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {orders.length}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Total Spent
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {fmtCents(totalSpent)}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Saved Outfits
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {savedOutfits.length}
          </div>
        </div>
      </section>

      {/* ORDER HISTORY */}
      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Purchase History
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Recent Orders
            </h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[24px] border border-black/10 bg-[#f7f5f2] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Order Number
                    </div>

                    <div className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-black">
                      OIAB-{order.orderNumber ?? "—"}
                    </div>

                    <div className="mt-2 text-sm text-neutral-600">
                      {fmtDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status || "Processing"}
                    </div>

                    <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">
                      {fmtCents(order.amountTotal)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-20 w-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f7f5f2] text-xs text-neutral-400">
                          No image
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-semibold text-black">
                          {item.title}
                        </div>

                        <div className="mt-1 text-sm text-neutral-600">
                          Quantity: {item.quantity}
                        </div>

                        <div className="mt-1 text-sm text-neutral-600">
                          {fmtCents(item.unitPrice)}
                        </div>
                      </div>

                      <div
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${statusColor(
                          item.fulfillmentStatus
                        )}`}
                      >
                        {item.fulfillmentStatus || "Pending"}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SAVED OUTFITS */}
      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Wishlist
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              Saved Outfits
            </h2>
          </div>
        </div>

        {savedOutfits.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
            You have not saved any outfits yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedOutfits.map((saved) => (
              <article
                key={saved.id}
                className="overflow-hidden rounded-[24px] border border-black/10 bg-[#f7f5f2]"
              >
                <Link href={`/outfits/${saved.bundle.id}`}>
                  {saved.bundle.image ? (
                    <img
                      src={saved.bundle.image}
                      alt={saved.bundle.title}
                      className="h-[300px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center bg-white text-neutral-400">
                      No image
                    </div>
                  )}
                </Link>

                <div className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {saved.bundle.occasion}
                  </div>

                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                    {saved.bundle.title}
                  </h3>

                  <p className="mt-2 text-sm text-neutral-600">
                    By {saved.bundle.vendor?.name ?? "OutfitInABag"}
                  </p>

                  <div className="mt-4 text-lg font-semibold text-black">
                    {fmtCents(saved.bundle.price)}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <Link
                      href={`/outfits/${saved.bundle.id}`}
                      className="rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      View Outfit
                    </Link>

                    <Link
                      href={`/bag?addBundleId=${saved.bundle.id}`}
                      className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-black"
                    >
                      Add to Bag
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}