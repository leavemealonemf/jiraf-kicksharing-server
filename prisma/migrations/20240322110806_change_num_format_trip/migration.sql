/*
  Warnings:

  - You are about to alter the column `distance` on the `Trip` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "distance" SET DATA TYPE INTEGER;
