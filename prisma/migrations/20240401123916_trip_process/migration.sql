-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "startTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "travelTime" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;
