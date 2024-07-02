-- CreateEnum
CREATE TYPE "FinePaidStatus" AS ENUM ('PAID', 'NOTPAID');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('SCOOTER', 'BIKE');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "companySettings" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "fine" (
    "id" SERIAL NOT NULL,
    "fineNumber" TEXT NOT NULL,
    "tripUUID" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "deviceUUID" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "photos" TEXT[],
    "initiator" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "paidStatus" "FinePaidStatus" NOT NULL,

    CONSTRAINT "fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fine_fineNumber_key" ON "fine"("fineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fine_tripUUID_key" ON "fine"("tripUUID");

-- CreateIndex
CREATE UNIQUE INDEX "fine_deviceUUID_key" ON "fine"("deviceUUID");

-- CreateIndex
CREATE UNIQUE INDEX "fine_initiator_key" ON "fine"("initiator");
