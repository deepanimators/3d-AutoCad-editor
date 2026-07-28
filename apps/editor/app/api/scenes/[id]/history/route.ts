import { type NextRequest, NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { sceneEvents } from '@/lib/db/schema'
import { getSceneRole, canWrite } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canWrite(role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const entries = await db
    .select({
      eventId: sceneEvents.eventId,
      version: sceneEvents.version,
      kind: sceneEvents.kind,
      createdAt: sceneEvents.createdAt,
    })
    .from(sceneEvents)
    .where(eq(sceneEvents.sceneId, id))
    .orderBy(desc(sceneEvents.version))
    .limit(50)

  return NextResponse.json({ entries })
}
