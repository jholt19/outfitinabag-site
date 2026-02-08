import Link from "next/link";

const OCCASIONS = [
  {
    title: "Vacation",
    subtitle: "Beach, resort, city trips — done for you.",
    href: "/outfits?category=VACATION",
  },
  {
    title: "Formal",
    subtitle: "Black tie, dinner, upscale events.",
    href: "/outfits?category=FORMAL",
  },
  {
    title: "Casual",
    subtitle: "Everyday fits that still look put-together.",
    href: "/outfits?category=CASUAL",
  },
  {
    title: "Weddings",
    subtitle: "Guest looks + complete accessories.",
    href: "/outfits?category=WEDDING",
  },
];

export default function HomePage() {
  return (
    <div>
      <section
        style={{
          borderRadius: 18,
          padding: 22,
          background: "linear-gradient(135deg, #111, #333)",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 34, margin: 0, fontWeight: 950 }}>
          Complete outfits. Every occasion.
        </h1>
        <p style={{ marginTop: 10, maxWidth: 720, color: "#e6e6e6", fontSize: 15, lineHeight: 1.5 }}>
          OutfitInABag curates full outfits from multiple vendors — so customers don’t have to hunt for pieces.
          Pick an occasion, choose a bundle, checkout fast.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <Link href="/outfits" style={ctaPrimary}>Shop Outfits</Link>
          <Link href="/bag" style={ctaSecondary}>View Bag</Link>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Shop by Occasion</h2>
        <p style={{ marginTop: 6, color: "#666" }}>
          Tap an occasion to see bundles made for that moment.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          {OCCASIONS.map((o) => (
            <Link key={o.title} href={o.href} style={card}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>{o.title}</div>
              <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>{o.subtitle}</div>
              <div style={{ marginTop: 10, fontWeight: 900 }}>Browse →</div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ border: "1px solid #eee", background: "white", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 950, fontSize: 16 }}>How it works</div>
          <ol style={{ marginTop: 10, color: "#555", lineHeight: 1.6 }}>
            <li>Choose an occasion (Vacation, Formal, Casual, Wedding)</li>
            <li>Select a curated outfit bundle</li>
            <li>Add to Bag → Checkout</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

const ctaPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  background: "white",
  color: "#111",
  fontWeight: 950,
  textDecoration: "none",
};

const ctaSecondary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "transparent",
  color: "white",
  fontWeight: 950,
  textDecoration: "none",
};

const card: React.CSSProperties = {
  border: "1px solid #eee",
  background: "white",
  borderRadius: 16,
  padding: 16,
  textDecoration: "none",
  color: "#111",
};
