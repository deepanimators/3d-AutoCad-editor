import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, roles } from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { Shield, User } from 'lucide-react'
import { AdminClient } from '../admin-client'
import { RolesClient } from './roles-client'

const ROLE_GATES = [
  { label: 'View all users', roles: ['admin'] },
  { label: 'Change user plan', roles: ['admin'] },
  { label: 'Change user role', roles: ['admin'] },
  { label: 'View audit log', roles: ['admin'] },
  { label: 'Access admin dashboard', roles: ['admin'] },
  { label: 'Create scenes', roles: ['user', 'admin'] },
  { label: 'Export GLB (Pro+)', roles: ['user', 'admin'] },
  { label: 'Export IFC (Team+)', roles: ['user', 'admin'] },
  { label: 'Share scenes (Pro+)', roles: ['user', 'admin'] },
  { label: 'MCP access (Pro+)', roles: ['user', 'admin'] },
  { label: 'Real-time collab (Team+)', roles: ['user', 'admin'] },
]

export default async function RolesPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/roles')
  if (session.role !== 'admin') redirect('/')

  const [admins, regularUsers, allRoles] = await Promise.all([
    db.select({
      id: users.id, email: users.email, name: users.name,
      plan: users.plan, role: users.role,
      subscriptionStatus: users.subscriptionStatus, createdAt: users.createdAt,
    }).from(users).where(eq(users.role, 'admin')).orderBy(desc(users.createdAt)),
    db.select({
      id: users.id, email: users.email, name: users.name,
      plan: users.plan, role: users.role,
      subscriptionStatus: users.subscriptionStatus, createdAt: users.createdAt,
    }).from(users).where(eq(users.role, 'user')).orderBy(desc(users.createdAt)),
    db.select().from(roles).orderBy(desc(roles.isSystem), asc(roles.createdAt)),
  ])

  return (
    <AppShell>
      <div className="px-8 py-8 space-y-8">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Roles & RBAC</h1>
          <p className="mt-1 text-muted-foreground text-sm">Role definitions, permissions, and user assignment</p>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-700">Admin</span>
              <span className="ml-auto rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">{admins.length}</span>
            </div>
            <p className="text-xs text-orange-600/80">Full platform access. Can manage users, plans, and roles. Feature gates bypassed — all features unlocked regardless of plan.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">User</span>
              <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{regularUsers.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Standard access. Features gated by subscription plan (Free / Pro / Team).</p>
          </div>
        </div>

        {/* Permission matrix */}
        <div>
          <h2 className="font-semibold text-base mb-3">Permission Matrix</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permission</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    <span className="text-muted-foreground">user</span>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    <span className="text-orange-600">admin</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ROLE_GATES.map((g) => (
                  <tr key={g.label} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-muted-foreground">{g.label}</td>
                    <td className="px-4 py-2.5 text-center">
                      {g.roles.includes('user')
                        ? <span className="text-green-600 text-base">✓</span>
                        : <span className="text-muted-foreground/30 text-base">–</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-green-600 text-base">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Roles */}
        <div>
          <h2 className="font-semibold text-base mb-3">Custom Roles</h2>
          <RolesClient allRoles={allRoles} />
        </div>

        {/* Admins */}
        <div>
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-600" />
            Admins
            <span className="text-muted-foreground font-normal text-sm">({admins.length})</span>
          </h2>
          {admins.length > 0
            ? <AdminClient users={admins} />
            : <p className="text-muted-foreground text-sm">No admins found.</p>}
        </div>

        {/* Regular users */}
        <div>
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Users
            <span className="text-muted-foreground font-normal text-sm">({regularUsers.length})</span>
          </h2>
          {regularUsers.length > 0
            ? <AdminClient users={regularUsers} />
            : <p className="text-muted-foreground text-sm">No standard users.</p>}
        </div>
      </div>
    </AppShell>
  )
}
