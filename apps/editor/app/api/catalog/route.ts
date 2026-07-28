import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { like, eq, and, sql, desc, count } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const S3_BASE = process.env.CATALOG_ASSETS_BASE_URL ?? ''

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const source = searchParams.get('source')
  const isNewFilter = searchParams.get('isNew')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') ?? '24', 10)))
  const offset = (page - 1) * limit

  const conditions = []
  if (q) conditions.push(like(globalModels.name, `%${q}%`))
  if (category) conditions.push(eq(globalModels.category, category))
  if (source) conditions.push(eq(globalModels.source, source))
  if (isNewFilter === 'true') {
    conditions.push(sql`${globalModels.addedAt} > NOW() - INTERVAL '10 days'`)
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, countRows] = await Promise.all([
    db.select().from(globalModels)
      .where(where)
      .orderBy(desc(globalModels.addedAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(globalModels).where(where),
  ])
  const total = countRows[0]?.total ?? 0

  const models = rows.map((m) => ({
    ...m,
    glbUrl: m.s3Key.startsWith('http') ? m.s3Key : `${S3_BASE}/${m.s3Key}`,
    thumbnailUrl: m.s3Thumbnail
      ? m.s3Thumbnail.startsWith('http') ? m.s3Thumbnail : `${S3_BASE}/${m.s3Thumbnail}`
      : null,
    isNew: new Date(m.addedAt) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    tags: (() => { try { return JSON.parse(m.tags) as string[] } catch { return [] } })(),
  }))

  return NextResponse.json({ models, total, page })
}
