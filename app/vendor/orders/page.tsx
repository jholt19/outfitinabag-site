import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function VendorOrdersPage(props: any) {
  const sp = await Promise.resolve(props.searchParams);
  const vendorId = String(sp?.vendorId || "");

  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
  const vendorName = vendorId ? vendors.find((v) => v.id === vendorId)?.name : null;

  if (!vendorId) {
    return (
      <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Vendor • Orders</h1>
        <p style={{ marginTop: 8, color: "#666" }}>Select a vendor from dashboard first.</p>
        <Link href="/vendor/dashboard" style={{ fontWeight: 900 }}>← Back</Link>
      </main>
    );
  }

  // Pull vendor's order items (paid orders only)
  const items = await prisma.orderItem.findMany({
    where: {
      vendorId,
      order: { is: { status: "paid" } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      quantity: true,
      unitPrice: true,
      vendorPayoutCents: true,
      payoutStatus: true,
      paidAt: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          createdAt: true,
          email: true,
          amountTotal: true,
          status: true,
        },
      },
    },
  });

  // Group by order id for display
  const byOrder = new Map<string, typeof items>();
  for (const it of items) {
    const oid = it.order?.id ?? "unknown";
    const arr = byOrder.get(oid) ?? [];
    arr.push(it);
    byOrder.set(oid, arr);
  }

  const orders = Array.from(byOrder.entries())
    .map(([orderId, orderItems]) => {
      const order = orderItems[0]?.order;
      const payoutTotal = orderItems.reduce((s, x) => s + (x.vendorPayoutCents ?? 0), 0);
      const pending = orderItems.filter((x) => x.payoutStatus !== "PAID").reduce((s, x) => s + (x.vendorPayoutCents ?? 0), 0);
      const paid = orderItems.filter((x) => x.payoutStatus === "PAID").reduce((s, x) => s + (x.vendorPayoutCents ?? 0), 0);

      return {
        orderId,
        order,
        orderItems,
        payoutTotal,
        pending,
        paid,
      };
    })
    .sort((a, b) => {
      const ta = a.order?.createdAt ? new Date(a.order.createdAt).getTime() : 0;
      const tb = b.order?.createdAt ? new Date(b.order.createdAt).getTime() : 0;
      return tb - ta;
    });

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Vendor • Orders {vendorName ? `• ${vendorName}` : ""}</h1>
          <p style={{ marginTop: 8, color: "#666" }}>
            Orders containing your bundles (paid orders only). Payout status updates when Admin marks paid.
          </p>
        </div>

        <Link href={`/vendor/dashboard?vendorId=${encodeURIComponent(vendorId)}`} style={{ fontWeight: 900 }}>
          ← Back to Dashboard
        </Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ marginTop: 16, padding: 14, border: "1px solid #e5e7eb", borderRadius: 12, background: "white" }}>
          No orders yet for this vendor.
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.orderId} style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 950 }}>
                    Order: <span style={{ fontFamily: "monospace" }}>{o.orderId}</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                    {o.order?.createdAt ? new Date(o.order.createdAt).toLocaleString() : "—"} • {o.order?.email ?? "—"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>YOUR PAYOUT</div>
                  <div style={{ fontSize: 16, fontWeight: 950 }}>{fmtCents(o.payoutTotal)}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                    Pending: {fmtCents(o.pending)} • Paid: {fmtCents(o.paid)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10, borderTop: "1px solid #eee", paddingTop: 10, display: "grid", gap: 8 }}>
                {o.orderItems.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900 }}>{it.title}</div>
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                        Qty {it.quantity} • Unit {fmtCents(it.unitPrice ?? 0)} • Payout {fmtCents(it.vendorPayoutCents ?? 0)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 900 }}>
                        Status: {it.payoutStatus === "PAID" ? "PAID ✅" : "PENDING ⏳"}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {it.paidAt ? `Paid: ${new Date(it.paidAt).toLocaleDateString()}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
