# External Search "No Results" — Root Cause Analysis

## Executive Summary

Three distinct problems combine to produce "No external results" in the Items panel search:

| # | Root Cause | Severity | Status |
|---|-----------|----------|--------|
| 1 | Plugin prefs gating blocks logged-in users with default empty `plugin_prefs='[]'` | **Critical** (regression) | Fixed in `apps/editor/app/api/catalog/external/route.ts` |
| 2 | `POLY_PIZZA_API_KEY` not set in Vercel production | **High** | Needs Vercel env var |
| 3 | Poly Haven has no kitchen appliances (no "fridge") | Medium | Data gap, not a bug |

---

## Root Cause 1: Plugin Prefs Gating Regression (Critical)

### What happened
Commit `475deade` added plugin-based gating to `GET /api/catalog/external`. It calls
`getEnabledPlugins(session.pluginPrefs)` and blocks any source whose plugin ID is not in the list.

### Why it breaks
`getEnabledPlugins` (`apps/editor/lib/plugins/catalog.ts:172`) simply parses the JSON array and
returns it. For every user whose `plugin_prefs` column is the schema default `'[]'`, it returns `[]`.
The gating function then blocks BOTH Poly Haven and Poly Pizza:

```typescript
// BROKEN:
const pluginEnabled = (id: string) => enabledPlugins === null || enabledPlugins.includes(id)
// enabledPlugins = [] → includes() always false → all sources blocked for logged-in users
```

### Who is affected
Every logged-in user whose `plugin_prefs` was never explicitly set — i.e., all users who signed up
before the `/plugins` page existed, and all new users before the fix.

### Fix applied
`apps/editor/app/api/catalog/external/route.ts` — free-tier plugins are now accessible by default
regardless of the stored prefs:

```typescript
const isFreePlugin = (id: string) =>
  (PLUGIN_CATALOG.find((p) => p.id === id)?.requiredPlan ?? 'free') === 'free'

const pluginEnabled = (id: string) =>
  enabledPlugins === null ||   // no session → open
  isFreePlugin(id) ||          // free plugins always accessible
  enabledPlugins.includes(id)  // paid plugins need explicit enable
```

`apps/editor/lib/auth-server.ts:upsertUser` — new users now start with free plugins enabled:
```typescript
pluginPrefs: JSON.stringify(['aruct:plugin-polyhaven', 'aruct:plugin-polypizza']),
```

`apps/editor/app/api/auth/session/route.ts:ensureMigrations` — one-time migration updates existing
users whose prefs are `'[]'`:
```sql
UPDATE users SET plugin_prefs = '["aruct:plugin-polyhaven","aruct:plugin-polypizza"]'
WHERE plugin_prefs = '[]'
```

---

## Root Cause 2: POLY_PIZZA_API_KEY Missing in Production (High)

### What happens
`apps/editor/lib/free-sources/poly-pizza.ts:30`:
```typescript
const apiKey = process.env.POLY_PIZZA_API_KEY
if (!apiKey) throw new Error('POLY_PIZZA_API_KEY not set')
```

In local dev, `apps/editor/.env.local` has the key. In Vercel production the variable is missing,
so `fetchPolyPizza()` throws. The `Promise.allSettled` in the external route catches it silently
and adds `'polypizza'` to the `unconfigured` array instead of returning results.

### Impact
Poly Pizza has 10,500+ models covering kitchen appliances, household items, vehicles. "Fridge",
"table", "chair" all return Poly Pizza results — but only in local dev.

### Fix required
Add `POLY_PIZZA_API_KEY` to Vercel environment variables:
1. Open Vercel dashboard → Project → Settings → Environment Variables
2. Add `POLY_PIZZA_API_KEY` with the value from `apps/editor/.env.local` line 33
3. Redeploy

---

## Root Cause 3: Poly Haven Has No Kitchen Appliances (Data Gap)

### What Poly Haven has
Poly Haven (`https://api.polyhaven.com/assets?type=models`) returns ~521 models. Categories include
furniture, seating, props, plants, vehicles, architectural elements. The catalog explicitly excludes
kitchen appliances (fridges, stoves, dishwashers, ovens).

Searching "fridge" in name or tags returns 0 results — by design.

### Impact
Even with the plugin regression and Poly Pizza key fixed, searching "fridge" will return 0 Poly
Haven results. Only Poly Pizza covers kitchen appliances.

### No code fix needed
This is a Poly Haven content decision. Options:
- Accept that Poly Haven is for architectural/furniture; rely on Poly Pizza for kitchen items
- Supplement with another source (Sketchfab, Smithsonian) — see `/apps/editor/.planning/`

---

## Verification Steps (after deploying fixes)

1. Log in as a user with default empty prefs
2. Open Items panel in editor
3. Search "chair" or "table" — should return Poly Haven results
4. Search "fridge" — should return Poly Pizza results (only after `POLY_PIZZA_API_KEY` is set in Vercel)
5. Toggle off Poly Haven in `/plugins` page → search again → Poly Haven results should disappear

---

## File Reference Map

| File | Line | Role |
|------|------|------|
| `apps/editor/app/api/catalog/external/route.ts` | 107-115 | Plugin gating logic (fixed) |
| `apps/editor/lib/plugins/catalog.ts` | 172-179 | `getEnabledPlugins()` — returns empty array for `'[]'` |
| `apps/editor/lib/db/schema.ts` | 21 | `plugin_prefs` column default is `'[]'` |
| `apps/editor/lib/auth-server.ts` | 55-68 | `upsertUser()` — fixed to initialize free plugins |
| `apps/editor/app/api/auth/session/route.ts` | 18-28 | Cold-start migration (added prefs migration) |
| `apps/editor/lib/free-sources/poly-pizza.ts` | 30-31 | API key guard — throws if key missing |
| `apps/editor/lib/free-sources/poly-haven.ts` | 29-36 | Fetches Poly Haven catalog |
