import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// ✅ Prefer UNPOOLED for runtime stability (especially in dev)
const dbUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  "";

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
