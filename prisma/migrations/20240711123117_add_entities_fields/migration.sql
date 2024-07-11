/*
  Warnings:

  - Made the column `fixedCost` on table `Tariff` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TariffType" AS ENUM ('FIXED', 'MINUTE');

-- AlterTable
ALTER TABLE "Franchise" ADD COLUMN     "cloudpaymentsKey" TEXT;

-- AlterTable
ALTER TABLE "Tariff" ADD COLUMN     "costForMinuteAfterFixed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "type" "TariffType" NOT NULL DEFAULT 'MINUTE',
ALTER COLUMN "fixedCost" SET NOT NULL,
ALTER COLUMN "fixedCost" SET DEFAULT 0.0;
