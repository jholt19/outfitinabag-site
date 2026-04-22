const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

(async () => {
  const vendors = await prisma.vendor.findMany({ select: { id: true, name: true } });
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  const bundles = await prisma.bundle.findMany({
    select: { id: true, title: true, vendorId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("VENDORS:");
  for (const v of vendors) {
    console.log(`- ${v.name} | ${v.id}`);
  }

  console.log("\nBUNDLES (newest first):");
  for (const b of bundles) {
    console.log(`- ${b.title} | vendorId:${b.vendorId} | vendor:${vendorMap.get(b.vendorId) || "UNKNOWN"}`);
  }
})()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
