import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin: Roles',
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, roles, planConfig } from '@/lib/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { AdminClient } from '../admin-client'
import { RolesClient } from './roles-client'
import { ALL_PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const PERMISSION_LABELS: Record<string, string> = {
  view_all_users: 'View all users',
  change_user_plan: 'Change user plan',
  change_user_role: 'Change user role',
  view_audit_log: 'View audit log',
  impersonate_user: 'Impersonate user',
  manage_coupons: 'Manage coupons',
  manage_plan_config: 'Manage plan config',
  manage_roles: 'Manage roles',
  access_admin: 'Access admin dashboard',
}

export default async function RolesPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/roles')
  if (session.role !== 'admin') redirect('/')

  const [allRoles, allPlans, roleCounts] = await Promise.all([
    db.select().from(roles).orderBy(desc(roles.isSystem), asc(roles.createdAt)),
    db.select({ planKey: planConfig.planKey }).from(planConfig).where(eq(planConfig.active, true)),
    db
      .select({ role: users.role, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.role),
  ])

  const countByRole = Object.fromEntries(roleCounts.map((r) => [r.role, r.count]))

  const parsedRoles = allRoles.map((r) => ({
    ...r,
    permissionsArr: JSON.parse(r.permissions) as string[],
  }))

  const availableRoles = allRoles.map((r) => r.name)
  const availablePlans = allPlans.map((p) => p.planKey)
  const roleList = availableRoles.length > 0 ? availableRoles : ['user', 'admin']
  const planList = availablePlans.length > 0 ? availablePlans : ['free', 'pro', 'team']

  // All user rows grouped by role for the per-role user tables
  const allUserRows = await db.select({
    id: users.id, email: users.email, name: users.name,
    plan: users.plan, role: users.role,
    subscriptionStatus: users.subscriptionStatus, createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt))

  const usersByRole = allUserRows.reduce<Record<string, typeof allUserRows>>((acc, u) => {
    if (!acc[u.role]) acc[u.role] = []
    acc[u.role]!.push(u)
    return acc
  }, {})

  return (
    <div className="px-8 py-8 space-y-8">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Roles & RBAC</h1>
          <p className="mt-1 text-muted-foreground text-sm">Role definitions, permissions, and user assignment</p>
        </div>

        {/* Role summary cards — one per DB role */}
        <div className={`grid gap-4 ${parsedRoles.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {parsedRoles.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-5 ${
                r.name === 'admin'
                  ? 'border-warning/30 bg-warning-muted'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${r.name === 'admin' ? 'text-warning' : 'text-foreground'}`}>
                  {r.name}
                </span>
                {r.isSystem && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    system
                  </span>
                )}
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  r.name === 'admin' ? 'bg-warning-muted text-warning' : 'bg-muted text-muted-foreground'
                }`}>
                  {countByRole[r.name] ?? 0}
                </span>
              </div>
              <p className={`text-xs ${r.name === 'admin' ? 'text-warning/80' : 'text-muted-foreground'}`}>
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* Permission matrix — driven from DB roles */}
        <div>
          <h2 className="font-semibold text-base mb-3">Permission Matrix</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permission</th>
                  {parsedRoles.map((r) => (
                    <th key={r.id} className="px-4 py-3 text-center font-medium text-muted-foreground">
                      <span className={r.name === 'admin' ? 'text-warning' : 'text-muted-foreground'}>
                        {r.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {PERMISSION_LABELS[perm] ?? perm}
                    </td>
                    {parsedRoles.map((r) => {
                      const has = r.permissionsArr.includes('all') || r.permissionsArr.includes(perm)
                      return (
                        <td key={r.id} className="px-4 py-2.5 text-center">
                          {has
                            ? <span className="text-success text-base">✓</span>
                            : <span className="text-muted-foreground/30 text-base">–</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Roles management */}
        <div>
          <h2 className="font-semibold text-base mb-3">Manage Roles</h2>
          <RolesClient allRoles={allRoles} />
        </div>

        {/* Users grouped by role */}
        {parsedRoles.map((r) => {
          const roleUsers = usersByRole[r.name] ?? []
          return (
            <div key={r.id}>
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <span className={`font-semibold ${r.name === 'admin' ? 'text-warning' : 'text-foreground'}`}>
                  {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                </span>
                <span className="text-muted-foreground font-normal text-sm">({roleUsers.length})</span>
              </h2>
              {roleUsers.length > 0
                ? <AdminClient users={roleUsers} availableRoles={roleList} availablePlans={planList} />
                : <p className="text-muted-foreground text-sm">No users with this role.</p>}
            </div>
          )
        })}
    </div>
  )
}
