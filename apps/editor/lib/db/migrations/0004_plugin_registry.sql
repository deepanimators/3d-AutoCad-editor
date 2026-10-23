-- Migration 0004: Plugin marketplace registry and ratings
CREATE TABLE IF NOT EXISTS "plugin_registry" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "long_description" text,
  "author_name" text NOT NULL,
  "author_url" text,
  "version" text NOT NULL,
  "manifest_url" text NOT NULL,
  "icon_url" text,
  "screenshot_urls" text NOT NULL DEFAULT '[]',
  "category" text NOT NULL DEFAULT 'other',
  "tags" text NOT NULL DEFAULT '[]',
  "status" text NOT NULL DEFAULT 'pending',
  "install_count" integer NOT NULL DEFAULT 0,
  "rating" real,
  "rating_count" integer NOT NULL DEFAULT 0,
  "min_plan" text NOT NULL DEFAULT 'free',
  "verified" boolean NOT NULL DEFAULT false,
  "featured" boolean NOT NULL DEFAULT false,
  "submitted_by" text,
  "approved_by" text,
  "approved_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "plugin_ratings" (
  "id" text PRIMARY KEY,
  "plugin_id" text NOT NULL REFERENCES "plugin_registry"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL,
  "review" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  UNIQUE ("plugin_id", "user_id")
);
