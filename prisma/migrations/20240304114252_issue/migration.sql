/*
  Warnings:

  - You are about to drop the column `payFotStartTrip` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "payFotStartTrip",
ADD COLUMN     "payForStartTrip" BOOLEAN NOT NULL DEFAULT false;
