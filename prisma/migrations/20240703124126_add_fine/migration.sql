/*
  Warnings:

  - You are about to drop the column `cause` on the `fine` table. All the data in the column will be lost.
  - You are about to drop the column `deviceUUID` on the `fine` table. All the data in the column will be lost.
  - You are about to drop the column `initiator` on the `fine` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tripId]` on the table `fine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `causeText` to the `fine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `causeType` to the `fine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initiatorId` to the `fine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripId` to the `fine` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FineReason" AS ENUM ('DAMAGE', 'LOSS', 'OUTPARKING');

-- DropIndex
DROP INDEX "fine_deviceUUID_key";

-- DropIndex
DROP INDEX "fine_initiator_key";

-- AlterTable
ALTER TABLE "fine" DROP COLUMN "cause",
DROP COLUMN "deviceUUID",
DROP COLUMN "initiator",
ADD COLUMN     "causeText" TEXT NOT NULL,
ADD COLUMN     "causeType" "FineReason" NOT NULL,
ADD COLUMN     "initiatorId" INTEGER NOT NULL,
ADD COLUMN     "tripId" INTEGER NOT NULL,
ALTER COLUMN "closedAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fine_tripId_key" ON "fine"("tripId");

-- AddForeignKey
ALTER TABLE "fine" ADD CONSTRAINT "fine_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fine" ADD CONSTRAINT "fine_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
