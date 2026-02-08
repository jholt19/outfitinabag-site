"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addToBag } from "../../lib/cart";
import { OUTFITS, type Occasion } from "../../lib/outfits";

const OCCASIONS: (Occasion | "ALL")[] = ["ALL", "VACATION", "FORMAL", "CASUAL", "WEDDING"];

export default function OutfitsPage() {
  const [category, setCategory] = useState<Occasion | "ALL">("ALL");

  const filtered = useMemo(() => {
    return category === "ALL" ? OUTFITS : OUTFITS.filter((o) => o.occasion === category);
  }, [category]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Outfits</h1>
          <p style={{ marginTop: 6, color: "#666" }}>Pick an occasion. Add a complete bundle to your bag.</p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {OCCASIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: category === c ? "#111" : "white",
                color: category === c ? "white" : "#111",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((o) => (
          <div key={o.id} style={{ border: "1px solid #eee", background: "white", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", height: 180, background: "#f3f3f3" }}>
              <Image src={o.image} alt={o.title} fill style={{ objectFit: "cover" }} />
            </div>

            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#555" }}>{o.occasion}</div>
              <div style={{ fontSize: 16, fontWeight: 950, marginTop: 6 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 6, minHeight: 40 }}>{o.description}</div>
              <div style={{ marginTop: 10, fontWeight: 950 }}>${(o.price / 100).toFixed(2)}</div>

              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => {
                    addToBag(o);
                    alert("Added to bag!");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111",
                    color: "white",
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Add to Bag
                </button>

                <Link
                  href={`/outfits/${o.id}`}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "white",
                    color: "#111",
                    fontWeight: 950,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  View Outfit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
