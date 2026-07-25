import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
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
