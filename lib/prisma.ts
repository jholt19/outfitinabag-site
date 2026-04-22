import { PrismaClient } from "@prisma/client";

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://localhost:5432/outfitinabag_local?schema=public";

// Use globalThis (NOT global) to avoid "global is not defined"
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
