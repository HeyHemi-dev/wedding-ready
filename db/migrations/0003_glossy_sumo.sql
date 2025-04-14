ALTER TABLE "public"."supplier_locations" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."tiles" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint

-- Fix typo: taranakai -> taranaki
UPDATE "public"."supplier_locations" SET "location" = 'taranaki' WHERE "location" = 'taranakai';--> statement-breakpoint
UPDATE "public"."tiles" SET "location" = 'taranaki' WHERE "location" = 'taranakai';--> statement-breakpoint

DROP TYPE "public"."locations";--> statement-breakpoint
CREATE TYPE "public"."locations" AS ENUM('northland', 'auckland', 'waikato', 'bay_of_plenty', 'gisborne', 'hawkes_bay', 'taranaki', 'manawatu_whanganui', 'wellington', 'nelson_tasman', 'marlborough', 'west_coast', 'canterbury', 'otago', 'southland');--> statement-breakpoint

ALTER TABLE "public"."supplier_locations" ALTER COLUMN "location" SET DATA TYPE "public"."locations" USING "location"::"public"."locations";--> statement-breakpoint
ALTER TABLE "public"."tiles" ALTER COLUMN "location" SET DATA TYPE "public"."locations" USING "location"::"public"."locations";