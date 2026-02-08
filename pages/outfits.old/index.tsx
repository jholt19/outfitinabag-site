import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";


type Occasion = "VACATION" | "WEDDING" | "CASUAL" | "FORMAL";

type Outfit = {
  id: string;
  title: string;
  occasion: Occasion;
  price: number;
  description: string;
  image: string;
};


const OUTFITS: Outfit[] = [
{
  id: "vac-1",
  title: "Beach Breeze Set",
  occasion: "VACATION",
  price: 129,
  description: "Light and breezy vacation fit.",
  image: "/outfits/vac-1.jpg",
},
{
  id: "vac-2",
  title: "Resort Night Look",
  occasion: "VACATION",
  price: 179,
  description: "Dinner-ready resort style.",
  image: "/outfits/vac-2.jpg",
},
{
  id: "wed-1",
  title: "Wedding Guest Classic",
  occasion: "WEDDING",
  price: 199,
  description: "Timeless wedding guest outfit.",
  image: "/outfits/wed-1.jpg",
},
{
  id: "wed-2",
  title: "Garden Ceremony Fit",
  occasion: "WEDDING",
  price: 189,
  description: "Perfect for outdoor ceremonies.",
  image: "/outfits/wed-2.jpg",
},
{
  id: "cas-1",
  title: "Everyday Street Casual",
  occasion: "CASUAL",
  price: 99,
  description: "Clean everyday comfort.",
  image: "/outfits/cas-1.jpg",
},
{
  id: "cas-2",
  title: "Weekend Chill Outfit",
  occasion: "CASUAL",
  price: 89,
  description: "Relaxed weekend vibes.",
  image: "/outfits/cas-2.jpg",
},
{
  id: "for-1",
  title: "Black Tie Ready",
  occasion: "FORMAL",
  price: 249,
  description: "Formal event ready.",
  image: "/outfits/for-1.jpg",
},
{
  id: "for-2",
  title: "Modern Formal Set",
  occasion: "FORMAL",
  price: 229,
  description: "Modern sleek formalwear.",
  image: "/outfits/for-2.jpg",
},
];
export default function OutfitsPage() {
  const router = useRouter();
  const category = String(router.query.category || "ALL").toUpperCase();

  const filtered =
  category === "ALL"
    ? OUTFITS
    : OUTFITS.filter((o) => o.occasion === category);

function addToBag(o: any) {
  const CART_KEY = "oia_cart_v1";
  const raw = localStorage.getItem(CART_KEY);
  const items = raw ? JSON.parse(raw) : [];

  const existing = items.find((x: any) => x.id === o.id);
  let next;

  if (existing) {
    next = items.map((x: any) =>
      x.id === o.id ? { ...x, qty: x.qty + 1 } : x
    );
  } else {
    next = [
      ...items,
      {
        id: o.id,
        title: o.title,
        price: o.price,
        image: `/outfits/${o.id}.jpg`,
        occasion: o.occasion,
        qty: 1,
      },
    ];
  }

  localStorage.setItem(CART_KEY, JSON.stringify(next));
  alert("Added to bag!");
}
    category === "ALL"
      ? OUTFITS
      : OUTFITS.filter((o) => o.occasion === category);

  const setCategory = (value: string) => {
    value === "ALL"
      ? router.push("/outfits")
      : router.push(`/outfits?category=${value}`);
  };

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 22 }}>OutfitInABag</Link>
          <nav style={{ display: "flex", gap: 14 }}>
  <Link href="/outfits">Outfits</Link>
  <Link href="/bag">Bag</Link>
  <a href="/signup">Sign Up</a>
  <a href="/login">Login</a>
</nav>
      </header>

      <h1 style={{ fontSize: 36, marginBottom: 6 }}>Shop Outfits</h1>
      <p style={{ color: "#555", marginBottom: 18 }}>
        Curated outfit bundles for every occasion.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["ALL", "VACATION", "WEDDING", "CASUAL", "FORMAL"].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: category === c ? "#111" : "#fff",
              color: category === c ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
        {filtered.map((o) => (
          <div key={o.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
          <img
  src={`/outfits/${o.id}.jpg`}
  alt={o.title}
  style={{
    width: "100%",
    height: 140,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
    display: "block",
  }}
/>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{o.occasion}</div>
            <h3 style={{ margin: "6px 0" }}>{o.title}</h3>
            <p style={{ fontSize: 13, color: "#555" }}>{o.description}</p>
            <strong>${o.price}</strong>

            <Link
              href={`/outfits/${o.id}`}
              style={{
                display: "block",
                marginTop: 10,
                textAlign: "center",
                background: "#111",
                color: "#fff",
                padding: "10px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              View Outfit
            </Link>
            <button
  onClick={() => addToBag(o)}
  style={{
    width: "100%",
    marginTop: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: "10px",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  Add to Bag
</button>

          </div>
        ))}
      </section>
    </main>
  );
}
