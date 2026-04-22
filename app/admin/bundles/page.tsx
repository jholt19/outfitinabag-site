import { prisma } from "@/lib/prisma";
import { toggleBundleFeatured, toggleBundlePublished } from "./actions/toggle";
import { updateBundleTitle } from "./actions/updateTitle";
import { updateBundleImage } from "./actions/updateImage";
import { updateBundleRetailValue } from "./actions/updateRetailValue";
import { updateBundleTier } from "./actions/updateTier";
import { approveBundle } from "./actions/approve";

export const dynamic = "force-dynamic";

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundle.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: true },
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Admin • Bundles</h1>
        <a href="/admin/bundles/new" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 900, textDecoration: "none", color: "#111" }}>+ New Bundle</a>
        <span style={{ opacity: 0.7 }}>{bundles.length} total</span>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1500 }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Title</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Occasion</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Tier</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Price</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Retail</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Submitted</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Published</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Featured</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Vendor</th>
              <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bundles.map((b) => (
              <tr key={b.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12, fontWeight: 800 }}>{b.title}</td>
                <td style={{ padding: 12 }}>{b.occasion}</td>

                <td style={{ padding: 12 }}>
                  <form action={updateBundleTier} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="hidden" name="bundleId" value={b.id} />
                    <select
                      name="tier"
                      defaultValue={b.tier ?? ""}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "white",
                      }}
                    >
                      <option value="">—</option>
                      <option value="BASIC">BASIC</option>
                      <option value="PLUS">PLUS</option>
                      <option value="ELITE">ELITE</option>
                    </select>
                    <button
                      type="submit"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "white",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </form>
                </td>

                <td style={{ padding: 12 }}>${(b.price / 100).toFixed(2)}</td>
                <td style={{ padding: 12 }}>{b.retailValue ? `$${b.retailValue}` : "—"}</td>
                <td style={{ padding: 12 }}>{b.submittedForReview ? "⏳" : "—" }</td>
                <td style={{ padding: 12 }}>{b.published ? "✅" : "—"}</td>
                <td style={{ padding: 12 }}>{b.isFeatured ? "⭐" : "—"}</td>
                <td style={{ padding: 12 }}>{b.vendor?.name ?? "—"}</td>

                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {b.submittedForReview && !b.published ? (
                        <form action={approveBundle}>
                          <input type="hidden" name="bundleId" value={b.id} />
                          <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: "#111", color: "white", fontWeight: 900, cursor: "pointer" }}>
                            Approve
                          </button>
                        </form>
                      ) : null}

                      {b.submittedForReview && !b.published ? (
                        <form action={approveBundle}>
                          <input type="hidden" name="bundleId" value={b.id} />
                          <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: "#111", color: "white", fontWeight: 900, cursor: "pointer" }}>
                            Approve
                          </button>
                        </form>
                      ) : null}

                      <form action={toggleBundlePublished}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 800, cursor: "pointer" }}>
                          {b.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>

                      <form action={toggleBundleFeatured}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 800, cursor: "pointer" }}>
                          {b.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <form action={updateBundleTitle} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <input name="title" defaultValue={b.title} style={{ width: 220, padding: "6px 8px", borderRadius: 10, border: "1px solid #ddd" }} />
                        <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 800, cursor: "pointer" }}>
                          Save Title
                        </button>
                      </form>

                      <form action={updateBundleImage} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <input name="image" defaultValue={b.image ?? ""} placeholder="Image path or URL" style={{ width: 280, padding: "6px 8px", borderRadius: 10, border: "1px solid #ddd" }} />
                        <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 800, cursor: "pointer" }}>
                          Save Image
                        </button>
                      </form>

                      <form action={updateBundleRetailValue} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="hidden" name="bundleId" value={b.id} />
                        <input name="retailValue" defaultValue={b.retailValue ?? ""} placeholder="Retail $ (e.g. 249)" style={{ width: 160, padding: "6px 8px", borderRadius: 10, border: "1px solid #ddd" }} />
                        <button type="submit" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", fontWeight: 800, cursor: "pointer" }}>
                          Save Retail
                        </button>
                      </form>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {b.image ? "Image set ✅" : "No image set"} • {b.retailValue ? "Retail set ✅" : "No retail value"} • {b.tier ? `Tier: ${b.tier}` : "No tier"}
                    </div>
                  </div>
                </td>
              </tr>
            ))}

            {bundles.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 16, opacity: 0.7 }}>
                  No bundles found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
