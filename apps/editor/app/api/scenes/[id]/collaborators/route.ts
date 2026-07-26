import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { scenes, sceneCollaborators } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'
import { canShareScene } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']).default('viewer'),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, id))
  if (!scene) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (scene.ownerId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const collabs = await db.select().from(sceneCollaborators).where(eq(sceneCollaborators.sceneId, id))
  return NextResponse.json(collabs)
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!canShareScene(session)) return NextResponse.json({ error: 'pro_required' }, { status: 403 })

  const { id } = await params

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, id))
  if (!scene) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (scene.ownerId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  const { email, role } = parsed.data

  try {
    const [collab] = await db.insert(sceneCollaborators).values({
      id: randomUUID(),
      sceneId: id,
      email,
      role,
    }).returning()
    return NextResponse.json(collab, { status: 201 })
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'already_invited' }, { status: 409 })
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, id))
  if (!scene) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (scene.ownerId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const collaboratorId = url.searchParams.get('collaboratorId')
  if (!collaboratorId) return NextResponse.json({ error: 'missing_collaborator_id' }, { status: 400 })

  await db.delete(sceneCollaborators).where(
    and(eq(sceneCollaborators.id, collaboratorId), eq(sceneCollaborators.sceneId, id))
  )
  return NextResponse.json({ ok: true })
}
