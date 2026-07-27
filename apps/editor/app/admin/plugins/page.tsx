import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { PLUGIN_CATALOG } from '@/lib/plugins/catalog'

export const dynamic = 'force-dynamic'

const PLAN_DISPLAY: Record<string, string> = { free: 'Free', pro: 'Pro', team: 'Team' }
const STATUS_COLOR: Record<string, string> = {
  stable: 'bg-success/10 border-success/20 text-success',
  beta: 'bg-warning-muted border-warning/20 text-warning',
  coming_soon: 'bg-muted border-border text-muted-foreground',
}
const STATUS_LABEL: Record<string, string> = {
  stable: 'Stable',
  beta: 'Beta',
  coming_soon: 'Coming soon',
}

export default async function AdminPluginsPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/plugins')
  if (session.role !== 'admin') redirect('/')

  const byCategory = PLUGIN_CATALOG.reduce<Record<string, typeof PLUGIN_CATALOG>>((acc, p) => {
    ;(acc[p.category] ??= []).push(p)
    return acc
  }, {})

  return (
    <div className="px-8 py-8 space-y-8">
      <div>
        <h1 className="font-bold text-2xl text-foreground">Plugin Catalog</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {PLUGIN_CATALOG.length} plugins registered ({PLUGIN_CATALOG.filter((p) => p.status === 'stable').length} stable,{' '}
          {PLUGIN_CATALOG.filter((p) => p.status === 'coming_soon').length} coming soon)
        </p>
      </div>

      {Object.entries(byCategory).map(([cat, plugins]) => (
        <div key={cat}>
          <h2 className="mb-3 font-semibold text-sm uppercase tracking-wide text-muted-foreground">{cat}</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8" />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plugin</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Built-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plugins.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-lg">{p.icon}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{p.description}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {PLAN_DISPLAY[p.requiredPlan] ?? p.requiredPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[p.status] ?? ''}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.builtIn ? (
                        <span className="text-success text-xs font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
