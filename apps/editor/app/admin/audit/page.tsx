import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin: Audit Log',
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { auditLog } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/audit')
  if (session.role !== 'admin') redirect('/')

  const events = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200)

  return (
    <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-foreground">Audit Log</h1>
          <p className="mt-1 text-muted-foreground text-sm">Last {events.length} platform events</p>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                    No events yet
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{e.action}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {e.resourceType ? `${e.resourceType}/${e.resourceId?.slice(0, 8) ?? ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{e.userId?.slice(0, 8) ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{e.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )
}
