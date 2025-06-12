-- CreateEnum
CREATE TYPE "PlatformLogType" AS ENUM ('INCOME', 'OUTCOME', 'OWNER_PAYOUT', 'REFUND', 'ETC');

-- CreateTable
CREATE TABLE "platform_accounts" (
    "id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_payment_logs" (
    "id" TEXT NOT NULL,
    "platform_account_id" TEXT NOT NULL,
    "type" "PlatformLogType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rental_request_id" TEXT,
    "user_id" TEXT,
    "balanceBefore" INTEGER,
    "balanceAfter" INTEGER,

    CONSTRAINT "platform_payment_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform_payment_logs" ADD CONSTRAINT "platform_payment_logs_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payment_logs" ADD CONSTRAINT "platform_payment_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payment_logs" ADD CONSTRAINT "platform_payment_logs_platform_account_id_fkey" FOREIGN KEY ("platform_account_id") REFERENCES "platform_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
