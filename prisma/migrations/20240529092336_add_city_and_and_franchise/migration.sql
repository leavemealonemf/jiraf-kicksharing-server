/*
  Warnings:

  - You are about to drop the column `city` on the `Franchise` table. All the data in the column will be lost.
  - You are about to drop the column `income` on the `Franchise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cityId]` on the table `Franchise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `Geofence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `franchiseId` to the `Geofence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `franchiseId` to the `Scooter` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FranchiseWorkStatus" AS ENUM ('WORK', 'PAUSE', 'WINTERING');

-- AlterTable
ALTER TABLE "Franchise" DROP COLUMN "city",
DROP COLUMN "income",
ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "priceForScooterMonth" DOUBLE PRECISION,
ADD COLUMN     "workStatus" "FranchiseWorkStatus" NOT NULL DEFAULT 'WORK';

-- AlterTable
ALTER TABLE "Geofence" ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "franchiseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Scooter" ADD COLUMN     "franchiseId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_cityId_key" ON "Franchise"("cityId");

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geofence" ADD CONSTRAINT "Geofence_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geofence" ADD CONSTRAINT "Geofence_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
