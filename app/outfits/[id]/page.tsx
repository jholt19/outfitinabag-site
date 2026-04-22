import { OUTFITS } from "@/lib/outfits";
import Image from "next/image";
import Link from "next/link";

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const outfit = OUTFITS.find((o) => String(o.id) === String(id));

  if (!outfit) {
    return (
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 24,
        }}
      >
        <Link
          href="/outfits"
          style={{
            fontWeight: 900,
            textDecoration: "none",
            color: "#111",
          }}
        >
          ← Back to outfits
        </Link>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #eee",
            borderRadius: 16,
            background: "white",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            Outfit not found
          </h1>

          <p style={{ color: "#555", marginTop: 10 }}>
            We couldn’t find a fit for this link.
          </p>

          <div style={{ marginTop: 16 }}>
            <Link
              href="/outfits"
              style={{
                fontWeight: 900,
                textDecoration: "none",
                color: "#111",
              }}
            >
              Browse all outfits →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <Link
        href="/outfits"
        style={{
          fontWeight: 900,
          textDecoration: "none",
          color: "#111",
        }}
      >
        ← Back to outfits
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          marginTop: 20,
        }}
      >
        <div
          style={{
            position: "relative",
            height: 560,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #eee",
            background: "#f3f3f3",
          }}
        >
          <Image
            src={outfit.image}
            alt={outfit.title}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        <div>
          <div
            style={{
              display: "inline-block",
              background: "#f3f3f3",
              border: "1px solid #e6e6e6",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 900,
              color: "#333",
            }}
          >
            {outfit.occasion}
          </div>

          <h1
            style={{
              fontSize: 40,
              fontWeight: 950,
              marginTop: 14,
              lineHeight: 1,
              color: "#111",
            }}
          >
            {outfit.title}
          </h1>

          <p
            style={{
              color: "#555",
              marginTop: 14,
              fontSize: 16,
              lineHeight: 1.55,
            }}
          >
            {outfit.description}
          </p>

          <div
            style={{
              marginTop: 24,
              border: "1px solid #eee",
              borderRadius: 16,
              background: "#fafafa",
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              What’s included
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                color: "#444",
                lineHeight: 1.9,
              }}
            >
              <li>Top</li>
              <li>Bottom</li>
              <li>Shoes</li>
              <li>Accessories</li>
            </ul>
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 950,
                color: "#111",
              }}
            >
              ${(outfit.price / 100).toFixed(2)}
            </div>

            <form action="/bag" method="GET">
              <input type="hidden" name="addBundleId" value={outfit.id} />

              <button
                type="submit"
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "15px",
                  background: "#111",
                  color: "white",
                  fontWeight: 900,
                  borderRadius: 14,
                  border: "none",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                BUY THE FULL FIT
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}