import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (!cents) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      email: true,
      amountTotal: true,
      status: true,
      stripeSessionId: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Orders</h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            Latest orders (click an order to view details + payouts).
          </p>
        </div>
        <div style={{ opacity: 0.7, fontWeight: 900 }}>{orders.length} shown</div>
      </div>

      {orders.length === 0 ? (
        <div style={{ marginTop: 20, border: "1px solid #eee", borderRadius: 16, padding: 20, background: "white" }}>
          <p style={{ margin: 0, fontWeight: 900 }}>No orders yet.</p>
          <p style={{ color: "#666", marginTop: 8 }}>
            Orders will appear here once customers complete checkout.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Date</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Email</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Total</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Status</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Items</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Stripe Session</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid #f1f1f1" }}>
                  <td style={{ padding: 12 }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 900, textDecoration: "none", color: "#111" }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </Link>
                  </td>
                  <td style={{ padding: 12 }}>{o.email ?? "—"}</td>
                  <td style={{ padding: 12 }}>{fmtCents(o.amountTotal)}</td>
                  <td style={{ padding: 12 }}>{o.status ?? "—"}</td>
                  <td style={{ padding: 12 }}>{o._count.items}</td>
                  <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12, opacity: 0.85 }}>
                    {o.stripeSessionId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </div>
    </main>
  );
}
