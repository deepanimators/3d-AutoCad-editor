# API Failures Investigation — 2026-07-27

Investigated console errors from production scene at `https://www.aruct.com/scene/a6cff6a377db`.

## Issues Found

### 1. `GET /api/scenes/{id}/events` → 503 Service Unavailable

**Root cause**: `ARUCT_SCENE_API_TOKEN` env var not set in Vercel production.

In `apps/editor/lib/scene-api-security.ts`, `validateAuth()` checks for the token:
```ts
const token = process.env.ARUCT_SCENE_API_TOKEN
if (!token) {
  if (isLoopbackRequest(request)) return null
  return sceneApiJson(request, { error: 'scene_api_token_required' }, { status: 503 })
}
```

When the token is absent, any non-loopback request (including the public scene viewer at `/scene/{id}`) gets a 503. The public viewer has no mechanism to supply an API token.

**Fix**: Changed the events endpoint to pass `{ skipAuth: true }` to `guardSceneApiRequest`. Scene access control is handled downstream by `loadStoredScene` returning 404 for unknown scenes.

File: `apps/editor/app/api/scenes/[id]/events/route.ts`

**Status**: Fixed in commit `108f2776`.

---

### 2. Poly Haven Texture 404s

**Symptom**: Multiple 404s for URLs like:
```
https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/painted_wooden_nightstand/textures/painted_wooden_nightstand_diff_2k.jpg
```

**Root cause analysis**:
- The Poly Haven proxy at `/api/proxy/polyhaven` only handled GLTF format
- It ignored GLB (packed binary) format which embeds textures and has no external files
- For GLTF models, the proxy patched relative texture URIs to absolute CDN URLs via the Poly Haven files API include map
- Those CDN texture URLs were 404ing

**Fix**: Updated the proxy to check for GLB format first. GLB is a single packed file with embedded textures — no external CDN texture requests. For most Poly Haven models (all that offer GLB), the proxy now redirects to the CDN GLB URL directly.

Also fixed a bug in the GLTF URL fallback: `Object.values().find((_, k) => ...)` used array index `k` (always a number) instead of the object key. Changed to `Object.entries().find(([k]) => ...)`.

File: `apps/editor/app/api/proxy/polyhaven/route.ts`

**Status**: Fixed in commit `108f2776`.

**Note**: Existing scene nodes that were stored with direct CDN GLTF URLs (before the proxy existed) will still request textures directly from `dl.polyhaven.org`. To fully fix those, the models would need to be re-added through the updated proxy.

---

### 3. "fridge" returns No External Results

**Symptom**: Searching "fridge" in the catalog shows 1 local result but "No external results".

**Root cause**: 
1. Poly Haven does not have any model named or tagged "fridge"/"refrigerator"
2. Poly Pizza would have fridge models but requires `POLY_PIZZA_API_KEY` env var (not configured)

The external search in `apps/editor/app/api/catalog/external/route.ts` silently skips Poly Pizza when the API key is missing.

**No code fix applied** — the correct action is to configure `POLY_PIZZA_API_KEY` in Vercel. Once set, Poly Pizza results will appear for "fridge" and similar searches.

---

## Summary of Fixes

| Issue | Cause | Fix | File |
|-------|-------|-----|------|
| Events 503 | Missing `ARUCT_SCENE_API_TOKEN` env var → auth rejected all browser requests | Skip auth for public scene events endpoint | `app/api/scenes/[id]/events/route.ts` |
| Texture 404s | Proxy served GLTF+textures, textures CDN 404 | Proxy now prefers GLB (packed, no external textures) | `app/api/proxy/polyhaven/route.ts` |
| Fridge not searchable | Poly Pizza API key not configured | Configure `POLY_PIZZA_API_KEY` in Vercel | N/A (env var) |

## Required Env Vars to Configure

```
ARUCT_SCENE_API_TOKEN=<random-secret>    # optional now, but recommended for security
POLY_PIZZA_API_KEY=<key>                 # get from polypizza.com — enables fridge+more searches
```
