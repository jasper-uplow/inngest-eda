CREATE TABLE "tbl_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"product_id" uuid,
	"purchasedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "tbl_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_price" numeric NOT NULL,
	"quantity" integer NOT NULL,
	"createdAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "tbl_payments" ADD CONSTRAINT "tbl_payments_product_id_tbl_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tbl_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_id" ON "tbl_payments" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_name" ON "tbl_products" USING btree ("product_name");--> statement-breakpoint
CREATE INDEX "product_price" ON "tbl_products" USING btree ("product_price");--> statement-breakpoint
CREATE INDEX "quantity" ON "tbl_products" USING btree ("quantity");