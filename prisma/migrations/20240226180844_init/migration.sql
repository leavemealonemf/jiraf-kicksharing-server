-- CreateEnum
CREATE TYPE "ScooterStatus" AS ENUM ('ACTIVE', 'SERVICE', 'REPAIR');

-- CreateEnum
CREATE TYPE "ErpUserRoles" AS ENUM ('ADMIN', 'MANAGER', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "ErpUserStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "TariffStatus" AS ENUM ('ACTIVE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "PromocodeStatus" AS ENUM ('ACTIVE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "PromocodeType" AS ENUM ('BALANCE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "GeofenceDrawType" AS ENUM ('POLYGON', 'POLYLINE', 'CIRCLE');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'SBP', 'SBERPAY');

-- CreateTable
CREATE TABLE "ErpUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "uuid" TEXT,
    "phone" TEXT,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "ErpUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "ErpUserRoles" NOT NULL DEFAULT 'MANAGER',
    "franchiseId" INTEGER,
    "inviterId" INTEGER,

    CONSTRAINT "ErpUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Franchise" (
    "id" SERIAL NOT NULL,
    "erpUserId" INTEGER NOT NULL,
    "city" TEXT,
    "income" INTEGER,

    CONSTRAINT "Franchise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "spending" DOUBLE PRECISION,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "activePaymentMethod" INTEGER,
    "subscriptionId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "paymentId" TEXT NOT NULL,
    "idempotenceKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "cardFirstSix" TEXT,
    "cardLastFour" TEXT,
    "expYear" TEXT,
    "expMonth" TEXT,
    "cardType" TEXT,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "token" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "erpUserId" INTEGER NOT NULL,
    "user_agent" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "tripId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "travelTime" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER,
    "tariffId" INTEGER,
    "scooterId" INTEGER,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCoordinates" (
    "id" SERIAL NOT NULL,
    "latLon" DOUBLE PRECISION[],
    "tripId" INTEGER,

    CONSTRAINT "TripCoordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scooter" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "batteryLevel" INTEGER NOT NULL,
    "status" "ScooterStatus" NOT NULL DEFAULT 'ACTIVE',
    "power" BOOLEAN NOT NULL DEFAULT false,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo" TEXT,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "Scooter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScooterModel" (
    "id" SERIAL NOT NULL,
    "modelName" TEXT NOT NULL,

    CONSTRAINT "ScooterModel_pkey" PRIMARY KEY ("id")
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
    "pauseCost" DOUBLE PRECISION NOT NULL,
    "fixedCost" DOUBLE PRECISION,
    "reservationCost" DOUBLE PRECISION NOT NULL,
    "colorHex" TEXT NOT NULL,
    "status" "TariffStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "sum" TEXT NOT NULL,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "type" "PromocodeType" NOT NULL DEFAULT 'BALANCE',
    "status" "PromocodeStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Promocode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geofence" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT,
    "name" TEXT,
    "coordinates" TEXT,
    "radius" DOUBLE PRECISION,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allTimeSpeedLimit" INTEGER,
    "firtsTimePeriodStart" TEXT,
    "firstTimePeriodEnd" TEXT,
    "firstSpeedLimit" INTEGER,
    "secondTimePeriodStart" TEXT,
    "secondTimePeriodEnd" TEXT,
    "secondSpeedLimit" INTEGER,
    "address" TEXT,
    "img" TEXT,
    "typeId" INTEGER,

    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeofenceType" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subTitle" TEXT,
    "slug" TEXT NOT NULL,
    "img" TEXT,
    "drawType" "GeofenceDrawType" NOT NULL DEFAULT 'POLYGON',
    "canParking" BOOLEAN NOT NULL DEFAULT false,
    "canRiding" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "secondDescription" TEXT,
    "parkingPrice" DOUBLE PRECISION,
    "colorHex" TEXT NOT NULL,
    "isParkingFine" BOOLEAN NOT NULL DEFAULT false,
    "isScooterBehavior" BOOLEAN NOT NULL DEFAULT false,
    "noiceToTheClient" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GeofenceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeofenceTypeParams" (
    "id" SERIAL NOT NULL,
    "zoneTimeCondition" TEXT,
    "parkingFinePrice" DOUBLE PRECISION,
    "speedReduction" INTEGER,
    "notificationMessage" TEXT,
    "geofenceTypeId" INTEGER NOT NULL,

    CONSTRAINT "GeofenceTypeParams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forgot-password" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiredTime" TIMESTAMP(3) NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot-password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_erpUserId_key" ON "Franchise"("erpUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_paymentId_key" ON "PaymentMethod"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Scooter_deviceId_key" ON "Scooter"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ScooterModel_modelName_key" ON "ScooterModel"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "Geofence_name_key" ON "Geofence"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceType_name_key" ON "GeofenceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceTypeParams_geofenceTypeId_key" ON "GeofenceTypeParams"("geofenceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "forgot-password_userId_key" ON "forgot-password"("userId");

-- AddForeignKey
ALTER TABLE "ErpUser" ADD CONSTRAINT "ErpUser_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "ErpUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_erpUserId_fkey" FOREIGN KEY ("erpUserId") REFERENCES "ErpUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_erpUserId_fkey" FOREIGN KEY ("erpUserId") REFERENCES "ErpUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_scooterId_fkey" FOREIGN KEY ("scooterId") REFERENCES "Scooter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCoordinates" ADD CONSTRAINT "TripCoordinates_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ScooterModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geofence" ADD CONSTRAINT "Geofence_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "GeofenceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeofenceTypeParams" ADD CONSTRAINT "GeofenceTypeParams_geofenceTypeId_fkey" FOREIGN KEY ("geofenceTypeId") REFERENCES "GeofenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forgot-password" ADD CONSTRAINT "forgot-password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ErpUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
