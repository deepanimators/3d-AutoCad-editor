import { type NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { organizations, orgMembers, scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug } = await params
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Must be org member or admin
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.userId, session.id)))
  if (!membership && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const orgScenes = await db
    .select({
      id: scenes.id,
      name: scenes.name,
      nodeCount: scenes.nodeCount,
      updatedAt: scenes.updatedAt,
      thumbnailUrl: scenes.thumbnailUrl,
      ownerId: scenes.ownerId,
    })
    .from(scenes)
    .where(eq(scenes.orgId, org.id))
    .orderBy(scenes.updatedAt)
    .limit(100)

  return NextResponse.json({ scenes: orgScenes })
}
