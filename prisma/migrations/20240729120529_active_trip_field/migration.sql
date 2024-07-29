/*
  Warnings:

  - Added the required column `tripId` to the `active_trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "active_trip" ADD COLUMN     "tripId" INTEGER NOT NULL;
