ALTER TABLE "orders" ADD COLUMN "discount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "promo_code" text;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_user_pending_idx" ON "orders" USING btree ("user_id") WHERE "orders"."status" = 'pending_payment';