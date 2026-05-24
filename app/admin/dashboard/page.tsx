export default function AdminDashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 950 }}>
        Admin Dashboard
      </h1>

      <p style={{ color: "#666", marginTop: 8 }}>
        Manage orders, vendors, bundles, and promotions.
      </p>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <a href="/admin/orders" style={card}>
          <div style={cardTitle}>Orders</div>

          <div style={cardText}>
            View paid orders and manage fulfillment/refunds.
          </div>
        </a>

        <a href="/admin/vendors" style={card}>
          <div style={cardTitle}>Vendors</div>

          <div style={cardText}>
            Approve vendors and manage marketplace sellers.
          </div>
        </a>

        <a href="/admin/bundles" style={card}>
          <div style={cardTitle}>Bundles</div>

          <div style={cardText}>
            Review and manage storefront outfit bundles.
          </div>
        </a>

        <a href="/admin/promo" style={promoCard}>
          <div style={cardTitle}>Promo Codes</div>

          <div style={cardText}>
            Create discount codes and promotional offers.
          </div>

          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#111",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              width: "fit-content",
            }}
          >
            Marketing
          </div>
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
  borderRadius: 18,
  padding: 20,
  color: "#111",
  transition: "0.2s ease",
};

const promoCard: React.CSSProperties = {
  ...card,
  border: "1px solid #d4b106",
  background:
    "linear-gradient(135deg, rgba(255,248,214,1) 0%, rgba(255,255,255,1) 100%)",
};

const cardTitle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: 18,
};

const cardText: React.CSSProperties = {
  marginTop: 8,
  color: "#666",
  fontSize: 14,
  lineHeight: 1.5,
};