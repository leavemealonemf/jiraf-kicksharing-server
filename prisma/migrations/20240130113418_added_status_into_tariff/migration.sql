-- CreateEnum
CREATE TYPE "TariffStatus" AS ENUM ('ACTIVE', 'ARCHIVE');

-- AlterTable
ALTER TABLE "Tariff" ADD COLUMN     "status" "TariffStatus" NOT NULL DEFAULT 'ACTIVE';
