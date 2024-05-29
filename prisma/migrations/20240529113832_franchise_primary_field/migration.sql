/*
  Warnings:

  - Made the column `franchiseId` on table `Scooter` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_franchiseId_fkey";

-- AlterTable
ALTER TABLE "Scooter" ALTER COLUMN "franchiseId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
