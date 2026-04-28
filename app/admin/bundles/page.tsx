"use client";

import { useEffect, useState } from "react";

type Bundle = {
  id: string;
  title: string;
  occasion: string;
  price: number;
  retailValue: number | null;
  image: string | null;
  tier: string | null;
  published: boolean;
  isFeatured: boolean;
  submittedForReview: boolean;
  vendor?: {
    name: string;
  } | null;
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin-bundles");
      const data = await res.json();
      setBundles(data || []);
    }

    load();
  }, []);

  async function handleCloudinaryUpload(bundleId: string) {
    const imageUrl = prompt("Paste image URL to upload to Cloudinary");

    if (!imageUrl) return;

    const uploadRes = await fetch("/api/upload-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      alert(uploadData?.error || "Upload failed");
      return;
    }

    const saveRes = await fetch("/api/update-bundle-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bundleId,
        image: uploadData.secure_url,
      }),
    });

    if (!saveRes.ok) {
      alert("Cloudinary upload worked, but saving failed.");
      return;
    }

    alert("Image uploaded and saved successfully!");

    window.location.reload();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-[#f7f5f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Admin
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-black">
              Bundle Review
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Review vendor bundles, upload premium images, and manage
              publishing.
            </p>
          </div>

          <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
            {bundles.length} Total Bundles
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        {bundles.map((b) => (
          <div
            key={b.id}
            className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {b.occasion}
                </div>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">
                  {b.title}
                </h2>

                <p className="mt-2 text-sm text-neutral-600">
                  Vendor: {b.vendor?.name ?? "—"}
                </p>

                <p className="mt-1 text-sm text-neutral-600">
                  Price: ${(b.price / 100).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => handleCloudinaryUpload(b.id)}
                className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Upload to Cloudinary
              </button>
            </div>

            {b.image && (
              <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f5f2] p-4 text-sm break-all">
                Current Image:
                <br />
                {b.image}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}