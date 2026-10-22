import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { scenes, sceneComments } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'
import { getSceneRole, canRead } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

const createCommentSchema = z.object({
  text: z.string().min(1).max(5000),
  nodeId: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  parentId: z.string().optional(),
})

async function resolveAccess(userId: string, isAdmin: boolean, sceneId: string) {
  if (isAdmin) return true
  const role = await getSceneRole(userId, sceneId)
  return canRead(role)
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const [scene] = await db.select({ id: scenes.id }).from(scenes).where(eq(scenes.id, id))
  if (!scene) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const allowed = await resolveAccess(session.id, session.role === 'admin', id)
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const comments = await db
    .select()
    .from(sceneComments)
    .where(eq(sceneComments.sceneId, id))
    .orderBy(asc(sceneComments.createdAt))

  return NextResponse.json(comments)
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const [scene] = await db.select({ id: scenes.id }).from(scenes).where(eq(scenes.id, id))
  if (!scene) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const allowed = await resolveAccess(session.id, session.role === 'admin', id)
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })

  const { text, nodeId, positionX, positionY, parentId } = parsed.data

  // Verify parentId belongs to same scene and is a root comment (not itself a reply)
  if (parentId) {
    const [parent] = await db
      .select({ id: sceneComments.id, parentId: sceneComments.parentId })
      .from(sceneComments)
      .where(eq(sceneComments.id, parentId))
    if (!parent || parent.parentId) {
      return NextResponse.json({ error: 'invalid_parent' }, { status: 400 })
    }
  }

  const [comment] = await db.insert(sceneComments).values({
    id: randomUUID(),
    sceneId: id,
    userId: session.id,
    text,
    nodeId,
    positionX,
    positionY,
    parentId,
  }).returning()

  return NextResponse.json(comment, { status: 201 })
}
