-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "coordinates" DOUBLE PRECISION[];

-- CreateTable
CREATE TABLE "Geofence" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER,

    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeofenceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT NOT NULL,

    CONSTRAINT "GeofenceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceType_name_key" ON "GeofenceType"("name");

-- AddForeignKey
ALTER TABLE "Geofence" ADD CONSTRAINT "Geofence_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "GeofenceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
