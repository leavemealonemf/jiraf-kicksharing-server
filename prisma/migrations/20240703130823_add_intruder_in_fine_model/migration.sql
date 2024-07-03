/*
  Warnings:

  - Added the required column `intruderId` to the `fine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fine" ADD COLUMN     "intruderId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "fine" ADD CONSTRAINT "fine_intruderId_fkey" FOREIGN KEY ("intruderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
