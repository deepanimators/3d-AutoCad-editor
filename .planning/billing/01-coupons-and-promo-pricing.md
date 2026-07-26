# Coupons, Promo Pricing & Strikethrough Display

## Goal

Admin creates time-limited discounts (e.g., $5 first month, then auto-renews at $10).
Pricing page shows strikethrough original price with discounted price.
After promo period, billing auto-continues at full price — no code needed for this.

---

## How Stripe Handles This (Correct Mental Model)

```
Normal price:   $10/month  (Stripe Price: price_xxx)
Promo coupon:   $5 off, duration: 'once'  (applies to first invoice only)
First invoice:  $10 - $5 = $5   ← user pays this
Month 2+:       $10              ← Stripe auto-bills at full price
```

Stripe Coupon fields that matter:
- `percent_off` or `amount_off` (in cents)
- `duration`: `'once'` | `'repeating'` | `'forever'`
- `duration_in_months`: used when `duration = 'repeating'`
- `max_redemptions`: optional cap
- `redeem_by`: Unix timestamp expiry

Promotion Code = user-facing code (e.g. `LAUNCH50`) that maps to a Coupon.
Multiple promo codes can map to one Coupon.

---

## Razorpay Equivalent

Razorpay subscriptions support `offer_id` at subscription creation time.
Offers are created in Razorpay Dashboard or via API:
```
POST /v1/offers
{
  "name": "Launch offer",
  "payment_offer": { "type": "instant_discount", "value": 500 }
}
```
The subscription first charge is discounted. Subsequent charges at full plan price.

---

## DB Schema: `coupons` table

```typescript
export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),                          // internal label
  code: text('code').notNull().unique(),                 // user-facing e.g. LAUNCH50
  gateway: text('gateway', { enum: ['stripe', 'razorpay', 'both'] }).notNull(),
  stripePromoCodeId: text('stripe_promo_code_id'),       // for passing to checkout
  stripeCouponId: text('stripe_coupon_id'),
  razorpayOfferId: text('razorpay_offer_id'),
  discountType: text('discount_type', { enum: ['percent', 'fixed'] }).notNull(),
  discountValue: integer('discount_value').notNull(),    // percent 0-100 or cents/paise
  duration: text('duration', { enum: ['once', 'repeating', 'forever'] }).notNull(),
  durationInMonths: integer('duration_in_months'),
  appliesToPlans: text('applies_to_plans').notNull(),    // JSON: ['pro-monthly','team-monthly']
  // Display data for pricing page strikethrough
  originalPriceCents: integer('original_price_cents'),   // e.g. 2900
  promoPriceCents: integer('promo_price_cents'),          // e.g. 1500
  maxRedemptions: integer('max_redemptions'),
  redemptionCount: integer('redemption_count').notNull().default(0),
  active: boolean('active').notNull().default(true),
  expiresAt: timestamp('expires_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})
```

---

## API Routes

### `POST /api/admin/coupons`

Admin creates a coupon. Steps:
1. Validate input (name, code, discountType, discountValue, duration, plans)
2. Create Stripe Coupon via `stripe.coupons.create(...)` if gateway includes Stripe
3. Create Stripe Promotion Code via `stripe.promotionCodes.create({ coupon: id, code })`
4. Create Razorpay Offer if gateway includes Razorpay
5. Insert into `coupons` table
6. Return coupon record

### `GET /api/admin/coupons`

List all coupons with redemption counts (pulled from Stripe API or our DB).

### `PATCH /api/admin/coupons/[id]`

Deactivate a coupon (set `active: false`; also deactivate Stripe promo code).

### `GET /api/pricing/active-promos`

Public endpoint. Returns active, non-expired coupons with their display pricing.
Used by pricing page to show strikethrough prices.
Only returns `promoPriceCents`, `originalPriceCents`, `appliesToPlans`, `expiresAt` — NOT the code.

---

## Checkout Integration

### Stripe flow change

Currently checkout doesn't apply coupons automatically.
Two options:
1. **User enters code at checkout**: `allow_promotion_codes: true` (already set) — Stripe shows a code field in Checkout UI. No backend change needed.
2. **Admin pre-applies**: pass `discounts: [{ promotion_code: stripePromoCodeId }]` to `stripe.checkout.sessions.create()` — discount applied automatically.

For the admin-controlled "everyone gets this promo" approach, use option 2:
- Pricing page fetches active promo from `/api/pricing/active-promos`
- Sends `promoCode` to `/api/billing/checkout`
- Backend looks up `stripePromoCodeId` in DB, passes to Stripe checkout

### Razorpay flow

Pass `offer_id: coupon.razorpayOfferId` when creating subscription in `create-subscription/route.ts`.

---

## Pricing Page Display (Strikethrough)

```tsx
// pricing-client.tsx receives activeCoupon prop
const activeCoupon = {
  appliesToPlans: ['pro-monthly'],
  originalPriceCents: 2900,   // $29
  promoPriceCents: 500,        // $5
  expiresAt: '2026-08-01',
}

// Display:
<span className="line-through text-muted-foreground">$29</span>
<span className="font-bold text-2xl">$5</span>
<span className="text-xs text-green-600">first month, then $29/mo</span>
```

---

## Order of Work

1. `coupons` table in schema + migration
2. `POST /api/admin/coupons` — creates Stripe coupon + promo code
3. `GET /api/admin/coupons` + deactivate
4. `/admin/coupons` admin page — create form + list
5. `GET /api/pricing/active-promos` — public, cached
6. Pricing page reads active promos → strikethrough display
7. Checkout passes `stripePromoCodeId` when active promo applies

---

## Safety Guarantees

- Auto-renewal at full price: **Stripe/Razorpay handle this**. `duration: 'once'` means discount applies to first invoice only. Month 2 bills at full plan price automatically. Zero custom code needed.
- Promo expiry: both Stripe and our DB store `expiresAt`. Pricing page won't show expired promos. Checkout validation also checks.
- Double-discount prevention: one promo per checkout session (Stripe enforces this).
