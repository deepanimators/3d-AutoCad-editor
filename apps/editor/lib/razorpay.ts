import Razorpay from 'razorpay'
import crypto from 'node:crypto'

let _razorpay: Razorpay | null = null
export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? '',
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
    })
  }
  return _razorpay
}

export const RAZORPAY_PLAN_MAP: Record<string, string | undefined> = {
  'pro-monthly': process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
  'pro-yearly': process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
  'team-monthly': process.env.RAZORPAY_TEAM_MONTHLY_PLAN_ID,
  'team-yearly': process.env.RAZORPAY_TEAM_YEARLY_PLAN_ID,
}

export function resolvePlanFromRazorpayPlanId(planId: string | undefined): 'free' | 'pro' | 'team' {
  if (!planId) return 'free'
  if (
    [
      process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
      process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
    ].includes(planId)
  )
    return 'pro'
  if (
    [
      process.env.RAZORPAY_TEAM_MONTHLY_PLAN_ID,
      process.env.RAZORPAY_TEAM_YEARLY_PLAN_ID,
    ].includes(planId)
  )
    return 'team'
  return 'free'
}

export function verifyRazorpaySignature(params: {
  subscriptionId: string
  paymentId: string
  signature: string
}): boolean {
  const body = `${params.paymentId}|${params.subscriptionId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
    .update(body)
    .digest('hex')
  return expected === params.signature
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '')
    .update(rawBody)
    .digest('hex')
  return expected === signature
}
