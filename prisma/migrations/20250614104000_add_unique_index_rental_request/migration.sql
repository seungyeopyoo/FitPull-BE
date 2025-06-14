CREATE UNIQUE INDEX rental_request_unique_active
ON "rental_requests" ("user_id", "product_id", "start_date", "end_date")
WHERE status IN ('PENDING', 'APPROVED');