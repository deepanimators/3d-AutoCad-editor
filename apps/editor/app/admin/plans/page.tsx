import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { Check, X } from 'lucide-react'

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    color: 'bg-muted text-muted-foreground',
    price: '$0',
    features: [
      { label: 'Scene limit', value: '5 scenes' },
      { label: 'Create scenes', value: true },
      { label: 'GLB export', value: false },
      { label: 'IFC export', value: false },
      { label: 'Scene sharing', value: false },
      { label: 'MCP access', value: false },
      { label: 'Real-time collaboration', value: false },
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    color: 'bg-blue-100 text-blue-700',
    price: '$19/mo',
    features: [
      { label: 'Scene limit', value: 'Unlimited' },
      { label: 'Create scenes', value: true },
      { label: 'GLB export', value: true },
      { label: 'IFC export', value: false },
      { label: 'Scene sharing', value: true },
      { label: 'MCP access', value: true },
      { label: 'Real-time collaboration', value: false },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    color: 'bg-violet-100 text-violet-700',
    price: '$49/mo',
    features: [
      { label: 'Scene limit', value: 'Unlimited' },
      { label: 'Create scenes', value: true },
      { label: 'GLB export', value: true },
      { label: 'IFC export', value: true },
      { label: 'Scene sharing', value: true },
      { label: 'MCP access', value: true },
      { label: 'Real-time collaboration', value: true },
    ],
  },
]

export default async function PlansPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/plans')
  if (session.role !== 'admin') redirect('/')

  const counts = await db
    .select({ plan: users.plan, count: sql<number>`count(*)::int` })
    .from(users)
    .groupBy(users.plan)

  const countByPlan = Object.fromEntries(counts.map((r) => [r.plan, r.count]))

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-foreground">Plans</h1>
          <p className="mt-1 text-muted-foreground text-sm">Feature gates and user distribution per plan</p>
        </div>

        {/* User counts */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div key={p.key} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.color}`}>{p.label}</span>
                <span className="font-bold text-2xl text-foreground">{countByPlan[p.key] ?? 0}</span>
              </div>
              <p className="mt-1 text-muted-foreground text-xs">users on this plan</p>
            </div>
          ))}
        </div>

        {/* Feature gate matrix */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.key} className="px-4 py-3 text-center font-medium text-muted-foreground">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.color}`}>{p.label}</span>
                    <div className="mt-1 text-[11px] font-normal text-muted-foreground">{p.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PLANS[0]!.features.map((_, fi) => (
                <tr key={fi} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{PLANS[0]!.features[fi]!.label}</td>
                  {PLANS.map((p) => {
                    const val = p.features[fi]!.value
                    return (
                      <td key={p.key} className="px-4 py-3 text-center">
                        {typeof val === 'boolean' ? (
                          val
                            ? <Check className="mx-auto h-4 w-4 text-green-600" />
                            : <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <span className="font-medium text-foreground">{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-muted-foreground text-xs">
          Feature gates are enforced in <code className="font-mono text-xs">lib/feature-gates.ts</code>. Assign plans to users from{' '}
          <a href="/admin" className="underline hover:text-foreground">Admin Dashboard</a>.
        </p>
      </div>
    </AppShell>
  )
}
