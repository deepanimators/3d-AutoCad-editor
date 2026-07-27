import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase/admin'
import { upsertUser } from '@/lib/auth-server'

const SESSION_COOKIE = '__session'
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export const dynamic = 'force-dynamic'

// Run once per Lambda cold start — idempotent so safe to re-run on every cold start
let coldStartMigrationDone = false
async function ensureMigrations() {
  if (coldStartMigrationDone) return
  coldStartMigrationDone = true
  if (!process.env.DATABASE_URL) return
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "plugin_prefs" text DEFAULT '[]' NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_this_month" integer DEFAULT 0 NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "ai_generations_reset_at" timestamptz`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_this_month" integer DEFAULT 0 NOT NULL`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "vision_calls_reset_at" timestamptz`
    await sql`ALTER TABLE scenes ADD COLUMN IF NOT EXISTS "org_id" text`
  } catch (err) {
    console.error('[session] cold-start migration failed:', err)
  }
}

export async function POST(request: Request) {
  await ensureMigrations()

  let idToken: string | undefined
  try {
    const body = await request.json()
    idToken = body?.idToken
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!idToken) {
    return Response.json({ error: 'missing_token' }, { status: 400 })
  }

  const auth = getAdminAuth()
  let decoded: Awaited<ReturnType<typeof auth.verifyIdToken>>
  try {
    decoded = await auth.verifyIdToken(idToken, true)
  } catch (err) {
    console.error('[session] verifyIdToken failed:', err)
    return Response.json({ error: 'invalid_token' }, { status: 401 })
  }

  // Upsert user record in Neon on first sign-in
  try {
    await upsertUser({
      uid: decoded.uid,
      email: decoded.email ?? '',
      name: decoded.name ?? null,
      image: decoded.picture ?? null,
    })
  } catch (err) {
    console.error('[session] upsertUser failed:', err)
    return Response.json({ error: 'db_error' }, { status: 500 })
  }

  let sessionCookie: string
  try {
    sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })
  } catch (err) {
    console.error('[session] createSessionCookie failed:', err)
    return Response.json({ error: 'cookie_error' }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    maxAge: SESSION_DURATION_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return Response.json({ ok: true })
}
