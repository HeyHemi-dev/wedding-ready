CREATE TABLE "viewed_tiles" (
	"user_id" uuid NOT NULL,
	"tile_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "viewed_tiles_user_id_tile_id_pk" PRIMARY KEY("user_id","tile_id")
);
--> statement-breakpoint
ALTER TABLE "viewed_tiles" ADD CONSTRAINT "viewed_tiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewed_tiles" ADD CONSTRAINT "viewed_tiles_tile_id_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "viewed_tiles_user_viewed_at_idx" ON "viewed_tiles" USING btree ("user_id","viewed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "saved_tiles_user_is_saved_idx" ON "saved_tiles" USING btree ("user_id","is_saved");