"use client";

import { useEffect, useMemo, useState } from "react";
import { OUTFITS } from "@/lib/outfits";
import Image from "next/image";
import Link from "next/link";

type BagItem = {
  id: string;
  title: string;
  image: string;
  occasion: string;
  price: number;
};

export default function BagPage() {
  const [items, setItems] = useState<BagItem[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bundleId = params.get("addBundleId");

    if (bundleId) {
      const found = OUTFITS.find((o) => String(o.id) === String(bundleId));

      if (found) {
        setItems([found]);
        setJustAdded(true);
      }
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price, 0),
    [items]
  );

  async function handleCheckout() {
    if (items.length === 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            qty: 1,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, color: "#111", margin: 0 }}>
        Your Bag
      </h1>

      <p style={{ marginTop: 8, color: "#444", fontSize: 16 }}>
        Review your outfit and checkout.
      </p>

      {justAdded && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#d1fae5",
            border: "1px solid #10b981",
            borderRadius: 12,
            fontWeight: 900,
            color: "#065f46",
          }}
        >
          ✅ Full outfit added to your bag
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: "#444", fontSize: 16 }}>Your bag is empty.</p>
          <Link href="/outfits" style={{ fontWeight: 900, color: "#111" }}>
            Browse outfits →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 16,
                  border: "1px solid #e5e5e5",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 14,
                  background: "white",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 110,
                    height: 110,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: "cover", borderRadius: 12 }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 18,
                      color: "#111",
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#666",
                      marginTop: 4,
                    }}
                  >
                    Full Outfit • {item.occasion}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 900,
                      fontSize: 16,
                      color: "#111",
                    }}
                  >
                    ${(item.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid #eee",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#111",
              }}
            >
              Subtotal: ${(subtotal / 100).toFixed(2)}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "15px",
                background: "#111",
                color: "white",
                fontWeight: 900,
                borderRadius: 14,
                border: "none",
                fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Starting Checkout..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}