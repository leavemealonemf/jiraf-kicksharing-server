/*
  Warnings:

  - You are about to drop the column `colorRGB` on the `Tariff` table. All the data in the column will be lost.
  - Added the required column `colorHex` to the `Tariff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pauseCoast` to the `Tariff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tariff" DROP COLUMN "colorRGB",
ADD COLUMN     "colorHex" TEXT NOT NULL,
ADD COLUMN     "pauseCoast" DOUBLE PRECISION NOT NULL;
