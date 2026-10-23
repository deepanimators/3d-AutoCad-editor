import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { pluginRegistry } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [plugin] = await db.select().from(pluginRegistry).where(eq(pluginRegistry.id, id)).limit(1)
  if (!plugin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ plugin })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { status, featured, verified } = body

  const [updated] = await db
    .update(pluginRegistry)
    .set({
      ...(status !== undefined ? { status, approvedBy: user.id, approvedAt: new Date().toISOString() } : {}),
      ...(featured !== undefined ? { featured } : {}),
      ...(verified !== undefined ? { verified } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(pluginRegistry.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ plugin: updated })
}
