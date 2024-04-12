-- CreateEnum
CREATE TYPE "ControlledStatuses" AS ENUM ('ONLINE', 'BLOCKED', 'CHARGE', 'REPAIR');

-- AlterTable
ALTER TABLE "Scooter" ADD COLUMN     "controlledStatuses" "ControlledStatuses" NOT NULL DEFAULT 'ONLINE';
