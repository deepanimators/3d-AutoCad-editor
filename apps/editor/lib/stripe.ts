import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2026-06-24.dahlia',
})

export const PRICE_MAP: Record<string, string | undefined> = {
  'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  'pro-yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  'team-monthly': process.env.STRIPE_TEAM_MONTHLY_PRICE_ID,
  'team-yearly': process.env.STRIPE_TEAM_YEARLY_PRICE_ID,
}

export function resolvePlan(priceId: string | undefined): 'free' | 'pro' | 'team' {
  if (!priceId) return 'free'
  if ([process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(priceId)) return 'pro'
  if ([process.env.STRIPE_TEAM_MONTHLY_PRICE_ID, process.env.STRIPE_TEAM_YEARLY_PRICE_ID].includes(priceId)) return 'team'
  return 'free'
}

export async function createStripeCoupon(opts: {
  name: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  expiresAt?: string
}): Promise<Stripe.Coupon> {
  const params: Stripe.CouponCreateParams = {
    name: opts.name,
    duration: opts.duration,
    ...(opts.duration === 'repeating' ? { duration_in_months: opts.durationInMonths } : {}),
    ...(opts.maxRedemptions ? { max_redemptions: opts.maxRedemptions } : {}),
    ...(opts.expiresAt ? { redeem_by: Math.floor(new Date(opts.expiresAt).getTime() / 1000) } : {}),
  }
  if (opts.discountType === 'percent') {
    params.percent_off = opts.discountValue
  } else {
    params.amount_off = opts.discountValue
    params.currency = 'usd'
  }
  return stripe.coupons.create(params)
}

export async function createStripePromoCode(couponId: string, code: string): Promise<Stripe.PromotionCode> {
  return stripe.promotionCodes.create({ promotion: { type: 'coupon', coupon: couponId }, code })
}

export async function deactivateStripePromoCode(promoCodeId: string): Promise<void> {
  await stripe.promotionCodes.update(promoCodeId, { active: false })
}
