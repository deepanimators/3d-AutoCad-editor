import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { pluginRegistry, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [plugin] = await db.select().from(pluginRegistry).where(eq(pluginRegistry.id, id)).limit(1)
  if (!plugin || plugin.status !== 'approved') {
    return NextResponse.json({ error: 'Plugin not available' }, { status: 404 })
  }

  const prefs: string[] = JSON.parse(user.pluginPrefs ?? '[]')

  if (!prefs.includes(id)) {
    prefs.push(id)
    await db.update(users).set({ pluginPrefs: JSON.stringify(prefs) }).where(eq(users.id, user.id))
    await db.update(pluginRegistry).set({ installCount: sql`${pluginRegistry.installCount} + 1` }).where(eq(pluginRegistry.id, id))
  }

  return NextResponse.json({ installed: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const prefs: string[] = JSON.parse(user.pluginPrefs ?? '[]')
  const next = prefs.filter((p) => p !== id)

  await db.update(users).set({ pluginPrefs: JSON.stringify(next) }).where(eq(users.id, user.id))
  if (prefs.length !== next.length) {
    await db.update(pluginRegistry).set({ installCount: sql`greatest(${pluginRegistry.installCount} - 1, 0)` }).where(eq(pluginRegistry.id, id))
  }

  return NextResponse.json({ installed: false })
}
