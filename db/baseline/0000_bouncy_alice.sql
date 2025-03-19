-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TYPE "public"."locations" AS ENUM('northland', 'auckland', 'waikato', 'bay_of_plenty', 'gisborne', 'hawkes_bay', 'taranakai', 'manawatu_whanganui', 'wellington', 'nelson_tasman', 'marlborough', 'west_coast', 'canterbury', 'otago', 'southland');--> statement-breakpoint
CREATE TYPE "public"."services" AS ENUM('venue', 'accomodation', 'caterer', 'cake', 'photographer', 'videographer', 'bridal_wear', 'bridesmaids_wear', 'bridal_accessory', 'menswear', 'menswear_accessory', 'rings', 'makeup', 'hair', 'beauty', 'planner', 'celebrant', 'mc', 'florist', 'stylist', 'hire', 'stationery', 'band', 'entertainment', 'transport', 'support');--> statement-breakpoint
CREATE TYPE "public"."supplier_roles" AS ENUM('admin', 'standard');--> statement-breakpoint
CREATE TABLE "tiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_path" text,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"location" "locations",
	CONSTRAINT "tiles_image_path_unique" UNIQUE("image_path")
);
--> statement-breakpoint
CREATE TABLE "user_details" (
	"id" uuid PRIMARY KEY NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"handle" text NOT NULL,
	CONSTRAINT "user_details_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owned_by_user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"website_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"handle" text NOT NULL,
	"handle_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "supplier_services" (
	"supplier_id" uuid NOT NULL,
	"service" "services" NOT NULL,
	CONSTRAINT "supplier_services_supplier_id_service_pk" PRIMARY KEY("supplier_id","service")
);
--> statement-breakpoint
CREATE TABLE "stack_tiles" (
	"stack_id" uuid NOT NULL,
	"tile_id" uuid NOT NULL,
	CONSTRAINT "stack_tiles_stack_id_tile_id_pk" PRIMARY KEY("stack_id","tile_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_locations" (
	"supplier_id" uuid NOT NULL,
	"location" "locations" NOT NULL,
	CONSTRAINT "supplier_locations_supplier_id_location_pk" PRIMARY KEY("supplier_id","location")
);
--> statement-breakpoint
CREATE TABLE "saved_tiles" (
	"user_id" uuid NOT NULL,
	"tile_id" uuid NOT NULL,
	"is_saved" boolean NOT NULL,
	CONSTRAINT "saved_tiles_user_id_tile_id_pk" PRIMARY KEY("user_id","tile_id")
);
--> statement-breakpoint
CREATE TABLE "tile_suppliers" (
	"tile_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"service" "services",
	"service_description" text,
	CONSTRAINT "tile_suppliers_tile_id_supplier_id_pk" PRIMARY KEY("tile_id","supplier_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_users" (
	"supplier_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "supplier_roles" DEFAULT 'standard' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_users_supplier_id_user_id_pk" PRIMARY KEY("supplier_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "tiles" ADD CONSTRAINT "tiles_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_owned_by_user_id_users_id_fk" FOREIGN KEY ("owned_by_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_services" ADD CONSTRAINT "supplier_services_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stack_tiles" ADD CONSTRAINT "stack_tiles_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stack_tiles" ADD CONSTRAINT "stack_tiles_tile_id_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_locations" ADD CONSTRAINT "supplier_locations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_tiles" ADD CONSTRAINT "saved_tiles_tile_id_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_tiles" ADD CONSTRAINT "saved_tiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tile_suppliers" ADD CONSTRAINT "tile_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tile_suppliers" ADD CONSTRAINT "tile_suppliers_tile_id_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_users" ADD CONSTRAINT "supplier_users_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_users" ADD CONSTRAINT "supplier_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
