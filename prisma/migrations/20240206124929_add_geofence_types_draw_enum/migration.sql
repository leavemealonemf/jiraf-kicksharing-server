-- CreateEnum
CREATE TYPE "GeofenceDrawType" AS ENUM ('POLYGON', 'POLYLINE', 'CIRCLE');

-- AlterTable
ALTER TABLE "GeofenceType" ADD COLUMN     "drawType" "GeofenceDrawType" NOT NULL DEFAULT 'POLYGON';
