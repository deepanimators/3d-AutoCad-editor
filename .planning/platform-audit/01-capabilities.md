# Current Capabilities — Aruct Platform

## Architecture Overview

Browser-based, WebGPU-native, TypeScript monorepo. Every element is a validated Zod node in a
discriminated union of **47 concrete types**, persisted as a flat serializable scene graph.

**Layer separation:**
- `packages/core` — scene graph, schemas, stores, event bus (zero Three.js)
- `packages/viewer` — WebGPU 3D canvas, cameras, shading, post-processing
- `packages/editor` — tools, panels, floorplan helpers, paint mode, shortcuts
- `packages/nodes` — per-kind renderer, parametrics, floorplan builder, placement tool
- `packages/mcp` — Model Context Protocol server (50+ tools for AI agents)
- `apps/editor` — Next.js app, Firebase Auth, Neon Postgres, Stripe/Razorpay billing

---

## Node Types (47 total)

| Category | Kinds |
|---|---|
| **Hierarchy** | `site`, `building`, `level` |
| **Shell** | `wall` (multi-layer, trim, bands, arcs), `slab`, `ceiling` |
| **Openings** | `door` (10 types incl. garage), `window` (11 types incl. bay/bow) |
| **Vertical circulation** | `stair` (straight/curved/spiral), `stair-segment`, `elevator` |
| **Structural** | `column` (6 styles, 5 cross-sections, Doric/Ionic/Corinthian/Dravidian parametrics), `fence`, `structural-grid` |
| **Roof** | `roof`, `roof-segment` (7 types with CSG boolean) |
| **Roof accessories** | `chimney`, `dormer`, `skylight`, `solar-panel`, `box-vent`, `ridge-vent`, `turbine-vent`, `eyebrow-vent`, `cupola`, `gutter`, `downspout` |
| **Furniture/fixtures** | `item` (GLB catalog), `cabinet`, `cabinet-module`, `shelf`, `zone` |
| **Documentation** | `measurement`, `construction-dimension`, `drawing-sheet`, `guide`, `scan`, `spawn` |
| **HVAC** | `duct-segment`, `duct-fitting`, `duct-terminal`, `hvac-equipment`, `lineset`, `liquid-line` |
| **DWV Plumbing** | `pipe-segment`, `pipe-fitting`, `pipe-trap` |

---

## 3D Modeling Tools

- Registry-driven placement tools for almost every node kind
- `Cmd+drag` translate, `Cmd+Right-drag` rotate (15° snaps), free rotation
- Affordance tools: `move-endpoint`, `move-control-point`, `move-tangent`, `boundary-edit`, `hole-edit`
- Wall/slab/ceiling polygon editing with vertex/edge/midpoint handles
- Spline control-point and tangent editing for fences

---

## 2D Floorplan

- Every node emits `FloorplanGeometry` — walls miter, doors swing, windows grid, zones fill
- Marquee selection: screen-rectangle (3D) and plane-box projected to level floor (2D)
- Quick-measure hover, full measurement drafting
- **`construction-dimension` node:** 8 modes (linear/radius/diameter/center-mark/chord/arc-length/angular/coordinate), datum policies (centerline/wall-face/finish-face), CD-grade
- Structural grid datums, associative anchor re-resolution

---

## Materials & Textures (current)

- **Slot system:** per-node named slots (wall: interior/exterior/band/trim; door: panel/glass; etc.)
- **4 color presets:** clay, white, mono, blueprint — drive per-role tinting
- **Material Paint mode:** click surfaces to apply; Shift cycles scope; Alt erases
- IBL from procedural sky or user-supplied `.hdr`
- **No texture upload, no UV control, no PBR material editor** (major gap)

---

## Lighting

- Directional (shadow-casting, PCF 1024²), hemisphere, ambient
- 9 built-in scene themes: studio, paper, sunset, overcast, blueprint, mediterranean, twilight, night, verdant
- Shadow frustums auto-fit to building bounds every 0.4s
- **Sun Study plugin (Pro):** true solar azimuth/altitude from GPS + date/time

---

## Export Formats

| Format | Status | Plan |
|---|---|---|
| JSON (scene graph) | ✅ Implemented | Free |
| IFC 2x3 STEP | ✅ Implemented | Team |
| BOM / CSV | ✅ Implemented | Any |
| PDF floorplan | ✅ Implemented | Any |
| GLB / glTF | ❌ Gate exists, export not implemented | — |

---

## Import

- IFC → walls, slabs, doors, windows, roofs, stairs, columns (`@aruct/ifc-converter`)
- External models: Poly Haven, Poly Pizza, Tripo3D, Sketchfab, Smithsonian (`POST /api/catalog/import`)
- Vision import via MCP: `analyze_floorplan_image`, `photo_to_scene`
- **No DWG/DXF, no SKP, no OBJ/FBX**

---

## AI / MCP Integration

50+ MCP tools:
- **Read/query:** `get_scene`, `find_nodes`, `get_walls`, `verify_scene`
- **Atomic mutation:** `apply_patch`, `create_wall`, `cut_opening`, `place_item`
- **Compound:** `create_story_shell`, `create_room`, `furnish_room`, `create_house_from_brief`
- **Validation:** `validate_scene`, `check_collisions`
- **AI model generation:** Tripo3D text-to-3D — 50/mo (Pro), 200/mo (Team)

---

## Rendering Pipeline

- **WebGPU TSL** with WebGL2 fallback
- Shading modes: solid (Lambert) + rendered (PBR)
- SSGI + AO, denoising, ink/edge detection, selection outlines
- Sky gradient DataTexture, ACES tone mapping
- First-person walkthrough (BVH capsule controller + baked-GLB)
- 50fps frame limiter

---

## Plugins (current 8)

| Plugin | Plan | Category |
|---|---|---|
| Core Building Elements (`aruct:core`) | Free | core |
| Poly Haven Models | Free | catalog |
| Poly Pizza Models | Free | catalog |
| AI Model Generator | **Pro** | ai |
| Sun & Shadow Study | **Pro** | analysis |
| Bill of Materials | **Pro** | export |
| IFC / BIM Export | **Team** | export |
| Real-Time Collaboration | **Team** | collaboration |

---

## Measurements & BOM

- 5 measurement kinds: distance, angle, area, perimeter, volume
- Free-point or semantic-feature anchors, 2D + 3D
- BOM: walls (lin-m + m²), slabs/ceilings (m²), doors/windows (m²), roofs, stairs, fences, items → CSV

---

## Collaboration (current state)

- Presence system (`/api/collab/presence`, in-memory, no auth — **not production-safe**)
- SSE event stream (`GET /api/scenes/[id]/events`)
- Scene sharing with editor/viewer roles (Pro-gated)
- OT-based sync is beta, single-instance only
