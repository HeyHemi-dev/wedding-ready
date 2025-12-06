ALTER TABLE "tiles" ADD COLUMN "score" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "tiles" ADD COLUMN "score_updated_at" timestamp DEFAULT now() NOT NULL;