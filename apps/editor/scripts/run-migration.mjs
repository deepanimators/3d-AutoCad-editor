/**
 * One-shot migration script. Uses @neondatabase/serverless directly.
 * Bypasses drizzle-kit (which needs postgres package incompatible with workspace install).
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

  const rows = await sql`SELECT COUNT(*) as count FROM scenes`
  console.log('✓ verified — ' + rows[0].count + ' rows in table')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
}
