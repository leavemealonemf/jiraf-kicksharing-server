/*
  Warnings:

  - A unique constraint covering the columns `[orderInList]` on the table `Tariff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tariff" ADD COLUMN     "orderInList" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tariff_orderInList_key" ON "Tariff"("orderInList");
