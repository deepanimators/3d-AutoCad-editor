import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { planConfig } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  displayName: z.string().min(1).optional(),
  displayPriceCents: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  priceSuffix: z.string().optional(),
  stripePriceId: z.string().nullable().optional(),
  stripeYearlyPriceId: z.string().nullable().optional(),
  razorpayPlanId: z.string().nullable().optional(),
  razorpayYearlyPlanId: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  highlight: z.boolean().optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planKey: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { planKey } = await params
  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }

  if (data.displayName !== undefined) updates.displayName = data.displayName
  if (data.displayPriceCents !== undefined) updates.displayPriceCents = data.displayPriceCents
  if (data.currency !== undefined) updates.currency = data.currency
  if (data.priceSuffix !== undefined) updates.priceSuffix = data.priceSuffix
  if (data.stripePriceId !== undefined) updates.stripePriceId = data.stripePriceId
  if (data.stripeYearlyPriceId !== undefined) updates.stripeYearlyPriceId = data.stripeYearlyPriceId
  if (data.razorpayPlanId !== undefined) updates.razorpayPlanId = data.razorpayPlanId
  if (data.razorpayYearlyPlanId !== undefined) updates.razorpayYearlyPlanId = data.razorpayYearlyPlanId
  if (data.features !== undefined) updates.features = JSON.stringify(data.features)
  if (data.highlight !== undefined) updates.highlight = data.highlight
  if (data.active !== undefined) updates.active = data.active

  const [updated] = await db
    .update(planConfig)
    .set(updates)
    .where(eq(planConfig.planKey, planKey as 'free' | 'pro' | 'team'))
    .returning()

  if (!updated) return NextResponse.json({ error: 'plan not found' }, { status: 404 })

  return NextResponse.json({
    ...updated,
    features: JSON.parse(updated.features) as string[],
  })
}
