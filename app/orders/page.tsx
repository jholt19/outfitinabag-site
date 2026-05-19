import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fulfillmentBadge(status: string) {
  const styles =
    status === "DELIVERED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "SHIPPED"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : status === "PROCESSING"
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : status === "CANCELLED"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles}`}
    >
      {status}
    </span>
  );
}

export default async function CustomerOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in to view your orders.
          </h1>

          <p className="mt-3 text-neutral-600">
            Your order history will appear here after checkout.
          </p>
        </section>
      </main>
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { clerkUserId: userId },
        ...(email ? [{ email }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          bundle: true,
          vendor: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          My Orders
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Order history.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          Purchases connected to {email || "your account"}.
        </p>
      </section>

      {orders.length === 0 ? (
        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
          <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5 text-neutral-600">
            No orders yet.
          </div>

          <Link
            href="/outfits"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Shop Outfits
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[28px] border border-black/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Order
                  </div>

                  <div className="mt-2 font-mono text-sm text-black">
                    OIAB-{order.orderNumber ?? "—"}
                  </div>

                  <div className="mt-3 text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>

                  <div className="mt-1 text-sm text-neutral-600">
                    Payment Status: {order.status ?? "unknown"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Total
                  </div>

                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                    {fmtCents(order.amountTotal)}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-black/10 pt-6">
                {order.items.map((item) => {
                  const status = item.fulfillmentStatus || "PENDING";

                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 sm:grid-cols-[110px_1fr]"
                    >
                      {item.image || item.bundle?.image ? (
                        <img
                          src={item.image || item.bundle?.image || ""}
                          alt={item.title}
                          className="h-[130px] w-full rounded-xl object-cover sm:h-full"
                        />
                      ) : (
                        <div className="flex h-[130px] items-center justify-center rounded-xl bg-white text-neutral-400">
                          No image
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-lg font-semibold text-black">
                            {item.title}
                          </div>

                          {fulfillmentBadge(status)}
                        </div>

                        <div className="mt-2 text-sm text-neutral-600">
                          Vendor: {item.vendor?.name ?? "OutfitInABag"}
                        </div>

                        <div className="mt-1 text-sm text-neutral-600">
                          Qty {item.quantity} • Unit {fmtCents(item.unitPrice)}
                        </div>

                        <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Fulfillment Status
                          </div>

                          <div className="mt-2">
                            {fulfillmentBadge(status)}
                          </div>

                          {status === "PROCESSING" && (
                            <p className="mt-3 text-sm text-neutral-600">
                              Your order is currently being prepared by the
                              vendor.
                            </p>
                          )}

                          {status === "SHIPPED" && (
                            <p className="mt-3 text-sm text-neutral-600">
                              Your package has shipped and is currently in
                              transit.
                            </p>
                          )}

                          {status === "DELIVERED" && (
                            <p className="mt-3 text-sm text-neutral-600">
                              Your package has been delivered successfully.
                            </p>
                          )}

                          {status === "CANCELLED" && (
                            <p className="mt-3 text-sm text-neutral-600">
                              This order item was cancelled.
                            </p>
                          )}
                        </div>

                        {(item.trackingCarrier || item.trackingNumber) && (
                          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                              Shipping Tracking
                            </div>

                            {item.trackingCarrier && (
                              <div className="mt-2 text-sm text-black">
                                <span className="font-semibold">Carrier:</span>{" "}
                                {item.trackingCarrier}
                              </div>
                            )}

                            {item.trackingNumber && (
                              <div className="mt-1 text-sm text-black">
                                <span className="font-semibold">
                                  Tracking #:
                                </span>{" "}
                                {item.trackingNumber}
                              </div>
                            )}

                            {status === "SHIPPED" && (
                              <p className="mt-3 text-sm text-blue-700">
                                Your tracking information was provided by the
                                vendor.
                              </p>
                            )}
                          </div>
                        )}

                        {item.bundleId ? (
                          <Link
                            href={`/outfits/${item.bundleId}`}
                            className="mt-4 inline-flex rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-black transition hover:border-black"
                          >
                            View Outfit
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}