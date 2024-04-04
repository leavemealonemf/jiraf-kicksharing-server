-- CreateTable
CREATE TABLE "active_trip" (
    "id" SERIAL NOT NULL,
    "tripUUID" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "active_trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_trip_tripUUID_key" ON "active_trip"("tripUUID");

-- AddForeignKey
ALTER TABLE "active_trip" ADD CONSTRAINT "active_trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
