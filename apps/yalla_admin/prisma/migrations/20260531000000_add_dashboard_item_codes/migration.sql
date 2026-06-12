ALTER TABLE "dashboard_items" ADD COLUMN "code" TEXT;

UPDATE "dashboard_items"
SET "code" = 'PRD-SEED-' || printf('%03d', rowid)
WHERE "code" IS NULL OR trim("code") = '';

CREATE UNIQUE INDEX "dashboard_items_code_key" ON "dashboard_items"("code");
