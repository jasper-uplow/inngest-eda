CREATE TABLE "tbl_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"event_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "event_name_idx" ON "tbl_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "tbl_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aggregate_id_idx" ON "tbl_events" USING btree ("event_id");
