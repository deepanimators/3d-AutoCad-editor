import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { customItems, orgMembers } from '@/lib/db/schema'
import { canUploadCustomItems } from '@/lib/feature-gates'
import { AppShell } from '@/components/app-shell'
import { eq, or } from 'drizzle-orm'
import { ItemsClient } from './items-client'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/items')

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

  const canUpload = canUploadCustomItems(session)

  return (
    <AppShell>
      <ItemsClient initialItems={items} canUpload={canUpload} />
    </AppShell>
  )
}
