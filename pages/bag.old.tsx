import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  occasion: string;
  qty: number;
};

const CART_KEY = "oia_cart_v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export default function BagPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  function updateQty(id: string, qty: number) {
    const next = items
      .map((i) => (i.id === id ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);
    setItems(next);
    writeCart(next);
  }

  function removeItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    writeCart(next);
  }

  function clearBag() {
    setItems([]);
    writeCart([]);
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 22 }}>OutfitInABag</Link>
        <nav style={{ display: "flex", gap: 14 }}>
          <Link href="/outfits">Outfits</Link>
          <Link href="/bag">Bag</Link>
        </nav>
      </header>

      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Your Bag</h1>
      <p style={{ color: "#555", marginTop: 0 }}>Outfit bundles you’ve added.</p>

      {items.length === 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 18 }}>
          <p style={{ marginTop: 0 }}>Your bag is empty.</p>
          <Link href="/outfits" style={{ fontWeight: 700 }}>Go shop outfits →</Link>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
            {items.map((i) => (
              <div key={i.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 14, border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
                <img
                  src={i.image}
                  alt={i.title}
                  style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10 }}
                />

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#555" }}>{i.occasion}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{i.title}</div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>${i.price}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                    <label style={{ fontSize: 13, color: "#555" }}>Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => updateQty(i.id, Number(e.target.value))}
                      style={{ width: 70, padding: "6px 8px", borderRadius: 10, border: "1px solid #ddd" }}
                    />
                    <button
                      onClick={() => removeItem(i.id)}
                      style={{ marginLeft: 6, border: "1px solid #ddd", background: "#fff", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div style={{ fontWeight: 900, alignSelf: "center" }}>
                  ${(i.price * i.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={clearBag}
              style={{ border: "1px solid #ddd", background: "#fff", borderRadius: 12, padding: "10px 14px", cursor: "pointer" }}
            >
              Clear Bag
            </button>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#555" }}>Subtotal</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>${subtotal.toFixed(2)}</div>

              <button
               onClick={async () => {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  const data = await res.json();

if (!res.ok) {
  alert(data?.error || "Checkout failed (no error message).");
  return;
}

if (data?.url) {
  window.location.href = data.url;
} else {
  alert("Checkout failed: No URL returned.");
}


  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert("Checkout failed");
  }
}}

                style={{ marginTop: 10, background: "#111", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" }}
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
