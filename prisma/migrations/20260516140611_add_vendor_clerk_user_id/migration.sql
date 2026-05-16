/*
  Warnings:

  - A unique constraint covering the columns `[clerkUserId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_clerkUserId_key" ON "Vendor"("clerkUserId");
