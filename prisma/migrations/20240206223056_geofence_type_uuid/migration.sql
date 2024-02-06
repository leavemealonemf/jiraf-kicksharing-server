/*
  Warnings:

  - Added the required column `uuid` to the `GeofenceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeofenceType" ADD COLUMN     "uuid" TEXT NOT NULL;
