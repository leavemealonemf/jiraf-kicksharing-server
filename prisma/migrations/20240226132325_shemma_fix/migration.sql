/*
  Warnings:

  - You are about to drop the column `cardFirstFour` on the `PaymentMethod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentMethod" DROP COLUMN "cardFirstFour",
ADD COLUMN     "cardLastFour" TEXT;
