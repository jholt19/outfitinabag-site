"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "failed"
  >("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function run() {
      if (!sessionId) return;

      setStatus("saving");

      try {
        const r = await fetch("/api/save-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        });

        const data = await r.json().catch(() => ({}));

        if (!r.ok) {
          setStatus("failed");
          setMsg(data?.error || "Order save failed.");
          return;
        }

        setStatus("saved");
        setMsg("Your order has been confirmed.");
      } catch (e: any) {
        setStatus("failed");
        setMsg(e?.message || "Order save failed.");
      }
    }

    run();
  }, [sessionId]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8 lg:p-10">
        <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Order Confirmed
        </div>

        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
          Payment successful.
          <br />
          Your full fit is secured.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
          Thank you for shopping with OutfitInABag. Your curated outfit order
          has been received and is now being processed.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-black/10 bg-white p-6">
          {!sessionId ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Missing session_id. Please return to your bag and try checkout
              again.
            </div>
          ) : (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Checkout Session
              </div>

              <div className="mt-2 break-all rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm text-neutral-700">
                {sessionId}
              </div>

              <div className="mt-6">
                {status === "saving" && (
                  <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm font-medium text-black">
                    Saving your order...
                  </div>
                )}

                {status === "saved" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                    {msg}
                  </div>
                )}

                {status === "failed" && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {msg}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="rounded-[28px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Next Steps
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm text-neutral-700">
              You’ll receive order updates as your full outfit is prepared.
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm text-neutral-700">
              Vendors will begin fulfillment for your selected pieces.
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm text-neutral-700">
              Your order history will be available in My Orders.
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/outfits"
              className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Keep Shopping
            </Link>

            <Link
              href="/orders"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:border-black"
            >
              View My Orders
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 text-black">
          Loading...
        </main>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}