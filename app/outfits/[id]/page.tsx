import Link from "next/link";
import { getOutfit } from "../../../lib/outfits";
import AddToBagButton from "./AddToBagButton";

export default async function OutfitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outfit = getOutfit(id);

  if (!outfit) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Outfit not found</h1>
        <p>
          <Link href="/outfits">← Back to Outfits</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <Link href="/outfits" style={{ textDecoration: "none", fontWeight: 900 }}>
        ← Back to Outfits
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 18,
        }}
      >
        {/* Image */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #eee",
            background: "#f3f3f3",
            height: 420,
          }}
        >
          <img
            src={outfit.image}
            alt={outfit.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Details */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#555" }}>
            {outfit.occasion}
          </div>

          <h1 style={{ margin: "8px 0 0" }}>{outfit.title}</h1>

          <p style={{ color: "#666", marginTop: 10 }}>{outfit.description}</p>

          <div style={{ fontSize: 20, fontWeight: 950, marginTop: 14 }}>
            ${(outfit.price / 100).toFixed(2)}
          </div>

          <div style={{ marginTop: 14 }}>
            <AddToBagButton outfit={outfit} />
          </div>
        </div>
      </div>
    </main>
  );
}
