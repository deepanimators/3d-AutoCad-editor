-- Migration 0003: Add plugin preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "plugin_prefs" text DEFAULT '[]' NOT NULL;
