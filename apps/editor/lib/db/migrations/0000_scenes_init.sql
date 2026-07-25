-- Migration 0000: Initial scenes table
-- Apply with: cd apps/editor && bun run db:migrate

CREATE TABLE IF NOT EXISTS "scenes" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "project_id" text,
  "owner_id" text,
  "graph_json" text NOT NULL,
  "thumbnail_url" text,
  "version" integer DEFAULT 1 NOT NULL,
  "size_bytes" integer DEFAULT 0 NOT NULL,
  "node_count" integer DEFAULT 0 NOT NULL,
  "graph_hash" text,
  "is_public" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
