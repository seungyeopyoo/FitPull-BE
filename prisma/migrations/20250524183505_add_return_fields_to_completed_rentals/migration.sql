-- CreateEnum
CREATE TYPE "ReturnMethod" AS ENUM ('DELIVERY', 'VISIT');

-- AlterTable
ALTER TABLE "completed_rentals" ADD COLUMN     "is_returned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "return_method" "ReturnMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "returned_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product_status_logs" ADD COLUMN     "completed_rental_id" TEXT;

-- AddForeignKey
ALTER TABLE "product_status_logs" ADD CONSTRAINT "product_status_logs_completed_rental_id_fkey" FOREIGN KEY ("completed_rental_id") REFERENCES "completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
