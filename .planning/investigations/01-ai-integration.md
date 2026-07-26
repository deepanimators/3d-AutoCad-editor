# AI Integration — Investigation

## Summary

Aruct Editor has **no embedded LLM**. Instead it implements the server side of MCP (Model Context Protocol). External AI tools connect to this server and drive the 3D scene through 99 exposed tools.

---

## Architecture

```
User AI client (Claude Desktop / Cursor / any MCP host)
        │
        │  MCP protocol  (HTTP or stdio)
        ▼
packages/mcp   ← Aruct MCP server
        │
        │  scene-api calls
        ▼
packages/core  ← scene graph (nodes, store, event bus)
        │
        ▼
packages/viewer ← Three.js WebGPU renderer
```

**Key files:**
- `packages/mcp/src/server.ts` — MCP server bootstrap
- `packages/mcp/src/tools/index.ts` — registers all 99 tools
- `packages/mcp/src/prompts/from-brief.ts` — `from_brief` orchestration prompt
- `packages/mcp/src/resources/` — catalog, scene snapshots

---

## Natural Language → 3D Scene Pipeline

Already built. Steps:

1. **User types brief** into connected AI client  
   _"Build a 2-bedroom house with open kitchen and garden"_

2. **`from_brief` prompt** fires  
   System prompt in `packages/mcp/src/prompts/from-brief.ts` tells the LLM which tools to call and in what order.

3. **`create_house_from_brief` tool**  
   `packages/mcp/src/tools/templates/create-house-from-brief.ts`  
   Selects template (garden-house / two-bedroom / empty-studio) based on `bedroomCount` and `rooms[]`. Returns a scene patch.

4. **`apply_patch` tool** applies the diff to the live scene graph.

5. **`place_item` tool** furnishes rooms from the 27-item built-in catalog  
   (`packages/mcp/src/tools/asset-catalog.ts` — sofas, beds, kitchen cabinets, bathroom fixtures, etc.)

6. **Scene saved** via `scene-lifecycle` tools (save/load/rename/delete).

### Vision pipeline (photo → scene)

| Tool | Input | Output |
|---|---|---|
| `analyze_floorplan_image` | Floor plan image | Wall segments, room labels, dimensions |
| `analyze_room_photo` | Room photo | Fixture positions, window placement, dimensions |
| `photo_to_scene` | Any architectural image | Full scene graph (orchestrates vision + patch) |

Vision uses MCP's **sampling** mechanism — the host LLM handles the vision API call; the MCP server sends a `CreateMessage` request with the image and gets back structured JSON.

---

## AI Feature Subscription Limits

Current gate in `apps/editor/lib/feature-gates.ts`:
- `canUseMCP` — Pro+ only

### Recommended limits to add

| Feature | Free | Pro ($19/mo) | Team ($49/mo) |
|---|---|---|---|
| Scenes | 5 | Unlimited | Unlimited |
| MCP / AI tools access | ✗ | ✓ | ✓ |
| AI scene generations / month | 0 | 20 | Unlimited |
| Vision (photo → scene) / month | 0 | 5 | Unlimited |
| GLB export | ✗ | ✓ | ✓ |
| IFC export | ✗ | ✗ | ✓ |
| Realtime collaboration | ✗ | ✗ | ✓ |
| Shared team asset library | ✗ | ✗ | ✓ |

**Implementation:** Add `aiGenerationsThisMonth` and `visionCallsThisMonth` counters to `users` table. Increment in MCP tool middleware. Enforce in `feature-gates.ts`.

---

## Shared Objects in Team Spaces

### Concept

A team member uploads a custom GLB object → it becomes available in the MCP asset catalog for all team members → any teammate's AI session can `place_item` with it.

### What to build

1. **DB table**
   ```sql
   CREATE TABLE custom_items (
     id          TEXT PRIMARY KEY,
     workspace_id TEXT NOT NULL,
     uploaded_by  TEXT NOT NULL REFERENCES users(id),
     name         TEXT NOT NULL,
     glb_url      TEXT NOT NULL,
     thumbnail_url TEXT,
     tags         TEXT[],
     created_at   TIMESTAMPTZ DEFAULT now()
   );
   ```

2. **Upload endpoint** — `POST /api/items/upload`  
   Accept GLB file → store in R2/S3 → write `custom_items` record.

3. **MCP catalog extension** — in `packages/mcp/src/tools/asset-catalog.ts`  
   Load built-in items + DB items scoped to the requesting user's workspace.

4. **Scope rule** — workspace = team plan members sharing a `workspaceId` field on the `users` table (Phase 4 feature).

---

## V-Ray / High-Quality Rendering

### Current renderer

Three.js WebGPU with `MeshStandardNodeMaterial`. Physically based (roughness/metalness). Real-time, looks good, not path-traced.

Material schema already has all PBR properties needed for studio rendering:
- `albedoMap`, `metalnessMap`, `roughnessMap`, `normalMap`, `aoMap`
- `displacementMap`, `emissiveMap`, `bumpMap`, `lightMap`
- `roughness` [0–1], `metalness` [0–1], `emissiveIntensity`, `normalScaleX/Y`

### Options

| Option | Effort | Quality | Cost |
|---|---|---|---|
| Three.js path tracer (`WebGLPathTracer`) | Low — same ecosystem | Good offline renders | Free |
| Export to Blender + Cycles via GLB | Medium — add UI button | Production quality | Free (user needs Blender) |
| Chaos V-Ray Cloud API | Medium — REST call, return image | True V-Ray | Pay-per-render |
| Polyhaven HDRI + improved lighting in-browser | Low | Significant visual jump | Free |
| Enscape / Rhino Render via IFC export | Low — IFC already built | Studio quality | User must own Enscape |

### Recommended path

1. **Ship:** Polyhaven HDRI integration + Three.js path tracer (zero cost, big visual improvement)
2. **Pro feature:** V-Ray Cloud — user submits scene, gets back high-res render; bundle N renders/month in Pro plan
3. **Team feature:** Unlimited V-Ray Cloud renders via workspace credits

The PBR material data translates directly to V-Ray VRmat format. No data loss.
