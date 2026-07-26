import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { organizations, orgMembers } from '@/lib/db/schema'
import { AppShell } from '@/components/app-shell'
import { OrgListClient } from './org-list-client'

export const dynamic = 'force-dynamic'

export default async function OrgListPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/org')

  const rows = await db
    .select({ org: organizations, role: orgMembers.role })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
    .where(eq(orgMembers.userId, session.id))

  const orgs = rows.map((r) => ({ ...r.org, memberRole: r.role }))

  return (
    <AppShell>
      <OrgListClient
        orgs={orgs}
        canCreate={session.plan === 'team' || session.role === 'admin'}
      />
    </AppShell>
  )
}
