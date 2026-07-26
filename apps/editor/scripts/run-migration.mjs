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
      "razorpay_customer_id" text,
      "razorpay_subscription_id" text,
      "payment_gateway" text CHECK (payment_gateway IN ('stripe','razorpay')),
      "subscription_status" text,
      "plan_expires_at" timestamptz,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "razorpay_customer_id" text`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "razorpay_subscription_id" text`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "payment_gateway" text CHECK (payment_gateway IN ('stripe','razorpay'))`
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
      "show_scans_public" boolean DEFAULT true NOT NULL,
      "show_guides_public" boolean DEFAULT true NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  await sql`ALTER TABLE scenes ADD COLUMN IF NOT EXISTS "show_scans_public" boolean DEFAULT true NOT NULL`
  await sql`ALTER TABLE scenes ADD COLUMN IF NOT EXISTS "show_guides_public" boolean DEFAULT true NOT NULL`
  await sql`ALTER TABLE scenes ADD COLUMN IF NOT EXISTS "org_id" text`
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

  await sql`
    CREATE TABLE IF NOT EXISTS "organizations" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "logo_url" text,
      "owner_id" text NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ organizations table ready')

  await sql`
    CREATE TABLE IF NOT EXISTS "org_members" (
      "id" text PRIMARY KEY NOT NULL,
      "org_id" text NOT NULL,
      "user_id" text NOT NULL,
      "role" text DEFAULT 'member' NOT NULL CHECK (role IN ('owner','admin','member')),
      "created_at" timestamptz DEFAULT now() NOT NULL,
      UNIQUE ("org_id", "user_id")
    )
  `
  console.log('✓ org_members table ready')

  await sql`
    CREATE TABLE IF NOT EXISTS "org_invitations" (
      "id" text PRIMARY KEY NOT NULL,
      "org_id" text NOT NULL,
      "email" text NOT NULL,
      "role" text DEFAULT 'member' NOT NULL CHECK (role IN ('admin','member')),
      "token" text NOT NULL UNIQUE,
      "status" text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending','accepted','expired')),
      "invited_by" text NOT NULL,
      "expires_at" timestamptz NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ org_invitations table ready')

  const u = await sql`SELECT COUNT(*) as count FROM users`
  const s = await sql`SELECT COUNT(*) as count FROM scenes`
  console.log(`✓ done — ${u[0].count} users, ${s[0].count} scenes`)
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
}
