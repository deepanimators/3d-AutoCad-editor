# Auth, Billing and Feature Gates — Features and Gaps

## Authentication

### Firebase Auth
- **`lib/firebase/client.ts`** — Firebase client-side SDK
- **`lib/firebase/admin.ts`** — Firebase Admin for server-side token verification
- **`lib/auth-client.ts`** — client auth helpers
- **`lib/auth-server.ts`** — server-side session validation; `AppUser` type
- **`lib/use-auth.tsx`** — React hook for client auth state
- **`middleware.ts`** — Next.js middleware; enforces auth on protected routes
- Routes: `/login`, `/signup`, `/verify-email`

**Auth providers supported:** Email/password, Google (via Firebase Auth). No magic link, no SAML/SSO.

**Gaps:**
| Gap | Priority |
|---|---|
| SSO / SAML (enterprise requirement) | High |
| Magic link login (email link) | Medium |
| GitHub / Microsoft login | Medium |
| Multi-factor authentication (MFA) | Medium |
| Session duration control | Low |
| IP allowlist for org | Low |

---

## Plans and Feature Gates

### Plan Tiers
```
Free → Pro → Team
```

Defined in `lib/permissions.ts` (`Plan` type). DB column: `users.plan`.

### Feature Gates (`lib/feature-gates.ts` and `lib/permissions.ts`)

| Gate | Free | Pro | Team |
|---|---|---|---|
| Scene count | ≤ 5 | Unlimited | Unlimited |
| Create scene | ✅ (≤5) | ✅ | ✅ |
| Export GLB | ❌ | ✅ | ✅ |
| Export IFC | ❌ | ❌ | ✅ |
| Export DXF | ❌ | ✅ | ✅ |
| Export Schedules | ❌ | ✅ | ✅ |
| Export BOM | ❌ | ✅ | ✅ |
| Export Measurements | ✅ | ✅ | ✅ |
| Share scene | ❌ | ✅ | ✅ |
| Use MCP | ❌ | ✅ | ✅ |
| Real-time collaboration | ❌ | ❌ | ✅ |
| AI 3D generation | ❌ | ✅ (20/mo) | ✅ (unlimited) |
| Vision calls | ❌ | ✅ (5/mo) | ✅ (unlimited) |
| Upload custom items | ❌ | ✅ | ✅ |
| Team catalog | ❌ | ❌ | ✅ |
| DWG import | ❌ | ✅ | ✅ |
| Render capture | ❌ | ✅ | ✅ |

### Subscription Status
Active plan requires `subscriptionStatus` in `['active', 'trialing', 'past_due']`.
Free plan always active regardless of subscription status.

---

## Billing

### Stripe (global)
- **`lib/stripe.ts`** — Stripe SDK client
- `api/billing/checkout` — create Stripe checkout session
- `api/billing/portal` — Stripe billing portal
- `api/billing/webhook` — Stripe event handler (subscription lifecycle)

### Razorpay (India)
- **`lib/razorpay.ts`** — Razorpay SDK client
- `api/billing/razorpay/create-subscription` — create subscription
- `api/billing/razorpay/verify` — verify payment signature
- `api/billing/razorpay/cancel` — cancel subscription
- `api/billing/razorpay/webhook` — Razorpay event handler
- DB: `razorpayCustomerId`, `razorpaySubscriptionId`, `paymentGateway` column

### Geo-Based Payment Routing
- **`lib/geo-currency.ts`** — detects country from request headers → route to Stripe or Razorpay
- Indian users → Razorpay (INR)
- Rest of world → Stripe (USD/EUR)

### Coupons
- `api/admin/coupons/` — admin CRUD for coupons
- DB: `coupons` table (inferred from admin routes)
- Admin panel: `app/admin/coupons/`
- Gaps: no self-serve coupon entry at checkout; coupon analytics

### Plan Config (Admin)
- `api/admin/plan-config/[planKey]` — per-plan limit overrides
- Admin panel: `app/admin/plans/`
- Per-plan config stored in DB

---

## Admin Panel

Routes under `app/admin/` (requires `role: 'admin'`):

| Admin Route | Purpose |
|---|---|
| `/admin` | Dashboard |
| `/admin/users/[id]` | User detail; change plan, role |
| `/admin/scenes` | All scenes overview |
| `/admin/audit` | Audit log viewer |
| `/admin/catalog` | Catalog management; ingest from Polyhaven |
| `/admin/coupons` | Coupon management |
| `/admin/plans` | Plan config overrides |
| `/admin/plugins` | Plugin management |
| `/admin/roles` | Custom role management |
| `/admin/storage` | Storage usage |

### Admin Features
- Impersonate user (`api/admin/impersonate`)
- Change user plan / role
- View audit log
- Migrate catalog (Polyhaven URL migration)
- Ingest Polyhaven assets (`api/admin/catalog/ingest-polyhaven`)

---

## Organization System

DB tables: `organizations`, `orgMembers`

| Feature | Status |
|---|---|
| Create org | ✅ |
| Invite member (by email) | ✅ |
| Accept invite | ✅ |
| Member roles (owner/member) | ✅ |
| Org scenes (scenes owned by org) | ✅ |
| Org billing (subscribe org, not individual) | ❌ |
| Per-member seat billing | ❌ |
| Org SSO | ❌ |
| Org audit log | ❌ (admin log covers admins) |

---

## Gaps

### Billing Gaps (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Org-level billing / seat-based pricing | Enterprise requirement; currently per-user |
| Free trial without credit card | Standard SaaS conversion pattern |
| Usage-based billing (AI calls, render minutes) | Metered billing for heavy AI users |
| Invoice download | Self-serve billing management |
| Billing email (renewal, failed payment) | Transactional email not wired |

### Auth Gaps (HIGH PRIORITY for Enterprise)
| Gap | Notes |
|---|---|
| SAML 2.0 / OIDC SSO | Required by enterprise IT policies |
| SCIM provisioning | Auto-create/deprovision users from IdP |
| MFA (TOTP, SMS, hardware key) | Security requirement |
| Session management UI (active sessions, revoke) | — |

### Plan Design Gaps (MEDIUM)
| Gap | Notes |
|---|---|
| Per-feature add-ons (e.g., extra AI credits) | Flexible pricing |
| Annual vs monthly pricing | Discount for annual |
| Education / non-profit tier | Market expansion |
| Developer / API-only tier | For MCP integrations |
| Enterprise custom contract | Unlimited + SSO + SLA |

### Feature Gate UX Gaps (MEDIUM)
| Gap | Notes |
|---|---|
| In-context upsell (clicking gated feature shows upgrade prompt) | Currently may error silently |
| Feature preview / trial (try Pro features for 7 days) | Reduces friction |
| Usage meter in UI (AI generations remaining this month) | Users need to know limits |

---

## Comparison Table

| Feature | CadCraft | Aruct |
|---|---|---|
| Auth | None (local app) | ✅ Firebase |
| Plans / Billing | ❌ Free forever | ✅ Free/Pro/Team |
| Stripe integration | ❌ | ✅ |
| Razorpay (India) | ❌ | ✅ |
| Org workspaces | ❌ | ✅ |
| Admin panel | ❌ | ✅ |
| Audit log | ❌ | ✅ |
| SSO | ❌ | ❌ |
| Seat-based billing | ❌ | ❌ |
