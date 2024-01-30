/*
  Warnings:

  - Added the required column `reservationCoast` to the `Tariff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tariff" ADD COLUMN     "reservationCoast" DOUBLE PRECISION NOT NULL;
