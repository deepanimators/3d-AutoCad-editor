import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, roles, planConfig } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { AdminClient } from './admin-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'admin') redirect('/')

  const [allUsers, allRoles, allPlans] = await Promise.all([
    db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      plan: users.plan,
      role: users.role,
      subscriptionStatus: users.subscriptionStatus,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)),
    db.select({ name: roles.name }).from(roles),
    db.select({ planKey: planConfig.planKey }).from(planConfig).where(eq(planConfig.active, true)),
  ])

  const availableRoles = allRoles.map((r) => r.name)
  const availablePlans = allPlans.map((p) => p.planKey)

  // Fallback to standard values if DB not yet seeded
  const roleList = availableRoles.length > 0 ? availableRoles : ['user', 'admin']
  const planList = availablePlans.length > 0 ? availablePlans : ['free', 'pro', 'team']

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm">{allUsers.length} total users</p>
        </div>
        <p className="text-muted-foreground text-xs">Click Plan, Status, or Role to edit inline</p>
      </div>
      <AdminClient users={allUsers} availableRoles={roleList} availablePlans={planList} />
    </div>
  )
}
