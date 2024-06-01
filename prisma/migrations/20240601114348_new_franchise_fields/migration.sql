/*
  Warnings:

  - You are about to drop the column `franchiseName` on the `Franchise` table. All the data in the column will be lost.
  - Added the required column `organization` to the `Franchise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_franchiseId_fkey";

-- AlterTable
ALTER TABLE "Franchise" DROP COLUMN "franchiseName",
ADD COLUMN     "organization" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Scooter" ALTER COLUMN "franchiseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
