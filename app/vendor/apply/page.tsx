"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function VendorApplyForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setResult(null);

    const r = await fetch("/api/vendor/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        website,
        instagram,
        referralCode,
      }),
    });

    const data = await r.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <section className="rounded-[32px] border border-black/10 bg-white p-8">
      <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        Vendor Application
      </div>

      <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
        Become a Vendor
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
        Apply to sell complete outfit bundles on OutfitInABag and reach
        customers looking for curated premium looks.
      </p>

      {referralCode ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Referral Applied
          </div>

          <div className="mt-2 text-sm font-semibold text-emerald-900">
            Referral Code: {referralCode}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand Name"
          className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
        />

        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website"
          className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
        />

        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram"
          className="rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {loading ? "Submitting..." : "Apply"}
        </button>
      </div>

      {result && (
        <div className="mt-8 rounded-2xl bg-black p-5 text-white">
          <pre className="overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

export default function VendorApplyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Suspense
        fallback={
          <section className="rounded-[32px] border border-black/10 bg-white p-8">
            Loading application...
          </section>
        }
      >
        <VendorApplyForm />
      </Suspense>
    </main>
  );
}