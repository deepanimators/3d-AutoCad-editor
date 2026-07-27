import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { getAdminAuth } from './firebase/admin'
import { db } from './db/client'
import { users, type UserRow } from './db/schema'

const SESSION_COOKIE = '__session'

export type AppUser = UserRow

export async function getSession(): Promise<AppUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true)
    const [user] = await db.select().from(users).where(eq(users.id, decoded.uid))
    return user ?? null
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<{ uid: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true)
    return { uid: decoded.uid }
  } catch {
    return null
  }
}

export async function requireSession(): Promise<AppUser> {
  const user = await getSession()
  if (!user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  return user
}

export async function upsertUser(params: {
  uid: string
  email: string
  name?: string | null
  image?: string | null
}): Promise<AppUser> {
  const [existing] = await db.select().from(users).where(eq(users.id, params.uid))
  if (existing) return existing

  const [created] = await db
    .insert(users)
    .values({
      id: params.uid,
      email: params.email,
      name: params.name || params.email.split('@')[0]!,
      image: params.image ?? null,
      plan: 'free',
      role: 'user',
      // Default-enable the free catalog plugins so new users see external search results
      pluginPrefs: JSON.stringify(['aruct:plugin-polyhaven', 'aruct:plugin-polypizza']),
    })
    .returning()

  return created!
}
