import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { organizations, orgMembers } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string; userId: string }> }

const patchSchema = z.object({
  role: z.enum(['admin', 'member']),
})

async function resolveCallerRole(
  sessionRole: string,
  orgId: string,
  callerId: string,
): Promise<'owner' | 'admin' | 'member' | null> {
  if (sessionRole === 'admin') return 'owner'
  const [row] = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, callerId)))
  return (row?.role as 'owner' | 'admin' | 'member') ?? null
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug, userId } = await params

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const callerRole = await resolveCallerRole(session.role, org.id, session.id)
  if (callerRole !== 'owner') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  if (userId === org.ownerId) {
    return NextResponse.json({ error: 'cannot_remove_owner' }, { status: 400 })
  }

  const result = await db
    .delete(orgMembers)
    .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.userId, userId)))
    .returning({ id: orgMembers.id })

  if (result.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug, userId } = await params

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const callerRole = await resolveCallerRole(session.role, org.id, session.id)
  if (callerRole !== 'owner') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  if (userId === org.ownerId) {
    return NextResponse.json({ error: 'cannot_change_owner_role' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request', details: 'body must be valid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })
  }

  const [updated] = await db
    .update(orgMembers)
    .set({ role: parsed.data.role })
    .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.userId, userId)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(updated)
}
