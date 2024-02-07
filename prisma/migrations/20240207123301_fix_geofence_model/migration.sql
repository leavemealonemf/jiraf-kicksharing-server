/*
  Warnings:

  - You are about to drop the column `firtsTimePeriodStar` on the `Geofence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Geofence" DROP COLUMN "firtsTimePeriodStar",
ADD COLUMN     "firtsTimePeriodStart" TIMESTAMP(3);
