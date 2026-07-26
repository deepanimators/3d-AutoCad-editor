import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { coupons } from '@/lib/db/schema'
import { deactivateStripePromoCode } from '@/lib/stripe'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id))
  if (!coupon) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (coupon.stripePromoCodeId) {
    await deactivateStripePromoCode(coupon.stripePromoCodeId)
  }

  const [updated] = await db.update(coupons).set({ active: false }).where(eq(coupons.id, id)).returning()

  await logAction({ userId: session.id, action: 'coupon.deactivated', resourceType: 'coupon', resourceId: id, request })

  return NextResponse.json(updated)
}
