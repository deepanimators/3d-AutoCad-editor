# Admin Dashboard — Investigation & Implementation

## Problem

Admin dashboard (`/admin`) existed as read-only table. No way to edit user plans, roles, or subscription status. No Plans or Roles/RBAC pages existed.

---

## What Was Built

### Pages created

| Route | File | Purpose |
|---|---|---|
| `/admin` | `apps/editor/app/admin/page.tsx` | User table with inline editing |
| `/admin/plans` | `apps/editor/app/admin/plans/page.tsx` | Feature gate matrix + user counts per plan |
| `/admin/roles` | `apps/editor/app/admin/roles/page.tsx` | RBAC matrix + admin/user tables |

### Inline editing components

`apps/editor/app/admin/admin-client.tsx` — client component, no page reload needed:

- **`PlanSelect`** — dropdown: free / pro / team. Color-coded badges. Auto-saves on change.
- **`StatusSelect`** — dropdown: free tier / active / trialing / past_due / canceled. Handles NULL (free tier = no Stripe record).
- **`RoleSelect`** — dropdown: user / admin. Orange highlight for admin.
- **`ImpersonateButton`** — signs admin into any user account for debugging. Calls `/api/admin/impersonate`.

All selects call `PATCH /api/admin/users/[id]` with `{ role?, plan?, subscriptionStatus? }`.

### API route

`apps/editor/app/api/admin/users/[id]/route.ts`

- Auth: verifies session + checks `role === 'admin'`
- Schema validates with Zod: role / plan / subscriptionStatus enums
- Updates `users` table via Drizzle ORM
- Returns updated row

### Impersonation route

`apps/editor/app/api/admin/impersonate/route.ts`

- Admin only
- Takes `{ userId }`, creates Firebase custom token for that user
- Client (`ImpersonateButton`) signs in with token, creates session cookie, redirects to `/`

---

## Sidebar navigation

`apps/editor/components/app-sidebar.tsx` — admin-only nav items:

```
/admin          Admin Dashboard
/admin/roles    Roles & RBAC
/admin/plans    Plans
/admin/audit    Audit Log
```

Admin items render in orange. Hidden for non-admin users via `user.role === 'admin'` check.

---

## Plans page (`/admin/plans`)

- DB query: `GROUP BY users.plan` → user count per plan
- Feature gate matrix: Free / Pro / Team × 7 features (scene limit, GLB, IFC, sharing, MCP, realtime collab)
- Prices: Free $0 / Pro $19/mo / Team $49/mo
- Link to `lib/feature-gates.ts` for code reference

## Roles page (`/admin/roles`)

- Parallel DB queries: `role = 'admin'` + `role = 'user'` lists
- Role summary cards with counts
- RBAC permission matrix (user vs admin columns, 11 permissions)
- Two `AdminClient` tables: Admins section + Users section (both with inline editing)

---

## Status "free tier" root cause

All users show "free tier" because `subscriptionStatus IS NULL`. Stripe webhooks were never triggered (no real payments). Admin can now manually set subscription status via `StatusSelect` dropdown as a workaround until Stripe is live.
