import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function orderItemsTotalCents(items: { unitPrice: number | null; quantity: number }[]) {
  return items.reduce((sum, it) => sum + (it.unitPrice ?? 0) * (it.quantity ?? 0), 0);
}

type OrderRow = {
  id: string;
  createdAt: Date;
  status: string | null;
  amountTotal: number | null;
  gmvCents: number | null;
  email: string | null;
  items: { unitPrice: number | null; quantity: number }[];
};

function compute(rows: OrderRow[], TAKE_RATE: number) {
  let gmv = 0;
  let platform = 0;
  let net = 0;
  let bundlesSold = 0;

  const buyerCounts = new Map<string, number>();

  for (const o of rows) {
    const gmvCents =
      o.amountTotal ??
      o.gmvCents ??
      orderItemsTotalCents(o.items ?? []);

    gmv += gmvCents;

    const platformCents = Math.round(gmvCents * TAKE_RATE);
    platform += platformCents;
    net += platformCents;

    for (const it of o.items ?? []) {
      bundlesSold += it.quantity ?? 0;
    }

    const email = (o.email ?? "").trim().toLowerCase();
    if (email) buyerCounts.set(email, (buyerCounts.get(email) ?? 0) + 1);
  }

  const ordersCount = rows.length;
  const aov = ordersCount > 0 ? Math.round(gmv / ordersCount) : 0;
  const buyers = buyerCounts.size;
  const repeatBuyers = Array.from(buyerCounts.values()).filter((c) => c >= 2).length;

  const takeRate = gmv > 0 ? Math.round((platform / gmv) * 1000) / 10 : 0;

  return { gmv, platform, net, ordersCount, aov, bundlesSold, buyers, repeatBuyers, takeRate };
}

export default async function AdminMetricsPage() {
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  // ✅ Investor mode take rate (force consistent economics)
  const TAKE_RATE = 0.2; // 20%

  // ✅ Only paid orders count
  const wherePaid = { status: "paid" as const };

  const select = {
    id: true,
    createdAt: true,
    status: true,
    amountTotal: true,
    gmvCents: true,
    email: true,
    items: { select: { unitPrice: true, quantity: true } },
  } as const;

  const [ordersAll, orders7, orders30] = await Promise.all([
    prisma.order.findMany({ where: wherePaid, select, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ where: { ...wherePaid, createdAt: { gte: since7 } }, select, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ where: { ...wherePaid, createdAt: { gte: since30 } }, select, orderBy: { createdAt: "desc" } }),
  ]);

  const all = compute(ordersAll as any, TAKE_RATE);
  const d7 = compute(orders7 as any, TAKE_RATE);
  const d30 = compute(orders30 as any, TAKE_RATE);

  // ✅ Vendor owed/paid (paid orders only)
  const payoutItems = await prisma.orderItem.findMany({
    where: { order: { is: { status: "paid" } } },
    select: { vendorPayoutCents: true, payoutStatus: true },
  });

  let owed = 0;
  let paid = 0;
  for (const it of payoutItems) {
    const amt = it.vendorPayoutCents ?? 0;
    if (it.payoutStatus === "PAID") paid += amt;
    else owed += amt;
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin • Metrics</h1>
          <p style={{ marginTop: 8, color: "#666" }}>
            Investor view: GMV, take rate, and payouts. (Paid orders only • Take rate forced to 20%)
          </p>
          <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
            Orders counted: <b>{all.ordersCount}</b>
          </div>
        </div>

        <Link href="/admin/dashboard" style={{ fontWeight: 900 }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Top row */}
      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>ALL-TIME GMV</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(all.gmv)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Take rate: {all.takeRate}%</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>PLATFORM REV (ALL)</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(all.platform)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Net: {fmtCents(all.net)}</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>VENDOR OWED</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(owed)}</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>VENDOR PAID</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(paid)}</div>
        </div>
      </section>

      {/* New investor row */}
      <section style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>AOV</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(all.aov)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>GMV / paid orders</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>BUNDLES SOLD</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{all.bundlesSold}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Sum of quantities</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>BUYERS</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{all.buyers}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Unique emails</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>REPEAT BUYERS</div>
          <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{all.repeatBuyers}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>2+ paid orders</div>
        </div>
      </section>

      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>LAST 7 DAYS</div>
          <div style={{ marginTop: 6, fontWeight: 950 }}>GMV: {fmtCents(d7.gmv)}</div>
          <div style={{ marginTop: 4, opacity: 0.8 }}>Platform: {fmtCents(d7.platform)}</div>
          <div style={{ marginTop: 4, opacity: 0.8 }}>Net: {fmtCents(d7.net)}</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>LAST 30 DAYS</div>
          <div style={{ marginTop: 6, fontWeight: 950 }}>GMV: {fmtCents(d30.gmv)}</div>
          <div style={{ marginTop: 4, opacity: 0.8 }}>Platform: {fmtCents(d30.platform)}</div>
          <div style={{ marginTop: 4, opacity: 0.8 }}>Net: {fmtCents(d30.net)}</div>
        </div>
      </section>
    </main>
  );
}
