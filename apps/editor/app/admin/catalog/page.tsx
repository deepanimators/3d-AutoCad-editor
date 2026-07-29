import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin: Catalog',
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { MigrateCatalogButton } from './migrate-catalog-button'

export const dynamic = 'force-dynamic'

export default async function AdminCatalogPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/catalog')
  if (session.role !== 'admin') redirect('/')

  const models = await db
    .select({
      id: globalModels.id,
      name: globalModels.name,
      source: globalModels.source,
      license: globalModels.license,
      category: globalModels.category,
      s3Key: globalModels.s3Key,
      s3Thumbnail: globalModels.s3Thumbnail,
      addedAt: globalModels.addedAt,
    })
    .from(globalModels)
    .orderBy(desc(globalModels.addedAt))
    .limit(200)

  return (
    <div className="px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Model Catalog</h1>
          <p className="mt-1 text-muted-foreground text-sm">{models.length} global models</p>
        </div>
        <div className="flex items-center gap-2">
          <MigrateCatalogButton />
          <a
            href="/catalog"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            View user catalog →
          </a>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No models in catalog yet.</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Models are added via AI generation (Tripo3D) or imported from Poly Haven / Poly Pizza.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">Thumb</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">License</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Storage</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    {m.s3Thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.s3Thumbnail.startsWith('http') ? m.s3Thumbnail : `/${m.s3Thumbnail}`}
                        alt={m.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{m.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                      {m.source}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{m.category ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{m.license ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[120px] truncate">
                    {m.s3Key ? (m.s3Key.startsWith('http') ? 'CDN URL' : 'S3/R2') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                    {m.addedAt ? new Date(m.addedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
