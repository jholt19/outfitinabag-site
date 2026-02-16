export default function AdminDashboardPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 950 }}>Admin Dashboard</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        Manage orders, vendors, and bundles.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <a href="/admin/orders" style={card}>
          <div style={cardTitle}>Orders</div>
          <div style={cardText}>View paid orders and manage refunds.</div>
        </a>

        <a href="/admin/vendors" style={card}>
          <div style={cardTitle}>Vendors</div>
          <div style={cardText}>Approve vendors and view vendor details.</div>
        </a>

        <a href="/admin/bundles" style={card}>
          <div style={cardTitle}>Bundles</div>
          <div style={cardText}>Create/edit bundles for the storefront.</div>
        </a>
      </div>
    </main>
  );
}

const card: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  border: "1px solid #eee",
  background: "white",
  borderRadius: 16,
  padding: 16,
  color: "#111",
};

const cardTitle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: 16,
};

const cardText: React.CSSProperties = {
  marginTop: 6,
  color: "#666",
  fontSize: 13,
  lineHeight: 1.4,
};
