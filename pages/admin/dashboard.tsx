import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  email: string | null;
  amountTotal: number | null;
  status: string | null;
  createdAt: string;
  refundId?: string | null;
};

const TOKEN_KEY = "oia_admin_token_v1";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function sinceDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(useToken: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders?token=${encodeURIComponent(useToken)}`);
      const json = await res.json();
      if (!res.ok) {
        setAuthed(false);
        setOrders([]);
        setError(json?.error || "Unauthorized");
        return;
      }
      setOrders(json.orders || []);
      setAuthed(true);
      localStorage.setItem(TOKEN_KEY, useToken);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      load(saved);
    }
  }, []);

  const stats = useMemo(() => {
    const todayCutoff = startOfToday();
    const d7 = sinceDays(7);
    const d30 = sinceDays(30);

    const paid = (o: Order) => (o.status || "").toLowerCase() === "paid";
    const refunded = (o: Order) => !!o.refundId || (o.status || "").toLowerCase() === "refunded";

    const sumRevenue = (list: Order[]) =>
      list.filter(paid).reduce((s, o) => s + (o.amountTotal || 0), 0);

    const today = orders.filter((o) => new Date(o.createdAt) >= todayCutoff);
    const last7 = orders.filter((o) => new Date(o.createdAt) >= d7);
    const last30 = orders.filter((o) => new Date(o.createdAt) >= d30);

    return {
      todayOrders: today.length,
      todayRevenue: sumRevenue(today),
      last7Orders: last7.length,
      last7Revenue: sumRevenue(last7),
      last30Orders: last30.length,
      last30Revenue: sumRevenue(last30),
      totalOrders: orders.length,
      totalPaidRevenue: sumRevenue(orders),
      totalRefunded: orders.filter(refunded).length,
    };
  }, [orders]);

  if (!authed) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Dashboard</h1>
        <p>Enter token to load stats.</p>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN TOKEN" style={{ padding: 10, marginRight: 8 }} />
        <button onClick={() => load(token)} disabled={!token || loading}>
          {loading ? "Loading..." : "Load"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p style={{ marginTop: 16 }}>
          Go to <a href="/admin/orders">/admin/orders</a>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Admin Dashboard</h1>
      <p>
        <a href="/admin/orders">Go to Orders</a>
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card title="Today Orders" value={`${stats.todayOrders}`} />
        <Card title="Today Revenue" value={dollars(stats.todayRevenue)} />
        <Card title="Last 7 Days Orders" value={`${stats.last7Orders}`} />
        <Card title="Last 7 Days Revenue" value={dollars(stats.last7Revenue)} />
        <Card title="Last 30 Days Orders" value={`${stats.last30Orders}`} />
        <Card title="Last 30 Days Revenue" value={dollars(stats.last30Revenue)} />
        <Card title="Total Orders" value={`${stats.totalOrders}`} />
        <Card title="Total Paid Revenue" value={dollars(stats.totalPaidRevenue)} />
        <Card title="Refunded Orders" value={`${stats.totalRefunded}`} />
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#666", fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
    </div>
  );
}
