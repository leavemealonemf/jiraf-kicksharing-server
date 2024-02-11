-- CreateTable
CREATE TABLE "forgot-password" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot-password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot-password_userId_key" ON "forgot-password"("userId");

-- AddForeignKey
ALTER TABLE "forgot-password" ADD CONSTRAINT "forgot-password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ErpUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
