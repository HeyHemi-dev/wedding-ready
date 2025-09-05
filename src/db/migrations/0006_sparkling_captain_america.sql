-- Delete tiles with null image_path since they are invalid
DELETE FROM "tiles" WHERE "image_path" IS NULL;

-- Set NOT NULL constraint on image_path column
ALTER TABLE "tiles" ALTER COLUMN "image_path" SET NOT NULL;