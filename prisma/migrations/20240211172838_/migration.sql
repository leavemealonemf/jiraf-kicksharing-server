-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "phone" DROP NOT NULL;
