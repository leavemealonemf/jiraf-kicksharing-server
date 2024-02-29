-- CreateEnum
CREATE TYPE "UserPlatform" AS ENUM ('WEB', 'MOBILE');

-- AlterTable
ALTER TABLE "ErpUser" ADD COLUMN     "platform" "UserPlatform" NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platform" "UserPlatform" NOT NULL DEFAULT 'MOBILE';
