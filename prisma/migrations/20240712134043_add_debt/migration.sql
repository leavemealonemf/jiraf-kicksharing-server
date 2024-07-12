-- CreateTable
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "debtUUID" TEXT NOT NULL,
    "cause" TEXT NOT NULL DEFAULT 'Задолженность за поездку',
    "description" TEXT NOT NULL DEFAULT 'Поездка не оплачена частично или полностью',
    "tripUUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "initiatorId" INTEGER NOT NULL,
    "intruderId" INTEGER NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Debt_debtUUID_key" ON "Debt"("debtUUID");

-- CreateIndex
CREATE UNIQUE INDEX "Debt_tripId_key" ON "Debt"("tripId");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "Franchise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_intruderId_fkey" FOREIGN KEY ("intruderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
