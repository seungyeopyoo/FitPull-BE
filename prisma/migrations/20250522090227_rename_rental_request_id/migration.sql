/*
  Warnings:

  - You are about to drop the column `rental_requests_id` on the `completed_rentals` table. All the data in the column will be lost.
  - You are about to drop the column `rental_requests_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `rental_requests_id` on the `payment_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rental_request_id]` on the table `completed_rentals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rental_request_id` to the `completed_rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rental_request_id` to the `payment_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "completed_rentals" DROP CONSTRAINT "completed_rentals_rental_requests_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_rental_requests_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_logs" DROP CONSTRAINT "payment_logs_rental_requests_id_fkey";

-- DropIndex
DROP INDEX "completed_rentals_rental_requests_id_key";

-- AlterTable
ALTER TABLE "completed_rentals" DROP COLUMN "rental_requests_id",
ADD COLUMN     "rental_request_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "rental_requests_id",
ADD COLUMN     "rental_request_id" TEXT;

-- AlterTable
ALTER TABLE "payment_logs" DROP COLUMN "rental_requests_id",
ADD COLUMN     "rental_request_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "completed_rentals_rental_request_id_key" ON "completed_rentals"("rental_request_id");

-- AddForeignKey
ALTER TABLE "completed_rentals" ADD CONSTRAINT "completed_rentals_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
