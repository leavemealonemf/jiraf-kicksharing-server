/*
  Warnings:

  - You are about to drop the `ScooterSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ScooterSettings";

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "scooterSettings" JSONB NOT NULL DEFAULT '{ "metersToBooking": 1500, "metersToRent": 1000 }',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
