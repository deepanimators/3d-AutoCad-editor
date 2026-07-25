# Auth, RBAC & Subscription — Master Plan

**Platform:** Aruct Editor (`ace.tucnow.in`)  
**Stack:** Next.js 16, React 19, Vercel, SQLite (local), Bun, Turborepo  
**Goal:** Enterprise-grade auth + 3-tier subscription monetisation

---

## Current State

| Area | Status |
|------|--------|
| Auth | None — editor is fully public |
| Scene API security | Static shared token (`ARUCT_SCENE_API_TOKEN`) |
| Database | SQLite (per-server file, no user concept) |
| Billing | None |
| Multi-user | None — all scenes in one bucket |

---

## Target State

```
User signs up → chooses plan → gets role-scoped access → 
pays via Stripe → accesses features gated to their plan → 
scenes owned by user → can share scenes with roles
```

---

## Technology Decisions

### Auth: Firebase Auth ← **chosen by owner**

**Why Firebase Auth:**
- Handles email/password + social login (Google, GitHub, Apple, etc.) out of the box
- Firebase Admin SDK verifies session cookies server-side (no DB round-trip per request)
- Email verification and password reset built-in — no email provider needed for auth flows
- Custom Claims carry `plan` + `role` in JWT — feature gates need no DB query
- Free up to 10k MAU/month (Spark plan); Blaze is $0.0055/MAU above that
- Firebase Console UI for user management (view, disable, delete users)
- RBAC and org logic implemented in your own Neon DB (Firebase has no org concept)
- SSO/SAML available via Firebase on Blaze plan ($0.06/MAU for SSO users)

**Session pattern for Next.js SSR:**
Firebase client SDK → ID Token → `POST /api/auth/session` → Firebase Admin creates session cookie (HTTP-only, 14 days) → middleware verifies cookie via Firebase Admin on every request.

See `02-phase-auth-firebase.md` for full implementation.
The original Better Auth plan is in `02-phase-auth.md` (archived, not implemented).

### Database: Neon Postgres (Serverless)

**Why migrate from SQLite:**
- SQLite is per-process; Vercel runs serverless — each function invocation may get a fresh file (or conflict writes)
- No user ownership possible without a real user table
- Neon is native to Vercel (first-class integration), scales to zero, branching for dev/staging
- Keep SQLite for local-only dev mode with a `DATABASE_URL` toggle

**ORM:** Drizzle — lightweight, type-safe, works with Neon's serverless driver natively.

### Subscriptions: Stripe

- Stripe Checkout for upgrade flows
- Stripe Webhooks for subscription lifecycle events
- Stripe Customer Portal for self-serve plan changes / cancellation
- `stripe` npm package + webhook signature verification

---

## The 3 Subscription Plans

See `plans.md` for full feature matrix. Summary:

| Plan | Price | Target | Scene Limit | Key Gate |
|------|-------|--------|-------------|----------|
| **Free** | $0 | Individuals, trial | 5 scenes | Basic editor only, watermarked exports |
| **Pro** | $29/mo | Professionals, freelancers | Unlimited | GLB export, MCP server, no watermark |
| **Team** | $79/mo/seat | Studios, firms | Unlimited | Collab, team workspace, SSO, IFC export |

---

## RBAC Model

### Platform Roles (assigned per user)

```
admin    — platform superuser, manages all accounts
user     — authenticated user (base role)
```

### Subscription Tiers (determine feature access)

```
free         — default after signup
pro          — Stripe subscription active
team_member  — part of a Team org
team_admin   — manages org members
```

### Scene-Level Permissions (per resource)

```
owner   — full CRUD, can invite collaborators, can delete
editor  — read + write, cannot delete, cannot invite
viewer  — read-only (scene sharing link)
```

### How RBAC resolves

```
canAccess(user, feature) =
  platformRole(user) === 'admin'
  OR subscriptionTier(user) >= requiredTier(feature)

canAccess(user, scene, action) =
  platformRole(user) === 'admin'
  OR scene.ownerId === user.id
  OR scenePermission(user, scene).role covers action
```

---

## Phase Roadmap

| Phase | Name | Outcome | Est. Effort |
|-------|------|---------|-------------|
| **0** | DB Migration | SQLite → Neon Postgres, scene ownership column | 2–3 days |
| **1** | Auth Foundation | Sign up, sign in, sessions, protected routes | 3–4 days |
| **2** | RBAC Enforcement | Scene ownership, API guards, middleware | 2–3 days |
| **3** | Subscriptions | Stripe, plan enforcement, billing portal | 3–4 days |
| **4** | Team / Enterprise | Orgs, SSO, audit logs, admin dashboard | 5–7 days |

**Total:** ~3 weeks for Phases 0–3 (launchable), Phase 4 adds enterprise tier.

---

## Files in This Plan

| File | Contents |
|------|----------|
| `00-overview.md` | This file — decisions and roadmap |
| `plans.md` | Full subscription plan feature matrix |
| `01-phase-db.md` | Phase 0: Database migration (SQLite → Neon Postgres) |
| `02-phase-auth-firebase.md` | Phase 1: Auth — **Firebase Auth (chosen)** |
| `02-phase-auth.md` | Phase 1: Auth — Better Auth (archived alternative) |
| `03-phase-rbac.md` | Phase 2: RBAC enforcement |
| `04-phase-subscriptions.md` | Phase 3: Stripe subscriptions |
| `05-phase-enterprise.md` | Phase 4: Enterprise features |
