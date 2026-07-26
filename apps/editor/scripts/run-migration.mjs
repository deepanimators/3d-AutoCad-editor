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

  // Sprint 3: Drop users.role enum constraint → allow custom roles
  await sql`ALTER TABLE users ALTER COLUMN role TYPE text USING role::text`
  // Remove old CHECK constraint if exists (idempotent via try/catch)
  try { await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check` } catch {}
  try { await sql`ALTER TABLE users ADD CONSTRAINT users_role_nonempty CHECK (length(role) > 0)` } catch {}
  console.log('✓ users.role enum constraint dropped, allows custom roles')

  // Sprint 1: Coupons table
  await sql`
    CREATE TABLE IF NOT EXISTS "coupons" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "code" text NOT NULL UNIQUE,
      "gateway" text NOT NULL CHECK (gateway IN ('stripe','razorpay','both')),
      "stripe_promo_code_id" text,
      "stripe_coupon_id" text,
      "razorpay_offer_id" text,
      "discount_type" text NOT NULL CHECK (discount_type IN ('percent','fixed')),
      "discount_value" integer NOT NULL,
      "duration" text NOT NULL CHECK (duration IN ('once','repeating','forever')),
      "duration_in_months" integer,
      "applies_to_plans" text NOT NULL,
      "original_price_cents" integer,
      "promo_price_cents" integer,
      "max_redemptions" integer,
      "redemption_count" integer DEFAULT 0 NOT NULL,
      "active" boolean DEFAULT true NOT NULL,
      "expires_at" timestamptz,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  console.log('✓ coupons table ready')

  // Sprint 2: Plan config table + seed
  await sql`
    CREATE TABLE IF NOT EXISTS "plan_config" (
      "id" text PRIMARY KEY NOT NULL,
      "plan_key" text NOT NULL UNIQUE CHECK (plan_key IN ('free','pro','team')),
      "display_name" text NOT NULL,
      "display_price_cents" integer NOT NULL,
      "currency" text DEFAULT 'usd' NOT NULL,
      "price_suffix" text DEFAULT '/month' NOT NULL,
      "stripe_price_id" text,
      "stripe_yearly_price_id" text,
      "razorpay_plan_id" text,
      "razorpay_yearly_plan_id" text,
      "features" text NOT NULL,
      "highlight" boolean DEFAULT false NOT NULL,
      "active" boolean DEFAULT true NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  // Seed default plan config (idempotent)
  await sql`
    INSERT INTO plan_config (id, plan_key, display_name, display_price_cents, currency, price_suffix, features, highlight, active, updated_at)
    VALUES
      ('plan_free', 'free', 'Free', 0, 'usd', 'forever', '["Up to 5 scenes","JSON export","Community support","Basic 3D editor"]', false, true, now()),
      ('plan_pro', 'pro', 'Pro', 2900, 'usd', '/month', '["Unlimited scenes","GLB & JSON export","MCP server access","Priority support","14-day free trial"]', true, true, now()),
      ('plan_team', 'team', 'Team', 7900, 'usd', '/seat/month', '["Everything in Pro","IFC export","Real-time collaboration","SSO / SAML","Audit log","14-day free trial"]', false, true, now())
    ON CONFLICT (plan_key) DO NOTHING
  `
  console.log('✓ plan_config table ready + seeded')

  // Sprint 3: Roles table + seed system roles
  await sql`
    CREATE TABLE IF NOT EXISTS "roles" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL UNIQUE,
      "description" text NOT NULL,
      "permissions" text NOT NULL,
      "is_system" boolean DEFAULT false NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `
  await sql`
    INSERT INTO roles (id, name, description, permissions, is_system, created_at)
    VALUES
      ('role_user', 'user', 'Standard access. Features gated by subscription plan.', '[]', true, now()),
      ('role_admin', 'admin', 'Full platform access. All features unlocked.', '["all"]', true, now())
    ON CONFLICT (name) DO NOTHING
  `
  console.log('✓ roles table ready + seeded')

  const u = await sql`SELECT COUNT(*) as count FROM users`
  const s = await sql`SELECT COUNT(*) as count FROM scenes`
  console.log(`✓ done — ${u[0].count} users, ${s[0].count} scenes`)
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
}
