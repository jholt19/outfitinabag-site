export const dynamic = "force-dynamic";

export default async function BagPage({
  searchParams,
}: {
  searchParams?: Promise<{ addBundleId?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const bundleId = params?.addBundleId;

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>DEBUG BAG PAGE</h1>

      <p style={{ marginTop: 20, fontSize: 18 }}>Bundle ID from URL:</p>

      <pre
        style={{
          marginTop: 10,
          padding: 20,
          background: "#f3f3f3",
          borderRadius: 12,
          fontSize: 16,
        }}
      >
        {bundleId || "undefined"}
      </pre>
    </main>
  );
}