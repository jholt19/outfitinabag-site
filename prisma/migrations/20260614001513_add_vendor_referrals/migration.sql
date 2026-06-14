-- CreateTable
CREATE TABLE "VendorReferral" (
    "id" TEXT NOT NULL,
    "referrerVendorId" TEXT NOT NULL,
    "referredVendorId" TEXT NOT NULL,
    "referralCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorReferral_referrerVendorId_idx" ON "VendorReferral"("referrerVendorId");

-- CreateIndex
CREATE INDEX "VendorReferral_referredVendorId_idx" ON "VendorReferral"("referredVendorId");

-- CreateIndex
CREATE INDEX "VendorReferral_status_idx" ON "VendorReferral"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VendorReferral_referrerVendorId_referredVendorId_key" ON "VendorReferral"("referrerVendorId", "referredVendorId");

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_referrerVendorId_fkey" FOREIGN KEY ("referrerVendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_referredVendorId_fkey" FOREIGN KEY ("referredVendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
