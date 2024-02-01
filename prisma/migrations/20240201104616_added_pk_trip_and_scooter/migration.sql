-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "scooterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_scooterId_fkey" FOREIGN KEY ("scooterId") REFERENCES "Scooter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
