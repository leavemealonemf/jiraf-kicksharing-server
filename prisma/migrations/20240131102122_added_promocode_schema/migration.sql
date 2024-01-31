-- CreateEnum
CREATE TYPE "PromocodeStatus" AS ENUM ('ACTIVE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "PromocodeType" AS ENUM ('BALANCE');

-- CreateTable
CREATE TABLE "Promocode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "sum" TEXT NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "type" "PromocodeType" NOT NULL DEFAULT 'BALANCE',
    "status" "PromocodeStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Promocode_pkey" PRIMARY KEY ("id")
);
