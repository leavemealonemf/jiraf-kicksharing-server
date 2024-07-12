/*
  Warnings:

  - You are about to drop the `Debt` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DebtPayStatus" AS ENUM ('PAID', 'NOTPAID');

-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_intruderId_fkey";

-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_tripId_fkey";

-- DropTable
DROP TABLE "Debt";

-- CreateTable
CREATE TABLE "debt" (
    "id" SERIAL NOT NULL,
    "debtUUID" TEXT NOT NULL,
    "cause" TEXT NOT NULL DEFAULT 'Задолженность за поездку',
    "description" TEXT NOT NULL DEFAULT 'Поездка не оплачена частично или полностью',
    "price" DOUBLE PRECISION NOT NULL,
    "tripUUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "initiatorId" INTEGER NOT NULL,
    "intruderId" INTEGER NOT NULL,
    "tripId" INTEGER NOT NULL,
    "paidStatus" "DebtPayStatus" NOT NULL DEFAULT 'NOTPAID',

    CONSTRAINT "debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "debt_debtUUID_key" ON "debt"("debtUUID");

-- CreateIndex
CREATE UNIQUE INDEX "debt_tripId_key" ON "debt"("tripId");

-- AddForeignKey
ALTER TABLE "debt" ADD CONSTRAINT "debt_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt" ADD CONSTRAINT "debt_intruderId_fkey" FOREIGN KEY ("intruderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt" ADD CONSTRAINT "debt_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
