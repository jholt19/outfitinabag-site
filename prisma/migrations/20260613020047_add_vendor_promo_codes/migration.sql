-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "vendorId" TEXT;

-- CreateIndex
CREATE INDEX "PromoCode_vendorId_idx" ON "PromoCode"("vendorId");

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
