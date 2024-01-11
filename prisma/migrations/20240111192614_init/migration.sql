-- CreateEnum
CREATE TYPE "ScooterStatus" AS ENUM ('RENTED', 'NOTRENTED');

-- CreateTable
CREATE TABLE "ErpUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "franchiseId" INTEGER,

    CONSTRAINT "ErpUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Franchise" (
    "id" SERIAL NOT NULL,
    "erpUserId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "income" INTEGER NOT NULL,

    CONSTRAINT "Franchise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "tariffId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "travelTime" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "scooterId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scooter" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "franchiseId" INTEGER,
    "batteryLevel" INTEGER NOT NULL,
    "status" "ScooterStatus" NOT NULL DEFAULT 'NOTRENTED',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo" TEXT,
    "parkingId" INTEGER NOT NULL,

    CONSTRAINT "Scooter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parking" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "photo" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER NOT NULL,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tariff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "boardingCost" DOUBLE PRECISION NOT NULL,
    "minuteCost" DOUBLE PRECISION NOT NULL,
    "fixedCost" DOUBLE PRECISION NOT NULL,
    "colorRGB" TEXT NOT NULL,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_erpUserId_key" ON "Franchise"("erpUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Scooter_deviceId_key" ON "Scooter"("deviceId");

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_erpUserId_fkey" FOREIGN KEY ("erpUserId") REFERENCES "ErpUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
