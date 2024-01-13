-- DropForeignKey
ALTER TABLE "Franchise" DROP CONSTRAINT "Franchise_erpUserId_fkey";

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_erpUserId_fkey" FOREIGN KEY ("erpUserId") REFERENCES "ErpUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
