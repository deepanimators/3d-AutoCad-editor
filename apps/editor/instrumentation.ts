export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.DATABASE_URL) return

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)

    // Idempotent column additions — safe to run on every cold start
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "plugin_prefs" text DEFAULT '[]' NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_this_month" integer DEFAULT 0 NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_reset_at" timestamptz`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_this_month" integer DEFAULT 0 NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_reset_at" timestamptz`
    await sql`ALTER TABLE scenes ADD COLUMN IF NOT EXISTS "org_id" text`
  } catch {
    // Non-fatal — app still boots, migrations can be applied manually
  }
}
