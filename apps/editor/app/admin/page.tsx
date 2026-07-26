import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'admin') redirect('/')

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    plan: users.plan,
    role: users.role,
    subscriptionStatus: users.subscriptionStatus,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt))

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground text-sm">{allUsers.length} total users</p>
          </div>
          <p className="text-muted-foreground text-xs">Click Plan, Status, or Role to edit inline</p>
        </div>
        <AdminClient users={allUsers} />
      </div>
    </AppShell>
  )
}
