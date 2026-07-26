import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes, users } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminScenesPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/scenes')
  if (session.role !== 'admin') redirect('/')

  const [allScenes, stats] = await Promise.all([
    db
      .select({
        id: scenes.id,
        name: scenes.name,
        ownerId: scenes.ownerId,
        orgId: scenes.orgId,
        nodeCount: scenes.nodeCount,
        sizeBytes: scenes.sizeBytes,
        isPublic: scenes.isPublic,
        updatedAt: scenes.updatedAt,
        ownerEmail: users.email,
      })
      .from(scenes)
      .leftJoin(users, eq(users.id, scenes.ownerId))
      .orderBy(desc(scenes.updatedAt))
      .limit(200),
    db
      .select({
        total: sql<number>`count(*)::int`,
        totalBytes: sql<number>`sum(size_bytes)::bigint`,
        publicCount: sql<number>`sum(case when is_public then 1 else 0 end)::int`,
        avgNodes: sql<number>`avg(node_count)::int`,
      })
      .from(scenes),
  ])

  const s = stats[0]
  const totalMb = s?.totalBytes ? (s.totalBytes / 1024 / 1024).toFixed(1) : '0'

  return (
    <div className="px-8 py-8 space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground">Scenes Overview</h1>
        <p className="mt-1 text-muted-foreground text-sm">All scenes across all users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total scenes', value: s?.total ?? 0 },
          { label: 'Public scenes', value: s?.publicCount ?? 0 },
          { label: 'Avg nodes', value: s?.avgNodes ?? 0 },
          { label: 'Total storage', value: `${totalMb} MB` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-background p-4">
            <p className="font-bold text-2xl text-foreground">{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Scene</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspace</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nodes</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Size</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Visibility</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allScenes.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>No scenes yet</td>
              </tr>
            )}
            {allScenes.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <a href={`/scene/${s.id}`} className="font-medium hover:text-brand transition-colors">
                    {s.name}
                  </a>
                  <p className="text-muted-foreground text-[11px] font-mono">{s.id.slice(0, 12)}…</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.ownerEmail ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {s.orgId ? (
                    <span className="rounded-full bg-purple-muted px-2 py-0.5 text-purple text-[11px]">
                      {s.orgId.slice(0, 8)}…
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.nodeCount}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {s.sizeBytes ? `${(s.sizeBytes / 1024).toFixed(0)} KB` : '—'}
                </td>
                <td className="px-4 py-3">
                  {s.isPublic ? (
                    <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-success text-[11px]">Public</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-[11px]">Private</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
