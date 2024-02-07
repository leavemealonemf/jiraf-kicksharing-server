/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Geofence` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Geofence" ADD COLUMN     "address" TEXT,
ADD COLUMN     "firstSpeedLimit" INTEGER,
ADD COLUMN     "firstTimePeriodEnd" TIMESTAMP(3),
ADD COLUMN     "firtsTimePeriodStar" TIMESTAMP(3),
ADD COLUMN     "img" TEXT,
ADD COLUMN     "secondSpeedLimit" INTEGER,
ADD COLUMN     "secondTimePeriodEnd" TIMESTAMP(3),
ADD COLUMN     "secondTimePeriodStart" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Geofence_name_key" ON "Geofence"("name");
