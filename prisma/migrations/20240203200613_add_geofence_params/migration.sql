/*
  Warnings:

  - A unique constraint covering the columns `[paramsId]` on the table `GeofenceType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `colorHex` to the `GeofenceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeofenceType" ADD COLUMN     "canParking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRiding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "colorHex" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isParkingFine" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isScooterBehavior" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noiceToTheClient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paramsId" INTEGER,
ALTER COLUMN "img" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GeofenceTypeParams" (
    "id" SERIAL NOT NULL,
    "zoneTimeCondition" TEXT,
    "parkingFinePrice" DOUBLE PRECISION,
    "speedReduction" INTEGER,
    "notificationMessage" TEXT,

    CONSTRAINT "GeofenceTypeParams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceType_paramsId_key" ON "GeofenceType"("paramsId");

-- AddForeignKey
ALTER TABLE "GeofenceType" ADD CONSTRAINT "GeofenceType_paramsId_fkey" FOREIGN KEY ("paramsId") REFERENCES "GeofenceTypeParams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
