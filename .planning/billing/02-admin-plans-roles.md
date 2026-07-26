# Admin: Plan Config & Role Management

## Goal

Admin UI to:
1. Edit plan display prices (what users SEE on pricing page) without changing Stripe prices
2. Add new custom roles beyond `user` / `admin`
3. Assign users to custom roles

---

## Current State

- Plans (`free`, `pro`, `team`) are hardcoded as an enum in `lib/db/schema.ts` and `pricing-client.tsx`
- Roles (`user`, `admin`) are hardcoded as an enum in `lib/db/schema.ts`
- `/admin/plans` page shows feature gates (read-only)
- `/admin/roles` page shows role descriptions and permission matrix (read-only)

---

## Part 1: Plan Display Config (Editable Prices)

### What changes and what doesn't

| Layer | Editable | Notes |
|---|---|---|
| Stripe price (actual billing amount) | ❌ No | Stripe price is immutable once created. Create new prices to change billing amount. |
| Display price on pricing page | ✅ Yes | This is a UI concern — store in DB, show strikethrough when discounted |
| Plan features shown on pricing page | ✅ Yes | Stored in DB, editable by admin |
| Actual feature gating | ❌ No via UI | `lib/feature-gates.ts` is code — changing via UI would need a runtime config |

### DB Schema: `plan_config` table

```typescript
export const planConfig = pgTable('plan_config', {
  id: text('id').primaryKey(),
  planKey: text('plan_key', { enum: ['free', 'pro', 'team'] }).notNull().unique(),
  displayName: text('display_name').notNull(),            // e.g. 'Pro'
  displayPriceCents: integer('display_price_cents').notNull(),  // 2900 = $29
  currency: text('currency').notNull().default('usd'),
  priceSuffix: text('price_suffix').notNull().default('/month'), // '/month', '/seat/month'
  stripePriceId: text('stripe_price_id'),                // maps to Stripe Price object
  stripeYearlyPriceId: text('stripe_yearly_price_id'),
  razorpayPlanId: text('razorpay_plan_id'),
  razorpayYearlyPlanId: text('razorpay_yearly_plan_id'),
  features: text('features').notNull(),                  // JSON array of feature strings
  highlight: boolean('highlight').notNull().default(false),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})
```

### Seed data (run once)

```sql
INSERT INTO plan_config VALUES
('plan_free', 'free', 'Free', 0, 'usd', 'forever', ...),
('plan_pro', 'pro', 'Pro', 2900, 'usd', '/month', ...),
('plan_team', 'team', 'Team', 7900, 'usd', '/seat/month', ...)
```

### API Routes

- `GET /api/admin/plan-config` — fetch all plan configs
- `PATCH /api/admin/plan-config/[planKey]` — update display price, features, Stripe price IDs

### Admin UI (`/admin/plans` enhanced)

Add "Edit" button per plan card → inline form:
- Display price input (what users see)
- Feature list (textarea, one per line)
- Stripe price ID (for connecting new Stripe prices after a price change)
- Save → PATCH plan-config

Pricing page reads from DB plan config instead of hardcoded PLANS array.
Falls back to hardcoded defaults if DB empty (safe for first deploy).

---

## Part 2: Custom Roles

### Current constraint

`role` column in `users` table has a DB-level CHECK constraint: `role IN ('user','admin')`.
Adding new roles requires a schema migration.

### Option A: Extend enum + add `custom_roles` table (recommended)

Extend the `role` column to drop the enum constraint → store arbitrary role names.
Add a `roles` table for role definitions:

```typescript
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),              // e.g. 'moderator', 'support'
  description: text('description').notNull(),
  permissions: text('permissions').notNull(),         // JSON: ['view_all_users', 'view_audit']
  isSystem: boolean('is_system').notNull().default(false),  // true = cannot be deleted
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})
```

Migration:
```sql
ALTER TABLE users ALTER COLUMN role TYPE text;  -- drop enum constraint
ALTER TABLE users ADD CONSTRAINT valid_role CHECK (length(role) > 0);
INSERT INTO roles VALUES
  ('role_user', 'user', 'Standard access', '[]', true),
  ('role_admin', 'admin', 'Full access', '["all"]', true);
```

### Option B: Keep enum, add metadata-only roles table

Keep the two DB roles (`user`, `admin`). Add a `roles` table that's UI-only.
Actual permission enforcement stays code-based. Roles are cosmetic labels.

**Recommendation: Option A** — gives real extensibility. `getSession()` in `auth-server.ts` returns `role` as string, so code is compatible. Middleware checks `session.role === 'admin'` still works.

### Permission System for Custom Roles

Permissions are granular string tokens checked in API routes and middleware:

```
'view_all_users'     — see /admin/users
'change_user_plan'   — PATCH /api/admin/users/[id]
'view_audit_log'     — see /admin/audit
'impersonate_user'   — POST /api/admin/impersonate
'manage_coupons'     — POST /api/admin/coupons
```

`admin` role maps to `['all']` (wildcard bypass).
Custom role `moderator` maps to `['view_all_users', 'change_user_plan']`.

### Admin UI (`/admin/roles` enhanced)

- Show existing roles (read-only for system roles `user`/`admin`)
- "Add Role" button → form: name, description, permission checkboxes
- Per role: "Edit permissions" and "Delete" (non-system only)
- User list per role (count + drill-down)

---

## Order of Work

### Phase 1 — Plan config (low risk, no DB enum change)
1. Add `plan_config` table to schema + migration
2. Seed with current plan data
3. `PATCH /api/admin/plan-config/[planKey]` route
4. Pricing page reads from DB (with hardcoded fallback)
5. `/admin/plans` page adds inline edit form

### Phase 2 — Coupon system (see 01-coupons-and-promo-pricing.md)

### Phase 3 — Custom roles (higher risk, DB migration)
1. Alter `users.role` column to drop enum constraint
2. Create `roles` table
3. Seed system roles
4. Permission check helper: `hasPermission(session, 'view_all_users')`
5. Update all admin API guards to use permission check (not hardcoded `=== 'admin'`)
6. `/admin/roles` — create/edit/delete roles, assign permissions

---

## Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| Plan display config in DB | Very low — UI only | Hardcoded fallback in pricing page |
| Coupon system | Low — additive | Stripe handles actual discount enforcement |
| Altering `users.role` enum | Medium — migration | Test migration on a branch DB first |
| Permission system refactor | Medium — touches all admin guards | Gradual: add `hasPermission()` then migrate checks one by one |
