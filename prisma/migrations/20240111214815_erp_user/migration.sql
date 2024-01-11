/*
  Warnings:

  - Added the required column `password` to the `ErpUser` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `ErpUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
