/*
  Warnings:

  - Added the required column `legalAddress` to the `Franchise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `youKassaAccount` to the `Franchise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Franchise" ADD COLUMN     "legalAddress" TEXT NOT NULL,
ADD COLUMN     "taxpayerIdNumber" INTEGER,
ADD COLUMN     "youKassaAccount" TEXT NOT NULL;
