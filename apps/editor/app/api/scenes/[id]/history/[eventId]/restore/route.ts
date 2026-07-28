import { type NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { sceneEvents } from '@/lib/db/schema'
import { getSceneRole, canWrite } from '@/lib/permissions'
import { getSceneOperations } from '@/lib/scene-store-server'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string; eventId: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id, eventId } = await params
  const eventIdNum = Number(eventId)
  if (!Number.isInteger(eventIdNum) || eventIdNum <= 0) {
    return NextResponse.json({ error: 'invalid_event_id' }, { status: 400 })
  }

  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canWrite(role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const [event] = await db
    .select()
    .from(sceneEvents)
    .where(and(eq(sceneEvents.eventId, eventIdNum), eq(sceneEvents.sceneId, id)))

  if (!event) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let graph: unknown
  try {
    graph = JSON.parse(event.graphJson)
  } catch {
    return NextResponse.json({ error: 'invalid_graph' }, { status: 422 })
  }

  const operations = await getSceneOperations()
  const existing = await operations.loadStoredScene(id)
  if (!existing) return NextResponse.json({ error: 'scene_not_found' }, { status: 404 })

  await operations.saveScene({
    id,
    name: existing.name,
    projectId: existing.projectId,
    ownerId: existing.ownerId,
    graph: graph as never,
    thumbnailUrl: existing.thumbnailUrl,
    expectedVersion: existing.version,
  })

  await logAction({
    userId: session.id,
    action: 'scene.restore',
    resourceType: 'scene',
    resourceId: id,
    request,
  })

  return NextResponse.json({ ok: true })
}
