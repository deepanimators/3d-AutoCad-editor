import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { organizations, orgMembers, orgInvitations } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string }> }

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
})

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug } = await params

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const [callerMember] = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.userId, session.id)))

  const callerRole = session.role === 'admin' ? 'owner' : callerMember?.role
  if (callerRole !== 'owner' && callerRole !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request', details: 'body must be valid JSON' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await db.insert(orgInvitations).values({
    id: randomUUID(),
    orgId: org.id,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    invitedBy: session.id,
    expiresAt,
  })

  const inviteUrl = `/org/${slug}/invite/accept?token=${token}`
  return NextResponse.json({ inviteUrl }, { status: 201 })
}
