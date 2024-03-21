/*
  Warnings:

  - You are about to drop the `TripCoordinates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TripCoordinates" DROP CONSTRAINT "TripCoordinates_tripId_fkey";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "coordinates" TEXT;

-- DropTable
DROP TABLE "TripCoordinates";
