import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'

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
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
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
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-muted-foreground text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      u.plan === 'team' ? 'bg-violet-100 text-violet-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
                      u.subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-700' :
                      u.subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {u.subscriptionStatus ?? 'free tier'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`capitalize text-xs font-medium ${u.role === 'admin' ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
