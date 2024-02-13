/*
  Warnings:

  - You are about to drop the column `franchiseId` on the `Scooter` table. All the data in the column will be lost.
  - You are about to drop the column `parkingId` on the `Scooter` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_franchiseId_fkey";

-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_parkingId_fkey";

-- AlterTable
ALTER TABLE "Scooter" DROP COLUMN "franchiseId",
DROP COLUMN "parkingId";
