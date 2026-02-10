-- CreateTable
CREATE TABLE "shared_credit_cards" (
    "id" TEXT NOT NULL,
    "creditCardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shared_credit_cards_userId_idx" ON "shared_credit_cards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_credit_cards_creditCardId_userId_key" ON "shared_credit_cards"("creditCardId", "userId");

-- AddForeignKey
ALTER TABLE "shared_credit_cards" ADD CONSTRAINT "shared_credit_cards_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_credit_cards" ADD CONSTRAINT "shared_credit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
