import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { organizations, orgMembers, orgInvitations } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

const acceptSchema = z.object({
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request', details: 'body must be valid JSON' }, { status: 400 })
  }

  const parsed = acceptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })
  }

  const [invite] = await db
    .select()
    .from(orgInvitations)
    .where(and(eq(orgInvitations.token, parsed.data.token), eq(orgInvitations.status, 'pending')))

  if (!invite) return NextResponse.json({ error: 'invalid_token' }, { status: 400 })

  if (new Date(invite.expiresAt) < new Date()) {
    await db
      .update(orgInvitations)
      .set({ status: 'expired' })
      .where(eq(orgInvitations.id, invite.id))
    return NextResponse.json({ error: 'token_expired' }, { status: 400 })
  }

  const [org] = await db.select({ slug: organizations.slug }).from(organizations).where(eq(organizations.id, invite.orgId))
  if (!org) return NextResponse.json({ error: 'org_not_found' }, { status: 400 })

  await db.insert(orgMembers).values({
    id: randomUUID(),
    orgId: invite.orgId,
    userId: session.id,
    role: invite.role,
  }).onConflictDoNothing()

  await db
    .update(orgInvitations)
    .set({ status: 'accepted' })
    .where(eq(orgInvitations.id, invite.id))

  return NextResponse.json({ orgSlug: org.slug })
}
