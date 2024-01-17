/*
  Warnings:

  - The values [RENTED,NOTRENTED] on the enum `ScooterStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `active` on the `Scooter` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScooterStatus_new" AS ENUM ('ACTIVE', 'SERVICE');
ALTER TABLE "Scooter" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Scooter" ALTER COLUMN "status" TYPE "ScooterStatus_new" USING ("status"::text::"ScooterStatus_new");
ALTER TYPE "ScooterStatus" RENAME TO "ScooterStatus_old";
ALTER TYPE "ScooterStatus_new" RENAME TO "ScooterStatus";
DROP TYPE "ScooterStatus_old";
ALTER TABLE "Scooter" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Scooter" DROP COLUMN "active",
ADD COLUMN     "power" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
