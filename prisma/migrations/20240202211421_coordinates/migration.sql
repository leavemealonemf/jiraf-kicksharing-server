/*
  Warnings:

  - You are about to drop the column `coordinates` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "coordinates";

-- CreateTable
CREATE TABLE "TripCoordinates" (
    "id" SERIAL NOT NULL,
    "latLon" DOUBLE PRECISION[],
    "tripId" INTEGER,

    CONSTRAINT "TripCoordinates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TripCoordinates" ADD CONSTRAINT "TripCoordinates_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
