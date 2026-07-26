import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { customItems, orgMembers } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memberships = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(eq(orgMembers.userId, session.id))

  const orgIds = memberships.map((m) => m.orgId)

  const items = await db
    .select()
    .from(customItems)
    .where(
      orgIds.length > 0
        ? or(eq(customItems.uploadedBy, session.id), ...orgIds.map((oid) => eq(customItems.orgId, oid)))
        : eq(customItems.uploadedBy, session.id)
    )

  return NextResponse.json({ items })
}
