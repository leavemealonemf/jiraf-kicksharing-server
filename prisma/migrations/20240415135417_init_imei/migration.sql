/*
  Warnings:

  - A unique constraint covering the columns `[deviceIMEI]` on the table `Scooter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Scooter" ADD COLUMN     "deviceIMEI" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Scooter_deviceIMEI_key" ON "Scooter"("deviceIMEI");
