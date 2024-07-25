-- AlterTable
ALTER TABLE "GeofenceType" ADD COLUMN     "franchiseId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "GeofenceType" ADD CONSTRAINT "GeofenceType_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
