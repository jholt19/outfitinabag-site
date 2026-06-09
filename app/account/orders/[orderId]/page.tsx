import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function trackingUrl(carrier?: string | null, trackingNumber?: string | null) {
  if (!trackingNumber) return null;

  const normalizedCarrier = String(carrier || "").toUpperCase();

  if (normalizedCarrier === "UPS") {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }

  if (normalizedCarrier === "USPS") {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  }

  if (normalizedCarrier === "FEDEX") {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  }

  return null;
}

function fulfillmentBadge(status: string | null | undefined) {
  const value = status || "PENDING";

  const styles =
    value === "DELIVERED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "SHIPPED"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${styles}`}
    >
      {value}
    </span>
  );
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { userId } = await auth();
  const { orderId } = await params;

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-[32px] border border-black/10 bg-white p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.04em]">
            Sign in required
          </h1>

          <p className="mt-3 text-neutral-600">
            Please sign in to view this order.
          </p>

          <Link
            href="/account"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Account
          </Link>
        </section>
      </main>
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      clerkUserId: userId,
    },
    include: {
      items: {
        include: {
          vendor: true,
          bundle: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <Link
        href="/account/orders"
        className="inline-flex rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
      >
        ← Back to Orders
      </Link>

      <section className="mt-6 rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Order Tracking
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(2.7rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Order #{order.orderNumber ?? order.id.slice(-6).toUpperCase()}
            </h1>

            <p className="mt-4 text-base leading-7 text-neutral-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
            {fmtCents(order.amountTotal)}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Payment Status
          </div>

          <div className="mt-2 text-2xl font-semibold text-black">
            {order.status || "PROCESSING"}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Items
          </div>

          <div className="mt-2 text-2xl font-semibold text-black">
            {order.items.length}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Customer Email
          </div>

          <div className="mt-2 text-sm font-semibold text-black">
            {order.email || "—"}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Shipment Details
        </div>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
          Tracking by item
        </h2>

        <div className="mt-6 grid gap-5">
          {order.items.map((item) => {
            const url = trackingUrl(item.trackingCarrier, item.trackingNumber);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {item.image ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-black">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-600">
                        Vendor: {item.vendor?.name ?? "OutfitInABag"}
                      </p>

                      <p className="mt-1 text-sm text-neutral-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {fulfillmentBadge(item.fulfillmentStatus)}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Carrier
                    </div>

                    <div className="mt-2 text-sm font-semibold text-black">
                      {item.trackingCarrier || "Not added yet"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Tracking Number
                    </div>

                    <div className="mt-2 break-all text-sm font-semibold text-black">
                      {item.trackingNumber || "Not added yet"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Track Package
                    </div>

                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-semibold text-black underline"
                      >
                        Open Carrier Tracking
                      </a>
                    ) : (
                      <div className="mt-2 text-sm font-semibold text-neutral-400">
                        Waiting on tracking
                      </div>
                    )}
                  </div>
                </div>

                {item.fulfillmentStatus === "DELIVERED" && item.vendor ? (
                  <div className="mt-5">
                    <Link
                      href={`/vendors/${item.vendor.id}`}
                      className="inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Leave Vendor Review
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}