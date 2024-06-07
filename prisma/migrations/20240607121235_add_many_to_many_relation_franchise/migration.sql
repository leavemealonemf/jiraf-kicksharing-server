-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "franchiseEmployeeId" INTEGER;

-- AddForeignKey
ALTER TABLE "ErpUser" ADD CONSTRAINT "ErpUser_franchiseEmployeeId_fkey" FOREIGN KEY ("franchiseEmployeeId") REFERENCES "Franchise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
