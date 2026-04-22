-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" TEXT NOT NULL DEFAULT 'PENDING';
