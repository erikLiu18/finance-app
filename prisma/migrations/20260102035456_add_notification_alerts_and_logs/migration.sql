/*
  Warnings:

  - You are about to drop the column `lastNotifiedAt` on the `credit_cards` table. All the data in the column will be lost.
  - You are about to drop the column `notifyDaysBefore` on the `credit_cards` table. All the data in the column will be lost.
  - You are about to drop the column `notifyHoursBefore` on the `credit_cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "credit_cards" DROP COLUMN "lastNotifiedAt",
DROP COLUMN "notifyDaysBefore",
DROP COLUMN "notifyHoursBefore";

-- CreateTable
CREATE TABLE "notification_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hoursBefore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "creditCardId" TEXT NOT NULL,
    "alertHoursBefore" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_alerts_userId_idx" ON "notification_alerts"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_creditCardId_idx" ON "notification_logs"("creditCardId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_logs_creditCardId_alertHoursBefore_dueDate_key" ON "notification_logs"("creditCardId", "alertHoursBefore", "dueDate");

-- AddForeignKey
ALTER TABLE "notification_alerts" ADD CONSTRAINT "notification_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
