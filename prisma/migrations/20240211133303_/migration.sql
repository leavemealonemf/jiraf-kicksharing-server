/*
  Warnings:

  - Added the required column `expiredTime` to the `forgot-password` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forgot-password" ADD COLUMN     "expiredTime" TIMESTAMP(3) NOT NULL;
