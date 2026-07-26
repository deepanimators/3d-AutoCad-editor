# Implementation Order — Billing Admin Features

## Priority Stack (top = do first)

### Sprint 1: Coupon System (highest impact, safe)

**Files to create/modify:**

1. `lib/db/schema.ts` — add `coupons` table
2. `scripts/run-migration.mjs` — CREATE TABLE coupons
3. `lib/stripe.ts` — add `createStripeCoupon()` and `createStripePromoCode()` helpers
4. `app/api/admin/coupons/route.ts` — GET list, POST create
5. `app/api/admin/coupons/[id]/route.ts` — PATCH deactivate
6. `app/api/pricing/active-promos/route.ts` — public, returns active promos for display
7. `app/admin/coupons/page.tsx` — admin UI: create form + coupon list
8. `app/pricing/page.tsx` — fetch active promos from DB
9. `app/pricing/pricing-client.tsx` — strikethrough display + pass promoCodeId to checkout
10. `app/api/billing/checkout/route.ts` — accept optional `promoCodeId`, pass to Stripe

**Key behavior:**
- Admin creates coupon with `duration: 'once'` → first month discounted, auto-renews at full price
- No code needed for renewal at full price — Stripe/Razorpay handle this automatically
- Pricing page shows `<s>$29</s> $5 first month, then $29/mo` when active promo exists

---

### Sprint 2: Plan Config in DB (no risk)

**Files to create/modify:**

1. `lib/db/schema.ts` — add `plan_config` table
2. `scripts/run-migration.mjs` — CREATE TABLE plan_config + seed INSERT
3. `app/api/admin/plan-config/[planKey]/route.ts` — PATCH display config
4. `app/pricing/page.tsx` — fetch plan config from DB, fall back to hardcoded
5. `app/pricing/pricing-client.tsx` — render from DB config (prices, features, names)
6. `app/admin/plans/page.tsx` — add inline edit form for each plan

**What admins can change:**
- Display price (what's shown on pricing page)
- Feature list text
- Stripe/Razorpay price IDs (when billing amount changes — requires new Stripe Price)

**What stays in code:**
- Feature gate enforcement (`lib/feature-gates.ts`) — code-level, intentionally hard to change via UI

---

### Sprint 3: Custom Roles (requires DB migration, test carefully)

**Files to create/modify:**

1. `lib/db/schema.ts` — add `roles` table
2. `scripts/run-migration.mjs` — ALTER users.role (drop enum), CREATE TABLE roles, seed
3. `lib/permissions.ts` — add `hasPermission(session, permission)` helper
4. `app/api/admin/roles/route.ts` — GET/POST roles
5. `app/api/admin/roles/[id]/route.ts` — PATCH/DELETE
6. `app/admin/roles/page.tsx` — create/edit/delete roles, permission checkboxes
7. Gradually migrate admin API guards to use `hasPermission()` instead of `=== 'admin'`

---

## What Changes in the Pricing Page (Visual Spec)

### Without active promo (current):
```
Pro
$29 /month
[Pay with Card]  [Pay with Razorpay]
```

### With active promo (coupon active for pro-monthly):
```
Pro          🏷️ Launch offer
~~$29~~  $5 /first month
then $29/month
[Pay with Card - $5]  [Pay with Razorpay - $5]
```

### Expiry countdown (optional):
```
Offer ends in 3 days
```

---

## Auto-Renewal at Full Price — How It Works

This is 100% handled by Stripe/Razorpay — no custom code:

```
Stripe flow with duration:'once' coupon:
  Invoice #1 (month 1):  $29 - $24 discount = $5  ← user pays
  Invoice #2 (month 2):  $29 - $0           = $29 ← auto-charged
  Invoice #3 (month 3):  $29 - $0           = $29 ← auto-charged
```

Our webhook receives `invoice.payment_succeeded` for each. We don't need to
track when the promo expires — Stripe does that. The user's `plan` stays `pro`
throughout. No DB updates needed for the auto-renewal.

---

## Rollback Safety

Each sprint is additive (new tables, new routes, new UI).
No existing routes are modified in Sprint 1-2.
Sprint 3 (role enum change) is the only breaking migration — test on staging DB first.

Pricing page has hardcoded fallbacks: if DB plan_config is empty, renders the
same hardcoded PLANS array as today. Zero risk on first deploy.
