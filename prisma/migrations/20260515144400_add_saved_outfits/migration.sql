-- CreateTable
CREATE TABLE "SavedOutfit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOutfit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedOutfit_userId_idx" ON "SavedOutfit"("userId");

-- CreateIndex
CREATE INDEX "SavedOutfit_bundleId_idx" ON "SavedOutfit"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOutfit_userId_bundleId_key" ON "SavedOutfit"("userId", "bundleId");

-- AddForeignKey
ALTER TABLE "SavedOutfit" ADD CONSTRAINT "SavedOutfit_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
