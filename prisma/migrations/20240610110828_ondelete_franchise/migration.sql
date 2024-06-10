-- DropForeignKey
ALTER TABLE "Franchise" DROP CONSTRAINT "Franchise_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Franchise" ADD CONSTRAINT "Franchise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ErpUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
