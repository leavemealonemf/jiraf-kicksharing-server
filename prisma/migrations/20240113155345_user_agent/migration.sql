/*
  Warnings:

  - Made the column `user_agent` on table `tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tokens" ALTER COLUMN "user_agent" SET NOT NULL;
