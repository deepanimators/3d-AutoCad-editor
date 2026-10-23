import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { pluginRegistry, pluginRatings } from '@/lib/db/schema'
import { eq, avg, count } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { rating, review } = await req.json()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
  }

  await db
    .insert(pluginRatings)
    .values({ id: randomUUID(), pluginId: id, userId: user.id, rating, review })
    .onConflictDoUpdate({
      target: [pluginRatings.pluginId, pluginRatings.userId],
      set: { rating, review },
    })

  // Recalculate aggregate
  const [agg] = await db
    .select({ avg: avg(pluginRatings.rating), count: count() })
    .from(pluginRatings)
    .where(eq(pluginRatings.pluginId, id))

  if (agg) {
    await db
      .update(pluginRegistry)
      .set({ rating: Number(agg.avg ?? 0), ratingCount: Number(agg.count ?? 0) })
      .where(eq(pluginRegistry.id, id))
  }

  return NextResponse.json({ ok: true })
}
