import { useRouter } from "next/router";

export default function OutfitDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main style={{ padding: 24 }}>
      <a href="/outfits">← Back to Outfits</a>
      <h1 style={{ marginTop: 16 }}>Outfit: {id}</h1>
      <p>If you see this, /outfits/test works.</p>
    </main>
  );
}
