-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "bonusesUsed" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonuses" DOUBLE PRECISION NOT NULL DEFAULT 0;
