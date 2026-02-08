import { useState } from "react";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number | null;
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
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>My Orders</h1>
      <p>Enter the email you used at checkout.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ padding: 10, width: 280 }}
        />
        <button onClick={search} disabled={!email || loading}>
          {loading ? "Searching..." : "Find Orders"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {orders.map((o) => (
          <div key={o.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 900 }}>
              {money(o.amountTotal)} — {(o.status || "unknown").toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>{new Date(o.createdAt).toLocaleString()}</div>

            <div style={{ marginTop: 10, fontWeight: 800 }}>Items</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.title} — qty {it.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!loading && orders.length === 0 && email && !error && (
          <p style={{ color: "#666" }}>No orders found for that email.</p>
        )}
      </div>
    </main>
  );
}
