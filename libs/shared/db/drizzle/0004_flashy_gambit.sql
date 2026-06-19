CREATE TABLE "tbl_event_consumptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"consumer" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tbl_events" ADD COLUMN "redelivery_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_events" ADD COLUMN "last_reconciled_at" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "event_consumer_unique" ON "tbl_event_consumptions" USING btree ("event_id","consumer");--> statement-breakpoint
CREATE INDEX "event_consumptions_event_id_idx" ON "tbl_event_consumptions" USING btree ("event_id");
