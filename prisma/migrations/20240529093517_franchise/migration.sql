/*
  Warnings:

  - Added the required column `franchiseName` to the `Franchise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Franchise" ADD COLUMN     "franchiseName" TEXT NOT NULL,
ALTER COLUMN "erpUserId" DROP NOT NULL;
