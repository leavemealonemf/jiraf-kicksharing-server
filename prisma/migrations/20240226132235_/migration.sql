/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "cardFirstFour" TEXT,
ADD COLUMN     "cardFirstSix" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "expMonth" TEXT,
ADD COLUMN     "expYear" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_paymentId_key" ON "PaymentMethod"("paymentId");
