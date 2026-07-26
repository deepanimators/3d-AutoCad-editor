-- Migration 0001: Global model catalog
-- Apply with: cd apps/editor && bun run db:migrate

CREATE TABLE IF NOT EXISTS "global_models" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "source" text NOT NULL,
  "source_id" text,
  "source_url" text,
  "license" text NOT NULL,
  "attribution" text,
  "s3_key" text NOT NULL,
  "s3_thumbnail" text,
  "file_size_bytes" integer,
  "poly_count" integer,
  "tags" text NOT NULL DEFAULT '[]',
  "category" text,
  "added_at" timestamp DEFAULT now() NOT NULL,
  "added_by" text
);

CREATE INDEX IF NOT EXISTS "idx_global_models_added_at" ON "global_models"("added_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_global_models_category" ON "global_models"("category");
CREATE INDEX IF NOT EXISTS "idx_global_models_source" ON "global_models"("source");
