/*
  Warnings:

  - You are about to drop the column `tariffId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tariffId_fkey";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "tariffId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tariffId",
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "spending" DOUBLE PRECISION,
ALTER COLUMN "name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
