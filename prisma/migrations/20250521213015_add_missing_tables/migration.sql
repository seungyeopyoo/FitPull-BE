/*
  Warnings:

  - The values [KAKAO,GOOGLE] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rental_request_id` on the `completed_rentals` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rental_requests_id]` on the table `completed_rentals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rental_requests_id` to the `completed_rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `category_id` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `how_to_receive` to the `rental_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `rental_requests` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `rental_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ON_RENTING');

-- CreateEnum
CREATE TYPE "ReceiveMethod" AS ENUM ('DIRECT', 'PARCEL');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENTAL_PAYMENT', 'STORAGE_FEE', 'DAMAGE_COMPENSATION', 'OWNER_PAYOUT', 'REFUND', 'ETC');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'APPROVAL', 'RENTAL_STATUS', 'CHAT', 'FEE', 'REVIEW', 'ETC');

-- CreateEnum
CREATE TYPE "ProductLogType" AS ENUM ('PRE_RENTAL', 'ON_RENTAL', 'DAMAGE_REPORTED', 'WITHDRAWN', 'STORAGE_FEE_NOTICE', 'ETC');

-- AlterEnum
BEGIN;
CREATE TYPE "Provider_new" AS ENUM ('LOCAL', 'kakao', 'google');
ALTER TABLE "accounts" ALTER COLUMN "provider" TYPE "Provider_new" USING ("provider"::text::"Provider_new");
ALTER TYPE "Provider" RENAME TO "Provider_old";
ALTER TYPE "Provider_new" RENAME TO "Provider";
DROP TYPE "Provider_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "completed_rentals" DROP CONSTRAINT "completed_rentals_rental_request_id_fkey";

-- DropForeignKey
ALTER TABLE "completed_rentals" DROP CONSTRAINT "completed_rentals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "rental_requests" DROP CONSTRAINT "rental_requests_user_id_fkey";

-- DropIndex
DROP INDEX "accounts_email_key";

-- DropIndex
DROP INDEX "completed_rentals_rental_request_id_key";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "provider_id" TEXT,
ADD COLUMN     "refresh_token" TEXT;

-- AlterTable
ALTER TABLE "completed_rentals" DROP COLUMN "rental_request_id",
ADD COLUMN     "rental_requests_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "owner_id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "how_to_receive" "ReceiveMethod" NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "total_price" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL;

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "RentalStatus";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "verifiedPhone" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "bankAccount" TEXT,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "verifiedBankAccount" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rental_requests_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "product_id" TEXT,
    "rental_requests_id" TEXT,
    "review_id" TEXT,
    "messages_id" TEXT,
    "product_status_logs_id" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "completed_rental_id" TEXT NOT NULL,
    "products_id" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "products_id" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_status_logs" (
    "id" TEXT NOT NULL,
    "type" "ProductLogType" NOT NULL,
    "photo_urls" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "product_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reviews" (
    "id" TEXT NOT NULL,
    "estimated_price" INTEGER NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT false,
    "sources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommend" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "recommended_products" TEXT[],
    "recommend_reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ai_recommend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discount_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_items" (
    "package_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "package_items_pkey" PRIMARY KEY ("package_id","product_id")
);

-- CreateTable
CREATE TABLE "influencer_promos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "influencer_promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_completed_rental_id_key" ON "reviews"("completed_rental_id");

-- CreateIndex
CREATE UNIQUE INDEX "completed_rentals_rental_requests_id_key" ON "completed_rentals"("rental_requests_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_rentals" ADD CONSTRAINT "completed_rentals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_rentals" ADD CONSTRAINT "completed_rentals_rental_requests_id_fkey" FOREIGN KEY ("rental_requests_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_rental_requests_id_fkey" FOREIGN KEY ("rental_requests_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rental_requests_id_fkey" FOREIGN KEY ("rental_requests_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_messages_id_fkey" FOREIGN KEY ("messages_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_product_status_logs_id_fkey" FOREIGN KEY ("product_status_logs_id") REFERENCES "product_status_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_completed_rental_id_fkey" FOREIGN KEY ("completed_rental_id") REFERENCES "completed_rentals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_status_logs" ADD CONSTRAINT "product_status_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_status_logs" ADD CONSTRAINT "product_status_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommend" ADD CONSTRAINT "ai_recommend_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommend" ADD CONSTRAINT "ai_recommend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_promos" ADD CONSTRAINT "influencer_promos_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_promos" ADD CONSTRAINT "influencer_promos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
