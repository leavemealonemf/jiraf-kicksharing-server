/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Promocode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_PromocodeToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PromocodeToUser_AB_unique" ON "_PromocodeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PromocodeToUser_B_index" ON "_PromocodeToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Promocode_code_key" ON "Promocode"("code");

-- AddForeignKey
ALTER TABLE "_PromocodeToUser" ADD CONSTRAINT "_PromocodeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Promocode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromocodeToUser" ADD CONSTRAINT "_PromocodeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
