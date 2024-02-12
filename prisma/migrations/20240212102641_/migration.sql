-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "inviterId" INTEGER;

-- AddForeignKey
ALTER TABLE "ErpUser" ADD CONSTRAINT "ErpUser_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "ErpUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
