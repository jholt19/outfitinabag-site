import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vendorCreateBundle } from "../actions/createBundle";

export const dynamic = "force-dynamic";

export default async function VendorNewBundlePage({
  searchParams,
}: {
  searchParams?: { vendorId?: string };
}) {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
  const preselectedVendorId = searchParams?.vendorId ?? "";

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Vendor • Create Bundle</h1>
        <Link href="/vendor/dashboard">← Back</Link>
      </div>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        New bundles start <b>unpublished</b>. You can submit them for review later (next step we’ll add that flow).
      </p>

      <form
        action={vendorCreateBundle}
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "white",
        }}
      >
        <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Vendor</label>
        <select
          name="vendorId"
          required
          defaultValue={preselectedVendorId || ""}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
        >
          <option value="" disabled>
            Select your vendor…
          </option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Title</label>
            <input
              name="title"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
              placeholder="Formal Night PCS"
            />
          </div>

          <div>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Occasion</label>
            <select
              name="occasion"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
              defaultValue="FORMAL"
            >
              <option value="FORMAL">FORMAL</option>
              <option value="CASUAL">CASUAL</option>
              <option value="WEDDING">WEDDING</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Description</label>
          <textarea
            name="description"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
            rows={4}
            placeholder="What makes this bundle special?"
          />
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Price (cents)</label>
            <input
              name="price"
              type="number"
              required
              min={1}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
              placeholder="14900"
            />
          </div>

          <div>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Retail Value ($)</label>
            <input
              name="retailValue"
              type="number"
              min={0}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
              placeholder="249"
            />
          </div>

          <div>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Tier</label>
            <select
              name="tier"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
              defaultValue=""
            >
              <option value="">—</option>
              <option value="BASIC">BASIC</option>
              <option value="PLUS">PLUS</option>
              <option value="ELITE">ELITE</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Image path (optional)</label>
          <input
            name="image"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
            placeholder="/outfits/for-1.jpg"
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Create Bundle
        </button>
      </form>
    </main>
  );
}
