/*
  Warnings:

  - You are about to drop the column `paramsId` on the `GeofenceType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[geofenceTypeId]` on the table `GeofenceTypeParams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `geofenceTypeId` to the `GeofenceTypeParams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GeofenceType" DROP CONSTRAINT "GeofenceType_paramsId_fkey";

-- DropIndex
DROP INDEX "GeofenceType_paramsId_key";

-- AlterTable
ALTER TABLE "GeofenceType" DROP COLUMN "paramsId";

-- AlterTable
ALTER TABLE "GeofenceTypeParams" ADD COLUMN     "geofenceTypeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceTypeParams_geofenceTypeId_key" ON "GeofenceTypeParams"("geofenceTypeId");

-- AddForeignKey
ALTER TABLE "GeofenceTypeParams" ADD CONSTRAINT "GeofenceTypeParams_geofenceTypeId_fkey" FOREIGN KEY ("geofenceTypeId") REFERENCES "GeofenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
