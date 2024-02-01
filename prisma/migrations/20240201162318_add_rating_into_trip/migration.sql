/*
  Warnings:

  - Added the required column `rating` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "tripId" TEXT NOT NULL;
