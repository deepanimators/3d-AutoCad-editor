import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { organizations, orgMembers, orgInvitations, users } from '@/lib/db/schema'
import { AppShell } from '@/components/app-shell'
import { OrgDashboardClient } from './org-dashboard-client'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [org] = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.slug, slug))
  return { title: org?.name ?? 'Organization' }
}

export default async function OrgPage({ params }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { slug } = await params

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug))
  if (!org) redirect('/')

  const memberRows = await db
    .select({
      userId: orgMembers.userId,
      role: orgMembers.role,
      userName: users.name,
      userEmail: users.email,
      userPlan: users.plan,
    })
    .from(orgMembers)
    .leftJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, org.id))

  const isMember = session.role === 'admin' || memberRows.some(m => m.userId === session.id)
  if (!isMember) redirect('/')

  const currentMember = memberRows.find(m => m.userId === session.id)
  const currentUserOrgRole = session.role === 'admin' ? 'owner' : (currentMember?.role ?? 'member')

  const pendingInvites = await db
    .select()
    .from(orgInvitations)
    .where(eq(orgInvitations.orgId, org.id))
    .then(rows => rows.filter(r => r.status === 'pending'))

  const members = memberRows.map(m => ({
    userId: m.userId,
    role: m.role,
    user: { name: m.userName, email: m.userEmail, plan: m.userPlan },
  }))

  return (
    <AppShell>
      <OrgDashboardClient
        slug={slug}
        orgName={org.name}
        members={members}
        pendingInvites={pendingInvites}
        currentUserId={session.id}
        currentUserOrgRole={currentUserOrgRole}
      />
    </AppShell>
  )
}
