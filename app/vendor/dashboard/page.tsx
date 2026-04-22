import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VendorPicker from "./VendorPicker";
import { submitBundleForReview } from "../bundles/actions/submitForReview";

export const dynamic = "force-dynamic";

function fmtCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function VendorDashboardPage(props: any) {
  const sp = await Promise.resolve(props.searchParams);
  const vendorId = (sp?.vendorId as string) ?? "";

  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

  const bundles = vendorId
    ? await prisma.bundle.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // ✅ Earnings (multi-vendor correct): read payoutStatus FROM OrderItem
  let earnings = { total: 0, pending: 0, paid: 0, count: 0 };
  if (vendorId) {
    const items = await prisma.orderItem.findMany({
      where: { vendorId },
      select: {
        vendorPayoutCents: true,
        payoutStatus: true,
      },
    });

    let total = 0;
    let pending = 0;
    let paid = 0;

    for (const i of items) {
      const amt = i.vendorPayoutCents ?? 0;
      total += amt;
      if (i.payoutStatus === "PAID") paid += amt;
      else pending += amt;
    }

    earnings = { total, pending, paid, count: items.length };
  }

  const vendorName = vendorId ? vendors.find((v) => v.id === vendorId)?.name : null;

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
          Vendor Dashboard {vendorName ? `• ${vendorName}` : ""}
        </h1>

        <Link
          href={vendorId ? `/vendor/bundles/new?vendorId=${encodeURIComponent(vendorId)}` : "/vendor/bundles/new"}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "#111",
            fontWeight: 900,
            background: "white",
            whiteSpace: "nowrap",
          }}
        >
          + New Bundle
        </Link>
<Link
  href={vendorId ? `/vendor/orders?vendorId=${encodeURIComponent(vendorId)}` : "/vendor/orders"}
  style={{
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    textDecoration: "none",
    color: "#111",
    fontWeight: 900,
    background: "white",
    whiteSpace: "nowrap",
  }}
>
  View Orders
</Link>
      </div>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Create bundles here. When ready, submit for review so Admin can publish it.
      </p>

      <VendorPicker vendors={vendors} vendorId={vendorId} />

      {/* Earnings card */}
      {vendorId ? (
        <section
          style={{
            marginTop: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "white",
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Earnings</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>TOTAL</div>
              <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(earnings.total)}</div>
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>PENDING</div>
              <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(earnings.pending)}</div>
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>PAID</div>
              <div style={{ fontSize: 18, fontWeight: 950, marginTop: 6 }}>{fmtCents(earnings.paid)}</div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Based on {earnings.count} order items. (We’ll add payout export + Stripe Connect next.)
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>My Bundles</h2>
          {vendorId ? <div style={{ opacity: 0.7 }}>{bundles.length} total</div> : null}
        </div>

        {!vendorId ? (
          <div style={{ marginTop: 12, padding: 14, border: "1px solid #e5e7eb", borderRadius: 12, background: "white" }}>
            Select a vendor to view bundles.
          </div>
        ) : bundles.length === 0 ? (
          <div style={{ marginTop: 12, padding: 14, border: "1px solid #e5e7eb", borderRadius: 12, background: "white" }}>
            No bundles yet for this vendor.
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {bundles.map((b) => {
              const status = b.published
                ? "Published ✅"
                : b.submittedForReview
                ? "Submitted (awaiting approval) ⏳"
                : "Draft";

              return (
                <div
                  key={b.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "white",
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900 }}>{b.title}</div>
                    <div style={{ opacity: 0.75, marginTop: 2, fontSize: 13 }}>
                      {b.occasion} • ${((b.price ?? 0) / 100).toFixed(2)}
                      {b.retailValue ? ` • Retail $${b.retailValue}` : ""}
                      {b.tier ? ` • ${b.tier}` : ""}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                      Status: <b>{status}</b>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Link
                      href={`/vendor/bundles/new?vendorId=${encodeURIComponent(vendorId)}`}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        textDecoration: "none",
                        color: "#111",
                        fontWeight: 900,
                        background: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Create Another
                    </Link>

                    {!b.published && !b.submittedForReview ? (
                      <form action={submitBundleForReview}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <input type="hidden" name="vendorId" value={vendorId} />
                        <button
                          type="submit"
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "none",
                            background: "#111",
                            color: "white",
                            fontWeight: 900,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Submit for review
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
