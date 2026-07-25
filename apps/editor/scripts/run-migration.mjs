/**
 * One-shot migration script. Uses @neondatabase/serverless directly.
 * Run: node scripts/run-migration.mjs  (with DATABASE_URL in env)
 */
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)
console.log('Connecting to Neon...')

try {
  await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" text PRIMARY KEY NOT NULL,
      "email" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "image" text,
      "plan" text DEFAULT 'free' NOT NULL CHECK (plan IN ('free','pro','team')),
      "role" text DEFAULT 'user' NOT NULL CHECK (role IN ('user','admin')),
      "stripe_customer_id" text UNIQUE,
      "stripe_subscription_id" text,
      "subscription_status" text,
      "plan_expires_at" timestamptz,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ users table ready')

  await sql`
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
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ scenes table ready')

  await sql`
    CREATE TABLE IF NOT EXISTS "scene_collaborators" (
      "id" text PRIMARY KEY NOT NULL,
      "scene_id" text NOT NULL,
      "user_id" text,
      "email" text,
      "role" text NOT NULL CHECK (role IN ('editor','viewer')),
      "invited_at" timestamptz DEFAULT now() NOT NULL,
      "accepted_at" timestamptz,
      UNIQUE ("scene_id", "user_id")
    )
  `
  console.log('✓ scene_collaborators table ready')

  await sql`
    CREATE TABLE IF NOT EXISTS "audit_log" (
      "id" text PRIMARY KEY NOT NULL,
      "org_id" text,
      "user_id" text,
      "action" text NOT NULL,
      "resource_type" text,
      "resource_id" text,
      "metadata" text,
      "ip_address" text,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ audit_log table ready')

  const u = await sql`SELECT COUNT(*) as count FROM users`
  const s = await sql`SELECT COUNT(*) as count FROM scenes`
  console.log(`✓ done — ${u[0].count} users, ${s[0].count} scenes`)
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
}
