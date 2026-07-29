import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin: Plans',
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, planConfig } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { PlanConfigClient } from './plan-config-client'

export const dynamic = 'force-dynamic'

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-brand-muted text-brand',
  team: 'bg-purple-muted text-purple',
}

export default async function PlansPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/plans')
  if (session.role !== 'admin') redirect('/')

  const [counts, dbConfigs] = await Promise.all([
    db
      .select({ plan: users.plan, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.plan),
    db.select().from(planConfig).orderBy(planConfig.planKey),
  ])

  const countByPlan = Object.fromEntries(counts.map((r) => [r.plan, r.count]))

  const parsedConfigs = dbConfigs.map((row) => ({
    ...row,
    features: JSON.parse(row.features) as string[],
  }))

  return (
    <div className="px-8 py-8 space-y-8">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Plans</h1>
          <p className="mt-1 text-muted-foreground text-sm">Plan configuration and user distribution</p>
        </div>

        {parsedConfigs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No plan configs in database. Run the migration to seed the{' '}
              <code className="font-mono text-xs">plan_config</code> table.
            </p>
          </div>
        ) : (
          <>
            {/* User counts per plan */}
            <div className={`grid gap-4 grid-cols-${parsedConfigs.length}`}>
              {parsedConfigs.map((p) => (
                <div key={p.planKey} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PLAN_COLORS[p.planKey] ?? 'bg-muted text-muted-foreground'}`}>
                      {p.displayName}
                    </span>
                    <span className="font-bold text-2xl text-foreground">{countByPlan[p.planKey] ?? 0}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">users on this plan</p>
                </div>
              ))}
            </div>

            {/* Editable plan settings */}
            <div>
              <h2 className="font-semibold text-base mb-3">Plan Settings</h2>
              <PlanConfigClient configs={parsedConfigs} />
            </div>

            {/* Feature list per plan (from DB) */}
            <div>
              <h2 className="font-semibold text-base mb-3">Features per Plan</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                      {parsedConfigs.map((p) => (
                        <th key={p.planKey} className="px-4 py-3 text-left font-medium text-muted-foreground">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PLAN_COLORS[p.planKey] ?? 'bg-muted text-muted-foreground'}`}>
                            {p.displayName}
                          </span>
                          <div className="mt-1 text-[11px] font-normal text-muted-foreground">
                            {p.displayPriceCents === 0
                              ? 'Free'
                              : `$${(p.displayPriceCents / 100).toFixed(0)}${p.priceSuffix}`}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Array.from({ length: Math.max(...parsedConfigs.map((p) => p.features.length)) }).map((_, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                        {parsedConfigs.map((p) => (
                          <td key={p.planKey} className="px-4 py-2.5 text-sm text-foreground">
                            {p.features[i] ?? <span className="text-muted-foreground/30">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-muted-foreground text-xs">
                Feature enforcement is in <code className="font-mono text-xs">lib/feature-gates.ts</code>.
                Edit features above to update what users see on the pricing page.
              </p>
            </div>
          </>
        )}
    </div>
  )
}
