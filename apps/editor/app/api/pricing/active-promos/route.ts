import { NextResponse } from 'next/server'
import { and, eq, or, isNull, gt } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { coupons } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date().toISOString()

  const rows = await db.select({
    id: coupons.id,
    appliesToPlans: coupons.appliesToPlans,
    originalPriceCents: coupons.originalPriceCents,
    promoPriceCents: coupons.promoPriceCents,
    expiresAt: coupons.expiresAt,
    duration: coupons.duration,
    discountType: coupons.discountType,
    discountValue: coupons.discountValue,
  }).from(coupons).where(
    and(
      eq(coupons.active, true),
      or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now)),
    )
  )

  const promos = rows.map(r => ({
    ...r,
    appliesToPlans: JSON.parse(r.appliesToPlans) as string[],
  }))

  return NextResponse.json(promos, {
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  })
}
