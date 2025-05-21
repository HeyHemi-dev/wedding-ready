-- Update empty or null display_names to use the handle value
UPDATE "user_details" 
SET "display_name" = "handle"
WHERE "display_name" IS NULL OR TRIM("display_name") = '';

-- Now make the column NOT NULL
ALTER TABLE "user_details" ALTER COLUMN "display_name" SET NOT NULL;