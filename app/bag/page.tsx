import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Stripe from "stripe";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export default async function BagPage({
  searchParams,
}: {
  searchParams?: Promise<{ addBundleId?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const bundleId = params?.addBundleId;

  const bundle = bundleId
    ? await prisma.bundle.findUnique({
        where: { id: bundleId },
        include: { vendor: true },
      })
    : null;

  async function checkoutBundle() {
    "use server";

    if (!bundleId) {
      throw new Error("Missing bundle ID");
    }

    const checkoutBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { vendor: true },
    });

    if (!checkoutBundle) {
      throw new Error("Bundle not found");
    }

    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: checkoutBundle.price,
            product_data: {
              name: checkoutBundle.title,
              images:
                checkoutBundle.image && checkoutBundle.image.startsWith("http")
                  ? [checkoutBundle.image]
                  : [],
              metadata: {
                bundleId: checkoutBundle.id,
                vendorId: checkoutBundle.vendorId,
              },
            },
          },
        },
      ],
      metadata: {
        bundleId: checkoutBundle.id,
        vendorId: checkoutBundle.vendorId,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/bag?addBundleId=${checkoutBundle.id}`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    redirect(session.url);
  }

  if (!bundle) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
            Your bag is empty.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Browse curated outfits and add a full fit to your bag.
          </p>

          <Link
            href="/outfits"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Outfits
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Your Bag
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Review your outfit.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
          Your selected full-fit bundle is ready for checkout.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[28px] border border-black/10 bg-white p-5">
          {bundle.image ? (
            <img
              src={bundle.image}
              alt={bundle.title}
              className="h-[360px] w-full rounded-2xl bg-[#f7f5f2] object-contain p-4"
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-2xl bg-[#f7f5f2] text-neutral-400">
              No image
            </div>
          )}

          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {bundle.occasion}
            </div>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
              {bundle.title}
            </h2>

            <p className="mt-3 text-base leading-7 text-neutral-600">
              {bundle.description}
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              By {bundle.vendor?.name ?? "OutfitInABag"}
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Order Summary
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <strong className="text-black">
                ${(bundle.price / 100).toFixed(2)}
              </strong>
            </div>

            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-sm">
              <span className="text-neutral-600">Shipping</span>
              <strong className="text-black">Calculated at checkout</strong>
            </div>

            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-black">Total</span>
              <strong className="text-black">
                ${(bundle.price / 100).toFixed(2)}
              </strong>
            </div>
          </div>

          <form action={checkoutBundle}>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Checkout Securely
            </button>
          </form>

          <Link
            href="/outfits"
            className="mt-4 inline-flex w-full justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-black"
          >
            Continue Shopping
          </Link>
        </aside>
      </section>
    </main>
  );
}