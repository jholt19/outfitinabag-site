import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markVendorPaid } from "./actions/markPaid";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminPayoutsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  // Pull all payout items for paid orders
  const items = await prisma.orderItem.findMany({
    where: {
      order: { is: { status: "paid" } },
    },
    select: {
      vendorId: true,
      vendorPayoutCents: true,
      payoutStatus: true,
    },
  });

  const pendingByVendor = new Map<string, { cents: number; count: number }>();
  const paidByVendor = new Map<string, { cents: number; count: number }>();

  for (const it of items) {
    const amt = it.vendorPayoutCents ?? 0;
    const map = it.payoutStatus === "PAID" ? paidByVendor : pendingByVendor;
    const cur = map.get(it.vendorId) ?? { cents: 0, count: 0 };
    cur.cents += amt;
    cur.count += 1;
    map.set(it.vendorId, cur);
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin • Payouts</h1>
          <p style={{ marginTop: 8, color: "#666" }}>
            Manual payout dashboard for now. Click <b>Mark Paid</b> after you pay a vendor (Zelle, ACH, etc).
          </p>
        </div>
        <Link href="/admin/dashboard" style={{ fontWeight: 900 }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Vendor</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Email</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Pending</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Paid</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Items</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((v) => {
              const pending = pendingByVendor.get(v.id) ?? { cents: 0, count: 0 };
              const paid = paidByVendor.get(v.id) ?? { cents: 0, count: 0 };
              const hasPending = pending.cents > 0;

              return (
                <tr key={v.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>{v.name}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>{v.email}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>{fmtCents(pending.cents)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>{fmtCents(paid.cents)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {pending.count + paid.count}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <form action={markVendorPaid}>
                      <input type="hidden" name="vendorId" value={v.id} />
                      <button
                        type="submit"
                        disabled={!hasPending}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "none",
                          background: hasPending ? "#111" : "#999",
                          color: "white",
                          fontWeight: 900,
                          cursor: hasPending ? "pointer" : "not-allowed",
                          opacity: hasPending ? 1 : 0.6,
                        }}
                      >
                        Mark Paid
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}

            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.7 }}>
                  No vendors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
