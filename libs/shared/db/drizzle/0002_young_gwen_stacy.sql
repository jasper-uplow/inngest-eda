ALTER TABLE "tbl_payments" DROP CONSTRAINT "tbl_payments_product_id_tbl_products_id_fk";--> statement-breakpoint
ALTER TABLE "tbl_payments" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_payments" ADD CONSTRAINT "tbl_payments_product_id_tbl_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tbl_products"("id") ON DELETE restrict ON UPDATE no action;
