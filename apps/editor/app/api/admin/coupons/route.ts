import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { coupons } from '@/lib/db/schema'
import { createStripeCoupon, createStripePromoCode } from '@/lib/stripe'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  gateway: z.enum(['stripe', 'razorpay', 'both']),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number(),
  duration: z.enum(['once', 'repeating', 'forever']),
  durationInMonths: z.number().optional(),
  appliesToPlans: z.array(z.string()),
  originalPriceCents: z.number().optional(),
  promoPriceCents: z.number().optional(),
  maxRedemptions: z.number().optional(),
  expiresAt: z.string().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data

  let stripeCouponId: string | null = null
  let stripePromoCodeId: string | null = null

  if (data.gateway === 'stripe' || data.gateway === 'both') {
    const stripeCoupon = await createStripeCoupon({
      name: data.name,
      discountType: data.discountType,
      discountValue: data.discountValue,
      duration: data.duration,
      durationInMonths: data.durationInMonths,
      maxRedemptions: data.maxRedemptions,
      expiresAt: data.expiresAt,
    })
    stripeCouponId = stripeCoupon.id

    const promoCode = await createStripePromoCode(stripeCoupon.id, data.code)
    stripePromoCodeId = promoCode.id
  }

  const id = crypto.randomUUID()
  const [inserted] = await db.insert(coupons).values({
    id,
    name: data.name,
    code: data.code,
    gateway: data.gateway,
    discountType: data.discountType,
    discountValue: data.discountValue,
    duration: data.duration,
    durationInMonths: data.durationInMonths ?? null,
    appliesToPlans: JSON.stringify(data.appliesToPlans),
    originalPriceCents: data.originalPriceCents ?? null,
    promoPriceCents: data.promoPriceCents ?? null,
    maxRedemptions: data.maxRedemptions ?? null,
    expiresAt: data.expiresAt ?? null,
    stripeCouponId,
    stripePromoCodeId,
  }).returning()

  await logAction({ userId: session.id, action: 'coupon.created', resourceType: 'coupon', resourceId: id, request })

  return NextResponse.json(inserted, { status: 201 })
}
