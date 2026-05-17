-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL DEFAULT 'PENDING';
