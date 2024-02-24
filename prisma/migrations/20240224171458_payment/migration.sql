-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'SBP', 'SBERPAY');

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "paymentId" TEXT NOT NULL,
    "idempotenceKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "PaymentMethodType" NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
