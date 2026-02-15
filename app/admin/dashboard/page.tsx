"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        Manage orders, refunds, and vendors.
      </p>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <Card title="Orders" desc="View orders and refunds." href="/admin/orders" />
        <Card title="Vendors" desc="Review vendor applications." href="/admin/vendors" />
        <Card title="Back to site" desc="Return to the storefront." href="/outfits" />
      </div>
    </main>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid #eee",
        background: "white",
        borderRadius: 16,
        padding: 16,
        color: "#111",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div style={{ color: "#666", marginTop: 8, fontSize: 13, lineHeight: 1.35 }}>
        {desc}
      </div>
      <div style={{ marginTop: 12, fontWeight: 900, fontSize: 13 }}>Open →</div>
    </Link>
  );
}
