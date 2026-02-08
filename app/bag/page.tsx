"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CART_KEY, cartTotals, clearCart, readCart, removeItem, setQty, type CartItem } from "../../lib/cart";

export default function BagPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = () => setItems(readCart());
    load();

    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);

  async function checkout() {
    if (!items.length) return alert("Your bag is empty.");

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((x) => ({
            title: x.title,
            price: x.price,
            quantity: x.qty,
            image: x.image,
            outfitId: x.id,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Checkout failed");

      // Stripe returns a hosted checkout url
      window.location.href = json.url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: 0 }}>Bag</h1>
      <p style={{ marginTop: 6, color: "#666" }}>Review your outfits and checkout.</p>

      {!items.length ? (
        <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 16, background: "white", padding: 16 }}>
          Your bag is empty.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 14 }}>
          {items.map((x) => (
            <div key={x.id} style={{ display: "flex", gap: 12, border: "1px solid #eee", borderRadius: 16, background: "white", padding: 12 }}>
              <div style={{ position: "relative", width: 120, height: 90, borderRadius: 12, overflow: "hidden", background: "#f3f3f3" }}>
                <Image src={x.image} alt={x.title} fill style={{ objectFit: "cover" }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#555" }}>{x.occasion}</div>
                <div style={{ fontWeight: 950 }}>{x.title}</div>
                <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>${(x.price / 100).toFixed(2)} each</div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
                  <label style={{ fontSize: 13, color: "#555", fontWeight: 900 }}>Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={x.qty}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value || 1));
                      setQty(x.id, q);
                      setItems(readCart());
                    }}
                    style={{ width: 70, padding: 8, borderRadius: 10, border: "1px solid #ddd" }}
                  />

                  <button
                    onClick={() => {
                      removeItem(x.id);
                      setItems(readCart());
                    }}
                    style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 900, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ fontWeight: 950, alignSelf: "center" }}>
                ${(x.price * x.qty / 100).toFixed(2)}
              </div>
            </div>
          ))}

          <div style={{ border: "1px solid #eee", borderRadius: 16, background: "white", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950 }}>
              <span>Subtotal</span>
              <span>${(totals.subtotal / 100).toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", fontWeight: 950, cursor: "pointer" }}
              >
                Clear Bag
              </button>

              <button
                onClick={checkout}
                disabled={loading}
                style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "white", fontWeight: 950, cursor: "pointer" }}
              >
                {loading ? "Starting Checkout..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
