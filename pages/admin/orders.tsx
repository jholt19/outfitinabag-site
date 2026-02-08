import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number | null;
};

type Order = {
  id: string;
  stripeSessionId: string;
  stripePaymentId: string | null;
  email: string | null;
  amountTotal: number | null;
  currency: string | null;
  status: string | null;
  createdAt: string;
  items: OrderItem[];

  refundId?: string | null;
  refundStatus?: string | null;
  refundedAt?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundNote?: string | null;
};

const TOKEN_KEY = "oia_admin_token_v1";

function money(cents: number | null) {
  if (cents == null) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  // Refund UI state
  const [refundAmountById, setRefundAmountById] = useState<Record<string, string>>({});
  const [refundReasonById, setRefundReasonById] = useState<Record<string, string>>({});
  const [refundNoteById, setRefundNoteById] = useState<Record<string, string>>({});
  const [refundingId, setRefundingId] = useState<string | null>(null);

  async function loadOrders(useToken: string) {
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
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrders([]);
    setAuthed(false);
    setError("");
  }

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      loadOrders(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refundOrder(o: Order) {
    if (!o.stripePaymentId) {
      alert("No stripe payment id found for this order.");
      return;
    }

    const refunded = !!o.refundId || (o.status || "").toLowerCase() === "refunded";
    if (refunded) {
      alert("This order is already refunded.");
      return;
    }

    // Amount (optional)
    const input = (refundAmountById[o.id] || "").trim();
    let amount: number | undefined = undefined;

    if (input !== "") {
      const parsed = Number(input);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        alert("Invalid refund amount. Example: 5 or 5.00");
        return;
      }
      amount = Math.round(parsed * 100);

      if (o.amountTotal != null && amount > o.amountTotal) {
        alert("Refund amount cannot be more than the order total.");
        return;
      }
    }

    // Reason + note
    const reason = refundReasonById[o.id] || "customer_request";
    const note = (refundNoteById[o.id] || "").trim();

    if (reason === "other" && note.length < 3) {
      alert('Please type a short note when Reason = "Other".');
      return;
    }

    const ok = confirm(
      `Confirm refund?\n\nRefund: ${
        amount ? `$${(amount / 100).toFixed(2)}` : "FULL"
      }\nReason: ${reason}\n${reason === "other" ? `Note: ${note}\n` : ""}`
    );
    if (!ok) return;

    setRefundingId(o.id);

    try {
      const res = await fetch(`/api/admin/refund?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: o.id,
          paymentIntentId: o.stripePaymentId,
          amount, // optional
          reason,
          note: reason === "other" ? note : "",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Refund failed");

      alert("Refund successful ✅");

      // Clear inputs for this order
      setRefundAmountById((p) => ({ ...p, [o.id]: "" }));
      setRefundReasonById((p) => ({ ...p, [o.id]: "customer_request" }));
      setRefundNoteById((p) => ({ ...p, [o.id]: "" }));

      await loadOrders(token);
    } catch (e: any) {
      alert(e?.message || "Refund error");
    } finally {
      setRefundingId(null);
    }
  }

  // Login screen
  if (!authed) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Orders</h1>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="ADMIN TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ padding: 10, width: 280, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button onClick={() => loadOrders(token)} disabled={!token || loading}>
            {loading ? "Loading..." : "Load Orders"}
          </button>

          <a href="/admin/dashboard" style={{ marginLeft: 8 }}>
            Go to Dashboard →
          </a>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </main>
    );
  }

  // Orders view
  return (
    <main style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Admin Orders</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => loadOrders(token)} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <a href="/admin/dashboard">Dashboard</a>
          <button onClick={logout}>Log out</button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {orders.map((o) => {
          const refunded = !!o.refundId || (o.status || "").toLowerCase() === "refunded";

          return (
            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                marginTop: 14,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{o.email || "(no email)"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{new Date(o.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Status: <b>{refunded ? "REFUNDED" : (o.status || "unknown").toUpperCase()}</b>
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>Total: <b>{money(o.amountTotal)}</b></div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>
                    Session: {o.stripeSessionId}
                  </div>
                  {o.stripePaymentId && (
                    <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>
                      Payment: {o.stripePaymentId}
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Items</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {o.items?.map((it) => (
                    <li key={it.id}>
                      {it.title} — qty {it.quantity}
                      {it.unitPrice != null ? ` • $${(it.unitPrice / 100).toFixed(2)} ea` : ""}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Refund display */}
              {o.refundId && (
                <div style={{ marginTop: 10, color: "#b00020", fontWeight: 800 }}>
                  Refunded: {money(o.refundAmount ?? 0)}
                  {o.refundReason ? ` — Reason: ${o.refundReason}` : ""}
                  {o.refundNote ? ` — Note: ${o.refundNote}` : ""}
                </div>
              )}

              {/* Refund controls */}
              {!refunded && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    placeholder="Refund $ (blank = full)"
                    value={refundAmountById[o.id] || ""}
                    onChange={(e) => setRefundAmountById((p) => ({ ...p, [o.id]: e.target.value }))}
                    style={{ padding: 10, width: 180, borderRadius: 10, border: "1px solid #ccc" }}
                  />

                  <select
                    value={refundReasonById[o.id] || "customer_request"}
                    onChange={(e) => setRefundReasonById((p) => ({ ...p, [o.id]: e.target.value }))}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                  >
                    <option value="customer_request">Customer request</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="out_of_stock">Out of stock</option>
                    <option value="price_adjustment">Price adjustment</option>
                    <option value="fraud">Fraud</option>
                    <option value="other">Other</option>
                  </select>

                  {(refundReasonById[o.id] || "customer_request") === "other" && (
                    <input
                      placeholder='Refund note (required for "Other")'
                      value={refundNoteById[o.id] || ""}
                      onChange={(e) => setRefundNoteById((p) => ({ ...p, [o.id]: e.target.value }))}
                      style={{ padding: 10, width: 280, borderRadius: 10, border: "1px solid #ccc" }}
                    />
                  )}

                  <button
                    onClick={() => refundOrder(o)}
                    disabled={refundingId === o.id}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "#b00020",
                      color: "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {refundingId === o.id ? "Refunding..." : "Refund"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
