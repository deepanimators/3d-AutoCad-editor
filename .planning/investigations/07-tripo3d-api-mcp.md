# Investigation 07 — Tripo3D API & MCP Integration

**Date:** 2026-07-26  
**Status:** Complete  
**Trigger:** Determine if Tripo3D can be integrated into Aruct Editor via API or MCP

---

## REST API

### Base URLs (Two Generations Active)

| Version | Base URL | Notes |
|---------|----------|-------|
| v2 (stable) | `https://api.tripo3d.ai/v2/openapi` | Official docs, most examples target this |
| v3 (current) | `https://openapi.tripo3d.ai/v3` | Used by JS SDK; China mirror: `https://openapi.tripo3d.com/v3` |

For new integrations use **v3** (targeted by the official JS SDK).

### Authentication

```
Authorization: Bearer YOUR_TRIPO_API_KEY
Content-Type: application/json
```

- API keys generated at: https://platform.tripo3d.ai/api-keys
- Keys use `tsk_` prefix
- **Cannot be retrieved after initial generation** — store immediately
- Env var convention: `TRIPO_API_KEY`

### Core v2 Endpoints

All generation requests: `POST https://api.tripo3d.ai/v2/openapi/task`  
Poll results: `GET https://api.tripo3d.ai/v2/openapi/task/{task_id}`

**Text-to-3D:**
```json
POST /v2/openapi/task
{
  "type": "text_to_model",
  "prompt": "A modern architecture chair",
  "negative_prompt": "low quality",
  "model_version": "v2.5"
}
```

**Image-to-3D:**
```json
POST /v2/openapi/task
{
  "type": "image_to_model",
  "image": { "type": "png", "file_token": "<token_from_upload>" },
  "texture_quality": "high",
  "auto_scale": true,
  "face_limit": 50000
}
```

**Poll status:**
```
GET /v2/openapi/task/{task_id}
```
```json
{
  "code": 0,
  "data": {
    "task_id": "abc123",
    "status": "success",
    "output": {
      "model": "https://download-url/model.glb",
      "pbr_model": "https://download-url/model-pbr.glb"
    }
  }
}
```

Task states: `queued` → `processing` → `success` / `failed`  
`"code": 0` = success. SSE supported as alternative to polling on select endpoints.

**⚠️ Warning:** Model download URLs expire ~5 minutes after task completion. Must download and store (e.g., in S3) immediately.

### v3 Endpoints (via JS SDK Method Mappings)

| SDK Method | REST Path |
|------------|-----------|
| `textToModel()` | `POST /generation/text-to-model` |
| `imageToModel()` | `POST /generation/image-to-model` |
| `multiviewToModel()` | `POST /generation/multiview-to-model` |
| `textToImage()` | `POST /generation/text-to-image` |
| `imageToImage()` | `POST /generation/image-to-image` |
| `imageToMultiview()` | `POST /generation/image-to-multiview` |
| `editMultiview()` | `POST /generation/edit-multiview` |
| `textureModel()` | `POST /models/texture` |
| `convertModel()` | `POST /models/convert` |
| `segmentMesh()` | `POST /mesh/segment` |
| `completeMesh()` | `POST /mesh/complete` |
| `decimateMesh()` | `POST /mesh/decimate` |
| `rigCheck()` | `POST /animations/rig-check` (free) |
| `rigModel()` | `POST /animations/rig` |
| `retargetAnimation()` | `POST /animations/retarget` |

### API Pricing (pay-as-you-go, no free tier)

1 credit = $0.01 USD. API credits are **separate** from consumer plan credits.

| Operation | Credits | USD |
|-----------|---------|-----|
| Text-to-3D (no texture) | 10 | $0.10 |
| Text-to-3D (standard texture) | 20 | $0.20 |
| Image-to-3D (no texture) | 20 | $0.20 |
| Image-to-3D (standard texture) | 30 | $0.30 |
| Texture (standard) | 10 | $0.10 |
| Texture (HD) | 20 | $0.20 |
| Texture (8K Ultra) | 30 | $0.30 |
| Format conversion (basic) | 5 | $0.05 |
| Format conversion (advanced) | 10 | $0.10 |
| Auto Rig | 25 | $0.25 |
| Animation Retarget | 10/animation | $0.10 |
| Segmentation | 40 | $0.40 |
| Rig Check | 0 | Free |

### Model Versions

`P1`, `H3` (H3.1), `H2`, `Turbo-v1.0`, `v1.4`, `v2.5`, `v2.5-20250123`, `v3.0`, `v3.1`  
JS SDK constants: `ModelVersion.H3_1 = 'v3.1-20260211'`, `ModelVersion.P1 = 'P1-20260311'`

---

## JavaScript / TypeScript SDK

**Package:** `@vastai/tripo-sdk`  
**Install:** `npm install @vastai/tripo-sdk`  
**GitHub:** https://github.com/VAST-AI-Research/tripo-js-sdk  
**Runtime:** Node.js ≥18, Bun, Deno, modern browsers, edge runtimes  
**Zero runtime dependencies** (uses platform `fetch`). ESM-first with full TypeScript typings.

```typescript
import { TripoClient, ModelVersion } from '@vastai/tripo-sdk'

const client = new TripoClient({ apiKey: process.env.TRIPO_API_KEY })

// Submit + wait in one call
const result = await client.run(
  client.textToModel,
  { prompt: 'A modern concrete chair', modelVersion: ModelVersion.H3_1 },
  { pollingIntervalMs: 2000, timeoutMs: 120_000 }
)

console.log(result.output.model) // GLB download URL (expires in ~5min — download immediately)
```

**Error types:** `TripoAPIError`, `TripoTaskError`, `TripoTimeoutError`, `TripoRequestError`

**Python SDK:** `pip install tripo3d` (v0.4.2, async with context manager support)

---

## MCP Servers

### Official: `tripo-mcp` by VAST-AI-Research

**GitHub:** https://github.com/VAST-AI-Research/tripo-mcp  
**Stars:** ~188 | **License:** MIT | **Status:** Alpha  
**Install:** `pip install tripo-mcp` or `uvx tripo-mcp`

```json
{
  "mcpServers": {
    "tripo-mcp": {
      "command": "uvx",
      "args": ["tripo-mcp"]
    }
  }
}
```

**Current limitation:** Requires Blender + Tripo Blender Addon running locally. Currently only exposes Blender workflow — not a standalone API wrapper.

**What it does:** Accept natural language → generate 3D model → import into Blender automatically.

### Community: `tripo-ai-mcp-server` by pasie15

**GitHub:** https://github.com/pasie15/tripo-ai-mcp-server  
**Install:** `npm install -g tripo-ai-mcp-server`  
**Env var:** `TRIPO_API_SECRET`  
**No Blender dependency** — direct REST API wrapper.

**12 exposed MCP tools:**

| Tool | Description |
|------|-------------|
| `text_to_3d` | Generate model from text prompt |
| `image_to_3d` | Generate from image (path, URL, or token) |
| `multiview_to_3d` | Generate from multiple view images |
| `get_task_status` | Poll task progress, get output URLs |
| `upload_file` | Upload image, receive reusable token |
| `refine_model` | Enhance draft quality |
| `animate_prerigcheck` | Check rigging suitability |
| `rig_model` | Prepare model for animation |
| `retarget_animation` | Apply preset animations |
| `stylize_model` | Apply styles (lego, voxel, voronoi, minecraft) |
| `convert_model` | Export to GLTF, FBX, OBJ, STL, USDZ, 3MF |
| `texture_model` | Generate new textures with optional guidance |

**Compatible with:** Claude Desktop, Claude Code, Cursor, any MCP client.

### MCP Directory Listings
- PulseMCP: https://www.pulsemcp.com/servers/vast-ai-tripo-3d
- mcpservers.org: https://mcpservers.org/servers/VAST-AI-Research/tripo-mcp

---

## Integration Strategy for Aruct Editor

### Option A: Direct REST API (Recommended for server-side generation)
Use `@vastai/tripo-sdk` in a Next.js API route. User submits text/image → server calls Tripo → immediately downloads GLB to S3 → returns S3 URL to client. Covers the URL expiry problem.

### Option B: Community MCP Server in Claude Code
Install `tripo-ai-mcp-server` as an MCP tool in the editor's AI assistant. Enables natural language → 3D model generation without Blender dependency.

### Option C: Gallery Scraping + S3 Cache
Scrape the public gallery (no documented API) → download free GLB files → store in S3 with metadata → serve from Aruct's global model catalog. Attribution (CC BY 4.0) must be preserved.

**See also:** [09-global-model-catalog-architecture.md](./09-global-model-catalog-architecture.md)

---

## Key Links

| Resource | URL |
|----------|-----|
| API Docs (v2) | https://platform.tripo3d.ai/docs/general |
| API Docs (alt) | https://docs.tripo3d.ai/get-started/introduction.html |
| API Key Generation | https://platform.tripo3d.ai/api-keys |
| Developer Pricing | https://developers.tripo3d.ai/en/pricing |
| Official MCP | https://github.com/VAST-AI-Research/tripo-mcp |
| Community MCP | https://github.com/pasie15/tripo-ai-mcp-server |
| JS SDK | https://github.com/VAST-AI-Research/tripo-js-sdk |
| JS SDK (npm) | https://www.npmjs.com/package/@vastai/tripo-sdk |
| Python SDK (PyPI) | https://pypi.org/project/tripo3d/ |
| Model Gallery | https://studio.tripo3d.ai/3d-model-gallery/ |
| OpenAPI Schema | https://platform.tripo3d.ai/docs/schema |
