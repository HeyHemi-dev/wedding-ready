-- Add column as nullable first
ALTER TABLE "tiles" ADD COLUMN "image_ratio" real;

-- Set default value for existing rows (0.667 = 2/3 ratio)
-- Note: Existing rows should be backfilled with actual image ratios if needed
UPDATE "tiles" SET "image_ratio" = 0.667 WHERE "image_ratio" IS NULL;

-- Now set the column to NOT NULL
ALTER TABLE "tiles" ALTER COLUMN "image_ratio" SET NOT NULL;