"use client";

import Link from "next/link";

export default function AdminVendorsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Vendor Applications</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        Review and approve vendor applications.
      </p>

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 20,
            background: "white",
          }}
        >
          <p style={{ margin: 0, fontWeight: 900 }}>No pending vendors.</p>
          <p style={{ color: "#666", marginTop: 8 }}>
            Vendor applications will appear here once submitted.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </div>
    </main>
  );
}
