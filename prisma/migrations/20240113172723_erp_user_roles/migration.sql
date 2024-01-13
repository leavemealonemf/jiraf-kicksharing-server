-- CreateEnum
CREATE TYPE "ErpUserRoles" AS ENUM ('ADMIN', 'WORKER', 'FRANCHISE');

-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "role" "ErpUserRoles" NOT NULL DEFAULT 'WORKER';
