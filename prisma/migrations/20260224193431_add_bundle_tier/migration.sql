-- CreateEnum
CREATE TYPE "BundleTier" AS ENUM ('BASIC', 'PLUS', 'ELITE');

-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "tier" "BundleTier";
