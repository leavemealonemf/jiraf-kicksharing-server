/*
  Warnings:

  - Added the required column `days` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "days" INTEGER NOT NULL,
ADD COLUMN     "payFotStartTrip" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserSubscriptionsOptions" (
    "id" SERIAL NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expDate" TIMESTAMP(3) NOT NULL,
    "autoPayment" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserSubscriptionsOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscriptionsOptions_userId_key" ON "UserSubscriptionsOptions"("userId");

-- AddForeignKey
ALTER TABLE "UserSubscriptionsOptions" ADD CONSTRAINT "UserSubscriptionsOptions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscriptionsOptions" ADD CONSTRAINT "UserSubscriptionsOptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
