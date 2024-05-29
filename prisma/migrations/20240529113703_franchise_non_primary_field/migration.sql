-- DropForeignKey
ALTER TABLE "Scooter" DROP CONSTRAINT "Scooter_franchiseId_fkey";

-- AlterTable
ALTER TABLE "Scooter" ALTER COLUMN "franchiseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
