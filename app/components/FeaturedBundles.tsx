"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Bundle = {
  id: string;
  title: string;
  occasion: string;
  price: number;
  retailValue: number | null;
  image: string | null;
  tier: string | null;
};

function pctSaved(priceCents: number, retailValue: number) {
  const price = priceCents / 100;
  if (!retailValue || retailValue <= 0) return null;
  const saved = 1 - price / retailValue;
  if (!Number.isFinite(saved) || saved <= 0) return null;
  return Math.round(saved * 100);
}

function occasionHref(occasion: string) {
  return `/outfits?occasion=${encodeURIComponent(occasion)}`;
}

export default function FeaturedBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/featured-bundles", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setBundles(Array.isArray(json?.bundles) ? json.bundles : []);
      } catch {
        if (!alive) return;
        setBundles([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const content = useMemo(() => bundles, [bundles]);

  if (loading) {
    return (
      <section style={{ padding: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Featured Bundles</h2>
        <div style={{ marginTop: 12, opacity: 0.7 }}>Loading…</div>
      </section>
    );
  }

  if (content.length === 0) return null;

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Featured Bundles</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 16,
        }}
      >
        {content.map((b) => {
          const savedPct = b.retailValue ? pctSaved(b.price, b.retailValue) : null;
          const isMostPopular = b.tier === "PLUS";

          return (
            <Link
              key={b.id}
              href={occasionHref(String(b.occasion))}
              style={{
                display: "block",
                cursor: "pointer",
                border: isMostPopular ? "2px solid #111" : "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: "white",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ position: "relative" }}>
                {b.image ? (
                  <img
                    src={b.image}
                    alt={b.title}
                    style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 180, background: "#f3f4f6", borderRadius: 8 }} />
                )}

                {isMostPopular ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: "#111",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    Most Popular
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: 10, fontWeight: 900 }}>{b.title}</div>
              <div style={{ marginTop: 2, opacity: 0.75, fontSize: 13 }}>{b.occasion}</div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 900 }}>${(b.price / 100).toFixed(2)}</div>
                {savedPct ? (
                  <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Save {savedPct}%</div>
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Bundle deal</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
