/*
  Warnings:

  - You are about to drop the `ai_recommend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ai_recommend" DROP CONSTRAINT "ai_recommend_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_recommend" DROP CONSTRAINT "ai_recommend_userId_fkey";

-- DropForeignKey
ALTER TABLE "ai_reviews" DROP CONSTRAINT "ai_reviews_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_reviews" DROP CONSTRAINT "ai_reviews_user_id_fkey";

-- DropTable
DROP TABLE "ai_recommend";

-- DropTable
DROP TABLE "ai_reviews";

-- CreateTable
CREATE TABLE "ai_price_estimations" (
    "id" TEXT NOT NULL,
    "estimated_price" INTEGER NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT false,
    "sources" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ai_price_estimations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_product_recommendations" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "recommended_products" TEXT[],
    "recommend_reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT,
    "userId" TEXT,

    CONSTRAINT "ai_product_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_review_summaries" (
    "id" TEXT NOT NULL,
    "summary_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "ai_review_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_review_summaries_product_id_key" ON "ai_review_summaries"("product_id");

-- AddForeignKey
ALTER TABLE "ai_price_estimations" ADD CONSTRAINT "ai_price_estimations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_price_estimations" ADD CONSTRAINT "ai_price_estimations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendations" ADD CONSTRAINT "ai_product_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendations" ADD CONSTRAINT "ai_product_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_review_summaries" ADD CONSTRAINT "ai_review_summaries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
