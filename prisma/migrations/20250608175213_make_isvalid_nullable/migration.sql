-- AlterTable
ALTER TABLE "ai_price_estimations" ALTER COLUMN "is_valid" DROP NOT NULL,
ALTER COLUMN "is_valid" DROP DEFAULT;
