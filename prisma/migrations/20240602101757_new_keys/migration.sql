/*
  Warnings:

  - Made the column `cityId` on table `Franchise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `franchiseId` on table `Scooter` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Franchise" DROP CONSTRAINT "Franchise_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_franchiseId_fkey";

-- AlterTable
ALTER TABLE "Franchise" ALTER COLUMN "cityId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Scooter" ALTER COLUMN "franchiseId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
