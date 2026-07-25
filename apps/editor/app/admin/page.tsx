import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-bold text-2xl text-foreground">Admin Dashboard</h1>
          <span className="rounded-full bg-foreground px-3 py-1 text-background text-xs font-medium">
            {allUsers.length} users
          </span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-muted-foreground text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                      u.subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
                      u.subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {u.subscriptionStatus ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 font-semibold text-lg">Quick actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/admin/audit" className="rounded-xl border border-border p-4 hover:bg-accent">
              <div className="font-medium">Audit Log</div>
              <div className="mt-1 text-muted-foreground text-sm">View all platform events</div>
            </a>
            <a href="/scenes" className="rounded-xl border border-border p-4 hover:bg-accent">
              <div className="font-medium">All Scenes</div>
              <div className="mt-1 text-muted-foreground text-sm">Browse and manage scenes</div>
            </a>
            <a href="/pricing" className="rounded-xl border border-border p-4 hover:bg-accent">
              <div className="font-medium">Pricing Page</div>
              <div className="mt-1 text-muted-foreground text-sm">Preview customer-facing plans</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
