CREATE TABLE "tbl_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"source_event_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_amount" numeric NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "tbl_orders_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE INDEX "orders_payment_id_idx" ON "tbl_orders" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "tbl_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_customer_name_idx" ON "tbl_orders" USING btree ("customer_name");
