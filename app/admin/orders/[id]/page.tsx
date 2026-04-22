import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markVendorPaidForOrder } from "../actions/markVendorPaidForOrder";

export const dynamic = "force-dynamic";

function fmtCents(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: { vendor: true, bundle: true },
      },
    },
  });

  if (!order) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ margin: 0 }}>Order not found</h1>
        <div style={{ marginTop: 16 }}>
          <Link href="/admin/orders">← Back to Orders</Link>
        </div>
      </main>
    );
  }

  const byVendor = new Map<
    string,
    { vendorId: string; name: string; email: string; pending: number; paid: number; total: number; count: number }
  >();

  for (const it of order.items) {
    const v = it.vendor;
    const vendorId = it.vendorId;
    const payout = it.vendorPayoutCents ?? 0;

    if (!byVendor.has(vendorId)) {
      byVendor.set(vendorId, {
        vendorId,
        name: v?.name ?? "Unknown vendor",
        email: v?.email ?? "—",
        pending: 0,
        paid: 0,
        total: 0,
        count: 0,
      });
    }

    const row = byVendor.get(vendorId)!;
    row.total += payout;
    row.count += 1;
    if (it.payoutStatus === "PAID") row.paid += payout;
    else row.pending += payout;
  }

  const vendorRows = Array.from(byVendor.values()).sort((a, b) => b.total - a.total);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Order Details</h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            <span style={{ fontFamily: "monospace" }}>{order.id}</span>
          </p>
        </div>
        <Link href="/admin/orders" style={{ fontWeight: 900 }}>
          ← Back to Orders
        </Link>
      </div>

      <section style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>DATE</div>
            <div style={{ fontSize: 14, fontWeight: 950, marginTop: 6 }}>{new Date(order.createdAt).toLocaleString()}</div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>CUSTOMER</div>
            <div style={{ fontSize: 14, fontWeight: 950, marginTop: 6 }}>{order.email ?? "—"}</div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>TOTAL</div>
            <div style={{ fontSize: 14, fontWeight: 950, marginTop: 6 }}>
              {fmtCents(order.amountTotal)} {order.currency ? order.currency.toUpperCase() : ""}
            </div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>STATUS</div>
            <div style={{ fontSize: 14, fontWeight: 950, marginTop: 6 }}>{order.status ?? "—"}</div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          Stripe session: <span style={{ fontFamily: "monospace" }}>{order.stripeSessionId}</span>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 950, margin: 0 }}>Vendor Payouts (this order)</h2>

        <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Vendor</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Email</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Pending</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Paid</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Total</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorRows.map((v) => (
                <tr key={v.vendorId} style={{ borderTop: "1px solid #f1f1f1" }}>
                  <td style={{ padding: 12, fontWeight: 900 }}>{v.name}</td>
                  <td style={{ padding: 12 }}>{v.email}</td>
                  <td style={{ padding: 12 }}>{fmtCents(v.pending)}</td>
                  <td style={{ padding: 12 }}>{fmtCents(v.paid)}</td>
                  <td style={{ padding: 12, fontWeight: 900 }}>{fmtCents(v.total)}</td>
                  <td style={{ padding: 12 }}>
                    {v.pending > 0 ? (
                      <form action={markVendorPaidForOrder}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="vendorId" value={v.vendorId} />
                        <button
                          type="submit"
                          style={{ padding: "8px 10px", borderRadius: 10, border: "none", background: "#111", color: "white", fontWeight: 900, cursor: "pointer" }}
                        >
                          Mark Vendor Paid (this order)
                        </button>
                      </form>
                    ) : (
                      <span style={{ opacity: 0.6 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {vendorRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, opacity: 0.7 }}>No order items found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 950, margin: 0 }}>Items</h2>

        <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Bundle</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Vendor</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Qty</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Unit</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Vendor Payout</th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} style={{ borderTop: "1px solid #f1f1f1" }}>
                  <td style={{ padding: 12, fontWeight: 900 }}>{it.bundle?.title ?? it.title}</td>
                  <td style={{ padding: 12 }}>{it.vendor?.name ?? "—"}</td>
                  <td style={{ padding: 12 }}>{it.quantity}</td>
                  <td style={{ padding: 12 }}>{fmtCents(it.unitPrice)}</td>
                  <td style={{ padding: 12 }}>{fmtCents(it.vendorPayoutCents)}</td>
                  <td style={{ padding: 12 }}>
                    {it.payoutStatus === "PAID"
                      ? `PAID ✅${it.paidAt ? ` (${new Date(it.paidAt).toLocaleDateString()})` : ""}`
                      : "PENDING ⏳"}
                  </td>
                </tr>
              ))}

              {order.items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, opacity: 0.7 }}>No items on this order.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
