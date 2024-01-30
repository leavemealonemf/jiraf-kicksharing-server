/*
  Warnings:

  - You are about to drop the column `pauseCoast` on the `Tariff` table. All the data in the column will be lost.
  - You are about to drop the column `reservationCoast` on the `Tariff` table. All the data in the column will be lost.
  - Added the required column `pauseCost` to the `Tariff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationCost` to the `Tariff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tariff" DROP COLUMN "pauseCoast",
DROP COLUMN "reservationCoast",
ADD COLUMN     "pauseCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reservationCost" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "fixedCost" DROP NOT NULL;
