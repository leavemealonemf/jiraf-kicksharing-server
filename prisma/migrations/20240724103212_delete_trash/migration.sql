/*
  Warnings:

  - You are about to drop the column `batteryLevel` on the `Scooter` table. All the data in the column will be lost.
  - You are about to drop the `Parking` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Scooter" DROP COLUMN "batteryLevel";

-- DropTable
DROP TABLE "Parking";
