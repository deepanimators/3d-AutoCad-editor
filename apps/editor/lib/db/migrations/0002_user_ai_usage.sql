-- Migration 0002: Add AI usage tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_this_month" integer DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_reset_at" timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_this_month" integer DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_reset_at" timestamptz;
