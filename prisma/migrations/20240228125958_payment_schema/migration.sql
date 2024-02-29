-- CreateEnum
CREATE TYPE "PaymentService" AS ENUM ('TRIP', 'SUBSCRIPTION', 'BALANCE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('WRITEOFF', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'CANCELED', 'CAPTURE');

-- AlterTable
ALTER TABLE "PaymentMethod" ALTER COLUMN "active" SET DEFAULT false;

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "service" "PaymentService" NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "description" TEXT,
    "paymentMethodId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
