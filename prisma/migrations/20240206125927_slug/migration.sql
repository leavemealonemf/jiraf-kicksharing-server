/*
  Warnings:

  - Made the column `slug` on table `GeofenceType` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GeofenceType" ALTER COLUMN "slug" SET NOT NULL;
