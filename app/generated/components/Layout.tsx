import Link from "next/link";
import { useEffect, useState } from "react";

const CART_KEY = "oia_cart_v1";

function countCartItems() {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return items.reduce((sum: number, x: any) => sum + (x.qty || 0), 0);
  } catch {
    return 0;
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(countCartItems());
    const onStorage = () => setCartCount(countCartItems());
    window.addEventListener("storage", onStorage);

    // Also update cart count after “Add to bag” alerts
    const id = setInterval(() => setCartCount(countCartItems()), 800);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "#111" }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              OutfitInABag<span style={{ fontWeight: 700, color: "#888" }}>.com</span>
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              Complete outfits for every occasion
            </div>
          </Link>

          <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/" style={linkStyle}>Home</Link>
            <Link href="/outfits" style={linkStyle}>Outfits</Link>
            <Link href="/bag" style={linkStyle}>
              Bag{cartCount ? ` (${cartCount})` : ""}
            </Link>
            <Link href="/my-orders" style={linkStyle}>My Orders</Link>
            <span style={{ width: 1, background: "#eee", margin: "0 6px" }} />
            <Link href="/admin/dashboard" style={linkStyle}>Admin</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 18px" }}>
        {children}
      </main>

      <footer style={{ borderTop: "1px solid #eee", marginTop: 30, background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px", color: "#666", fontSize: 13 }}>
          © {new Date().getFullYear()} OutfitInABag — Founded by Joshua & Stacy Holt
        </div>
      </footer>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#111",
  fontWeight: 800,
  fontSize: 14,
};
