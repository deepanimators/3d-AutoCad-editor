import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { organizations, orgMembers, users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug } = await params

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const memberRows = await db
    .select({
      userId: orgMembers.userId,
      role: orgMembers.role,
      createdAt: orgMembers.createdAt,
      userName: users.name,
      userEmail: users.email,
      userPlan: users.plan,
    })
    .from(orgMembers)
    .leftJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, org.id))

  const isMember = session.role === 'admin' || memberRows.some(m => m.userId === session.id)
  if (!isMember) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const members = memberRows.map(m => ({
    userId: m.userId,
    role: m.role,
    createdAt: m.createdAt,
    user: { name: m.userName, email: m.userEmail, plan: m.userPlan },
  }))

  return NextResponse.json({ org, members })
}
