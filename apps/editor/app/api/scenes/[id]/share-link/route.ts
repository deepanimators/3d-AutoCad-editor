import { generateShareToken } from '@/lib/share-token'
import { canShareScene } from '@/lib/feature-gates'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if (!canShareScene(session)) return Response.json({ error: 'pro_required', upgrade: '/pricing' }, { status: 403 })

  const { id } = await params
  const [scene] = await db.select({ ownerId: scenes.ownerId }).from(scenes).where(eq(scenes.id, id))
  if (!scene) return Response.json({ error: 'not_found' }, { status: 404 })
  if (scene.ownerId !== session.id && session.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const ttl = 7 * 24 * 60 * 60 // 7 days
  const token = generateShareToken(id, ttl)
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'
  return Response.json({ url: `${appUrl}/scene/${id}?shareToken=${token}`, expiresAt })
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const [scene] = await db.select({ ownerId: scenes.ownerId, isPublic: scenes.isPublic }).from(scenes).where(eq(scenes.id, id))
  if (!scene) return Response.json({ error: 'not_found' }, { status: 404 })

  const isOwner = scene.ownerId === session.id || session.role === 'admin'
  return Response.json({ isOwner, isPublic: scene.isPublic, canShare: canShareScene(session) })
}
