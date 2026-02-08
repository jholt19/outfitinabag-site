"use client";

import { useState } from "react";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number | null;
  image?: string | null;
};

type Order = {
  id: string;
  createdAt: string;
  status: string | null;
  amountTotal: number | null;
  items: OrderItem[];
};

function money(cents: number | null) {
  if (cents == null) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setLoading(true);
    setError("");
    setOrders([]);
    try {
      const res = await fetch(`/api/public/my-orders?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setOrders(json.orders || []);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: 0 }}>My Orders</h1>
      <p style={{ marginTop: 6, color: "#666" }}>Enter the email you used at checkout.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ padding: 10, width: 320, borderRadius: 12, border: "1px solid #ddd" }}
        />
        <button
          onClick={search}
          disabled={!email || loading}
          style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "white", fontWeight: 950, cursor: "pointer" }}
        >
          {loading ? "Searching..." : "Find Orders"}
        </button>
      </div>

      {error && <p style={{ color: "#b00020", fontWeight: 900 }}>{error}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {orders.map((o) => (
          <div key={o.id} style={{ border: "1px solid #eee", background: "white", borderRadius: 16, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 950 }}>{money(o.amountTotal)} — {(o.status || "unknown").toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{new Date(o.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ marginTop: 10, fontWeight: 900 }}>Items</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.title} — qty {it.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!loading && email && !error && orders.length === 0 && (
          <div style={{ border: "1px solid #eee", background: "white", borderRadius: 16, padding: 14, color: "#666" }}>
            No orders found for that email.
          </div>
        )}
      </div>
    </div>
  );
}
