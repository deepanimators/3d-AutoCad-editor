# Investigation 08 — Free 3D Model Marketplaces with API Access

**Date:** 2026-07-26  
**Status:** Complete  
**Trigger:** Evaluate free model sources for global catalog ingestion in Aruct Editor (search + import + S3 cache)

---

## Comparison Table

| Platform | API | Auth | Free Models | GLB/GLTF | Search Endpoint | MCP Server |
|----------|-----|------|-------------|----------|-----------------|------------|
| **Sketchfab** | ✅ Public, documented | OAuth2 or API Token (account required) | 1M+ (CC0, CC BY etc.) | ✅ GLB + GLTF | `GET /v3/models?q=…&downloadable=true&license=cc0` | ✅ `gregkop/sketchfab-mcp-server` |
| **Poly Haven** | ✅ Open, no key | User-Agent header only | ~500 (all CC0) | ✅ GLTF bundle | `GET /assets?type=models` | Partial (via BlenderMCP) |
| **Poly Pizza** | ✅ v1.1, documented | API token (free tier) | 10,500+ (CC0/CC BY) | ✅ GLTF | keyword + category filter | ✅ `MatthewHallCom/Poly-Pizza-MCP` |
| **Fab.com** | ❌ No public API yet | N/A | Yes (web only) | Yes (web only) | None | No |
| **TurboSquid** | ⚠️ Seller/publisher only | API key (apply) | 30,000+ | Unconfirmed | None for consumers | No |
| **CGTrader** | ⚠️ Apply required | OAuth2 (manual approval) | 154,000+ | Unconfirmed | `GET /v1/models` | No |
| **Smithsonian 3D** | ✅ Via EDAN + Sketchfab | api.data.gov free key | 3,500+ (CC0) | ✅ GLB/GLTF | EDAN search + Sketchfab UID | Partial (metadata only) |
| **KitBash3D** | ❌ Desktop app (Cargo) | N/A | 480+ (Cargo app) | Not via API | N/A | No |
| **Thingiverse** | ✅ Documented | OAuth2 / API key | Millions (CC) | ❌ STL/OBJ only | `GET /v2/search/:term` | ✅ Thingiverse MCP |
| **Three.js CDN** | N/A (static files) | None | ~20 demo models | ✅ GLB | N/A | No |

---

## Platform Details

### 1. Sketchfab — Best Overall Option

Most mature, largest catalog, GLB-native, has an MCP server.

**Base URL:** `https://api.sketchfab.com/v3`  
**Docs:** https://sketchfab.com/developers/data-api/v3

**Search free downloadable models:**
```
GET /v3/models
  ?q=chair
  &downloadable=true
  &license=cc0              # cc0 | by | by-sa | by-nd | free-st
  &sort_by=-likeCount       # or -viewCount, -createdAt
  &count=24                 # max 24 per page
  &cursor=<next>            # cursor-based pagination
```

**Download flow (2 steps):**
1. Search → get model `uid`
2. `GET /v3/models/{uid}/download` with `Authorization: Bearer {token}` → returns:
```json
{ "gltf": { "url": "https://…", "size": 45388265, "expires": 300 } }
```

**⚠️ URL expires in 300 seconds** — must download immediately and store in S3.

**Auth:** Every end-user must authenticate with their own Sketchfab account (OAuth2). No anonymous bulk download. Exception: organizations can request bulk access by contacting Sketchfab directly.

**Formats via API:** GLB, GLTF, USDZ only (no FBX/OBJ through API).

**Rate limits:** Not publicly documented. No hammering.

**Status:** Sketchfab is migrating to Fab.com (Epic). Download API stays live until Fab ships an equivalent. No Fab public API as of mid-2026.

**MCP:** `gregkop/sketchfab-mcp-server` — tools: `sketchfab-search`, `sketchfab-model-details`, `sketchfab-download`. Requires `SKETCHFAB_API_KEY`.

---

### 2. Poly Haven — Best for Architecture Assets (No Auth)

Zero friction, zero auth, all CC0. Smaller catalog (~500 models) but high-quality PBR-ready assets with proper textures. Very relevant for architecture (furniture, props, etc.).

**Base URL:** `https://api.polyhaven.com`  
**Docs:** https://polyhaven.com/our-api  
**GitHub:** https://github.com/Poly-Haven/Public-API

**List all models:**
```
GET /assets?type=models
```
Returns: `{ "horse_statue_01": { "name": "…", "categories": […], "tags": […] } }`

**Get download links:**
```
GET /files/{id}
```
Returns:
```json
{
  "gltf": {
    "4k": { "gltf": { "include": { "url": "https://dl.polyhaven.com/…", "size": … } } },
    "2k": { … },
    "1k": { … }
  },
  "fbx": { … },
  "usd": { … }
}
```

**Auth:** None — but `User-Agent: YourApp/1.0` header is **required and enforced**.

**Attribution:** Must display "Powered by Poly Haven" in UI when using live API in a product.

**⚠️ GLB note:** Downloads are `.gltf` + `.bin` + textures bundle (not a single `.glb`). Need to either serve the bundle or convert to GLB during ingestion.

---

### 3. Poly Pizza — Best for Low-Poly / Placeholder Assets

10,500+ low-poly models. Great for placeholder geometry while designing.

**API:** v1.1 at `https://poly.pizza`  
**Docs:** https://poly.pizza/docs/api/v1.1

**Auth:** API token required (free for hobby, paid for commercial). Self-service at poly.pizza.

**Key difference from Sketchfab:** App holds the API token (not per-user OAuth). Simpler auth flow.

**Search by keyword:**
```
GET /api/search?q=chair&format=gltf
X-Api-Key: {token}
```

**Categories:** Food & Drink, Furniture & Decor, Buildings/Architecture, Objects, Nature, etc.

**Licenses:** CC0, CC BY, CC BY-SA, CC BY-ND, CC BY-NC variants

**MCP:** 
- `MatthewHallCom/Poly-Pizza-MCP` — tools: `search_models`, `search_models_by_keyword`, `get_model`, `get_list`
- `HaD0Yun/poly-pizza-mcp` — Unity-focused, search + auto-import into Unity

---

### 4. Smithsonian 3D Digitization

3,500+ CC0 museum artifacts in GLB/GLTF. Models hosted on Sketchfab under Smithsonian account.

**Primary access path:** Sketchfab API with `user=Smithsonian&license=cc0`.

**EDAN API** (for metadata search):
```
GET https://edan.si.edu/openaccess/api/...
```
Requires free api.data.gov API key. Returns Sketchfab UIDs → then use Sketchfab Download API.

**Bulk mirror:** Harvard Library Innovation Lab mirrored the full S3 bucket at `source.coop/harvard-lil/smithsonian-open-access`.

---

### 5. Not Viable (For Now)

| Platform | Reason |
|----------|--------|
| **Fab.com** | No public API as of mid-2026. Epic promised one in 2025 — not shipped. |
| **TurboSquid** | API is publisher/seller-only. No consumer search or download endpoints. |
| **CGTrader** | Requires manual approval for OAuth2 credentials. Primarily sales-focused. |
| **KitBash3D** | Desktop Cargo app only — no web/programmatic access. |
| **Thingiverse** | API exists + MCP server exists, but formats are STL/OBJ (3D printing, not GLB/GLTF). |

---

## MCP Servers for Model Search

| MCP Server | Platform | Install | Tools |
|------------|----------|---------|-------|
| `gregkop/sketchfab-mcp-server` | Sketchfab | npm, `SKETCHFAB_API_KEY` | search, model-details, download (glb/gltf/usdz) |
| `MatthewHallCom/Poly-Pizza-MCP` | Poly Pizza | npm, `POLYPIZZA_AUTH_TOKEN` | search, get-model, get-list |
| `HaD0Yun/poly-pizza-mcp` | Poly Pizza | npm | search + Unity import |
| `molanojustin/smithsonian-mcp` | Smithsonian EDAN | npm, api.data.gov key | collection metadata (no 3D download tools) |

---

## Ingestion Strategy for Aruct Global Catalog

### Tier 1: Background Bulk Ingestion (No User Auth)

Sources that allow anonymous / app-key downloads — ingest automatically:

**Poly Haven** (~500 CC0 models, high quality)
- Fetch `GET /assets?type=models` → iterate all model IDs
- Fetch `GET /files/{id}` → download 2k GLTF bundle → convert to GLB → upload to S3
- Insert `global_models` row with `source = 'polyhaven'`, `license = 'CC0'`
- Attribution: "Powered by Poly Haven" in UI

**Poly Pizza** (~10,500 CC0/CC-BY models)
- App holds Poly Pizza API token
- Crawl category by category → download GLTF → upload to S3
- Attribution: per model if CC BY (embedded in metadata)

### Tier 2: User-Triggered OAuth Import (Sketchfab)

User connects Sketchfab account via OAuth in Aruct settings → searches Sketchfab → clicks import:

1. User's OAuth token used for `GET /v3/models/{uid}/download`
2. Server downloads GLB immediately (URL expires 300s) → uploads to S3
3. `global_models` row inserted with `added_by = user.id`
4. All future users see the cached version (no Sketchfab auth needed)
5. First importer gets the "New" tag on the model card

### Deduplication

```sql
-- Before any download, check if already ingested
SELECT id FROM global_models WHERE source = $1 AND source_id = $2;
```

If found → return existing record. No re-download, no duplicate S3 object.

---

## License Policy for Global Catalog

**Ingest only CC0 and CC BY 4.0.** Store attribution string in `global_models.attribution`.

| License | Attribution Required | Commercial OK | Ingest? |
|---------|---------------------|---------------|---------|
| CC0 | No | Yes | ✅ Yes |
| CC BY 4.0 | Yes (store + display) | Yes | ✅ Yes |
| CC BY-NC 4.0 | Yes | **No** | ⚠️ Only if non-commercial |
| Sketchfab Standard | No | Yes | ✅ If downloaded per ToS |
| CC BY-ND | Yes | Yes (no derivatives) | ⚠️ Can't re-encode/convert |

---

## Key Sources

| Resource | URL |
|----------|-----|
| Sketchfab Download API | https://sketchfab.com/developers/download-api |
| Sketchfab Data API v3 | https://sketchfab.com/developers/data-api/v3 |
| Sketchfab Developer Guidelines | https://sketchfab.com/developers/guidelines |
| Poly Haven API | https://polyhaven.com/our-api |
| Poly Haven Public API (GitHub) | https://github.com/Poly-Haven/Public-API |
| Poly Pizza API docs | https://poly.pizza/docs/api/v1.1 |
| Poly Pizza MCP | https://github.com/MatthewHallCom/Poly-Pizza-MCP |
| Sketchfab MCP server | https://github.com/gregkop/sketchfab-mcp-server |
| Smithsonian Open Access | https://www.si.edu/openaccess |

**See also:** [09-global-model-catalog-architecture.md](./09-global-model-catalog-architecture.md)
