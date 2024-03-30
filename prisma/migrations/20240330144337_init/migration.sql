-- CreateTable
CREATE TABLE "ScooterSettings" (
    "id" SERIAL NOT NULL,
    "bookingScooterMeters" INTEGER NOT NULL DEFAULT 1500,
    "rentScooterMeters" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "ScooterSettings_pkey" PRIMARY KEY ("id")
);
