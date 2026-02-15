// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { OUTFITS } from "../lib/outfits";

type Tile = {
  label: string;
  occasion: "VACATION" | "FORMAL" | "CASUAL" | "WEDDING" | "ALL";
  image: string;
  subtitle: string;
};

const tiles: Tile[] = [
  {
    label: "Vacation",
    occasion: "VACATION",
    image: "/outfits/vac-1.jpg",
    subtitle: "Resort-ready sets",
  },
  {
    label: "Formal",
    occasion: "FORMAL", // ✅ THIS is the correct one (not FORM / FOR)
    image: "/outfits/for-1.jpg",
    subtitle: "Date nights & events",
  },
  {
    label: "Casual",
    occasion: "CASUAL",
    image: "/outfits/cas-2.jpg",
    subtitle: "Everyday clean fits",
  },
  {
    label: "Wedding",
    occasion: "WEDDING",
    image: "/outfits/wed-1.jpg",
    subtitle: "Guest-ready looks",
  },
];

export default function HomePage() {
  const featured = useMemo(() => {
    // show 6 outfits max on home
    return OUTFITS.slice(0, 6);
  }, []);

  return (
    <main style={{ padding: 0 }}>
      {/* HERO */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 18,
          alignItems: "center",
          padding: 18,
          background: "linear-gradient(180deg,#fff,#f7f7f7)",
          borderRadius: 18,
          border: "1px solid #eee",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              background: "#111",
              color: "white",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Big Bundles • Save Time
          </div>

          <h1 style={{ margin: "12px 0 6px", fontSize: 42, lineHeight: 1.05 }}>
            Complete outfits for every occasion.
          </h1>

          <p style={{ margin: 0, color: "#555", fontSize: 16, maxWidth: 520 }}>
            Pick a vibe, add it to your bag, and check out fast. We bundle the whole look — top, bottom, and style.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <Link href="/outfits" style={primaryBtn}>
              Shop Outfits
            </Link>
            <Link href="/bag" style={secondaryBtn}>
              View Bag
            </Link>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid #eee",
            background: "#fff",
            minHeight: 240,
          }}
        >
          <Image
            src="/outfits/vac-2.jpg"
            alt="Featured outfit"
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              background: "rgba(255,255,255,0.92)",
              borderRadius: 14,
              padding: 10,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>
              Sample bundle preview
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              Real outfit images from your library
            </div>
          </div>
        </div>
      </section>

      {/* TILES */}
      <section style={{ marginTop: 18 }}>
        <h2 style={{ margin: "12px 0", fontSize: 18 }}>Shop by occasion</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {tiles.map((t) => (
            <Link
              key={t.occasion}
              href={t.occasion === "ALL" ? "/outfits" : `/outfits?occasion=${t.occasion}`}
              style={{
                textDecoration: "none",
                color: "#111",
                border: "1px solid #eee",
                borderRadius: 16,
                overflow: "hidden",
                background: "white",
              }}
            >
              <div style={{ position: "relative", height: 140 }}>
                <Image
                  src={t.image}
                  alt={t.label}
                  fill
                  sizes="(max-width: 900px) 100vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 950, fontSize: 14 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{t.subtitle}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <Link href="/outfits" style={{ fontWeight: 900, textDecoration: "none" }}>
            View all outfits →
          </Link>
        </div>
      </section>

      {/* FEATURED OUTFITS */}
      <section style={{ marginTop: 22 }}>
        <h2 style={{ margin: "12px 0", fontSize: 18 }}>Featured bundles</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {featured.map((o) => (
            <Link
              key={o.id}
              href={`/outfits/${o.id}`}
              style={{
                textDecoration: "none",
                color: "#111",
                border: "1px solid #eee",
                borderRadius: 16,
                overflow: "hidden",
                background: "white",
              }}
            >
              <div style={{ position: "relative", height: 190 }}>
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#666" }}>{o.occasion}</div>
                <div style={{ fontWeight: 950, marginTop: 4 }}>{o.title}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{o.description}</div>
                <div style={{ marginTop: 10, fontWeight: 950 }}>${(o.price / 100).toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* small responsive help */}
      <style jsx>{`
        @media (max-width: 900px) {
          section:first-child {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          section > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 14px",
  borderRadius: 14,
  background: "#111",
  color: "white",
  fontWeight: 950,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 14px",
  borderRadius: 14,
  background: "white",
  color: "#111",
  fontWeight: 950,
  textDecoration: "none",
  border: "1px solid #ddd",
};

