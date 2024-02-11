/*
  Warnings:

  - The values [WORKER,FRANCHISE] on the enum `ErpUserRoles` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ErpUserRoles_new" AS ENUM ('ADMIN', 'MANAGER', 'TECHNICIAN');
ALTER TABLE "ErpUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "ErpUser" ALTER COLUMN "role" TYPE "ErpUserRoles_new" USING ("role"::text::"ErpUserRoles_new");
ALTER TYPE "ErpUserRoles" RENAME TO "ErpUserRoles_old";
ALTER TYPE "ErpUserRoles_new" RENAME TO "ErpUserRoles";
DROP TYPE "ErpUserRoles_old";
ALTER TABLE "ErpUser" ALTER COLUMN "role" SET DEFAULT 'MANAGER';
COMMIT;

-- AlterTable
ALTER TABLE "ErpUser" ALTER COLUMN "role" SET DEFAULT 'MANAGER';
