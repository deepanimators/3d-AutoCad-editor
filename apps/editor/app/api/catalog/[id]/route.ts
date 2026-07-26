import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const S3_BASE = 'https://assets.aruct.com'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const rows = await db.select().from(globalModels)
    .where(or(eq(globalModels.id, id), eq(globalModels.slug, id)))
    .limit(1)

  const m = rows[0]
  if (!m) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    model: {
      ...m,
      glbUrl: `${S3_BASE}/${m.s3Key}`,
      thumbnailUrl: m.s3Thumbnail ? `${S3_BASE}/${m.s3Thumbnail}` : null,
      isNew: new Date(m.addedAt) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tags: (() => { try { return JSON.parse(m.tags) as string[] } catch { return [] } })(),
    },
  })
}
