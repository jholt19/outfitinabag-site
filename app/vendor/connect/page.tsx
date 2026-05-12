import Link from "next/link";

export const dynamic = "force-dynamic";

export default function VendorConnectPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Stripe Connect
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Connect your payouts.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          Connect your Stripe account to receive automatic payouts from
          OutfitInABag sales.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/api/stripe/connect"
            className="inline-flex rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Connect Stripe Account
          </Link>

          <Link
            href="/vendor/dashboard"
            className="inline-flex rounded-full border border-black/15 bg-white px-6 py-4 text-sm font-semibold text-black transition hover:border-black"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-lg font-semibold text-black">
            Automatic payouts
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Receive earnings directly to your bank account through Stripe.
          </p>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-lg font-semibold text-black">
            Secure onboarding
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Stripe handles identity verification, banking, and compliance.
          </p>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="text-lg font-semibold text-black">
            Marketplace ready
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            OutfitInABag can automatically split payments between vendors and
            the platform.
          </p>
        </div>
      </section>
    </main>
  );
}