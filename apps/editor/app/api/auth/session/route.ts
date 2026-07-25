import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'
import { upsertUser } from '@/lib/auth-server'

const SESSION_COOKIE = '__session'
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export async function POST(request: Request) {
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

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true)
  } catch (err) {
    console.error('[session] verifyIdToken failed:', err)
    return Response.json({ error: 'invalid_token' }, { status: 401 })
  }

  // Upsert user record in Neon on first sign-in
  await upsertUser({
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name ?? null,
    image: decoded.picture ?? null,
  })

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  })

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
