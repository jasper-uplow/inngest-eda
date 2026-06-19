CREATE TABLE "tbl_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" text NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"source_event_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_amount" numeric NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tbl_receipts_receipt_number_unique" UNIQUE("receipt_number"),
	CONSTRAINT "tbl_receipts_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE INDEX "receipts_payment_id_idx" ON "tbl_receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "receipts_order_id_idx" ON "tbl_receipts" USING btree ("order_id");