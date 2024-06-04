/*
  Warnings:

  - You are about to drop the column `erpUserId` on the `Franchise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Franchise` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Franchise" DROP CONSTRAINT "Franchise_erpUserId_fkey";

-- DropIndex
DROP INDEX "Franchise_erpUserId_key";

-- AlterTable
ALTER TABLE "Franchise" DROP COLUMN "erpUserId",
ADD COLUMN     "ownerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_ownerId_key" ON "Franchise"("ownerId");

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ErpUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
