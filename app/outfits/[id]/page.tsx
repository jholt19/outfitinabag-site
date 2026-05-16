import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bundle = await prisma.bundle.findUnique({
    where: {
      id,
    },
    include: {
      vendor: true,
    },
  });

  if (!bundle) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Outfit not found</h1>
        <p>ID: {id}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>{bundle.title}</h1>

      <p>{bundle.description}</p>

      <p>
        Vendor: {bundle.vendor?.name}
      </p>

      <p>
        Price: ${(bundle.price / 100).toFixed(2)}
      </p>

      {bundle.image && (
        <img
          src={bundle.image}
          alt={bundle.title}
          style={{
            width: 300,
            borderRadius: 20,
            marginTop: 20,
          }}
        />
      )}
    </main>
  );
}