# 12-Month Plugin Roadmap — Aruct Platform

Prioritized by: architectural impact × architect workflow coverage × plan revenue leverage.

Effort key: **S** < 1 week · **M** 1–4 weeks · **L** 1–3 months · **XL** 3+ months

---

## Q1 — Foundation (months 1–3)

Close the critical gaps blocking real project use.

### 1. GLB/glTF Export — `aruct:plugin-glb-export` (Pro) · **M**

**Why first:** Universal handoff format. Every downstream tool (Blender, AR/VR, game engine, Spline,
web viewer) consumes GLB. The gate exists in code; the exporter is not implemented.
High commercial value, relatively low effort.

**Deliverables:**
- Traverse scene graph → generate merged `BufferGeometry` per node kind
- Export to `.glb` using `GLTFExporter` (already in Three.js, already in `packages/viewer` deps)
- Include PBR material slots as `MeshStandardMaterial` with texture references
- Sidebar "Export" button; zip-download for multi-scene
- Pro plan gate: `requiredPlan: 'pro'`

---

### 2. Texture & Material Manager — `aruct:plugin-texture-manager` (Pro) · **L**

**Why Q1:** Clients show scenes in rendered mode. Without real textures, everything looks like
a clay render. This is the #1 first impression gap for Pro users.

See `05-texture-material-plugin.md` for full spec.

**Q1 scope (v1+v2):**
- Texture upload to R2 (albedo, normal, roughness, metalness, AO)
- UV scale/offset/rotation per slot
- Material library (save/apply across scenes)
- Poly Haven texture pack import

---

### 3. Sections & Elevations — `aruct:plugin-sections` (Pro) · **L**

**Why Q1:** Section cuts are a required construction document. Without them, Aruct can't produce
a complete drawing set.

**Deliverables:**
- `section` node type: defines a cut plane (position, normal) placed in 3D
- SectionRenderer: clips scene at cut plane, renders filled sections + visible edges
- `drawing-sheet` integration: sections appear as annotation-ready views
- Elevation view mode (orthographic camera + section at infinity)

---

## Q2 — Modeling Depth (months 4–6)

Add the free-form modeling and documentation tools that separate Pro from basic.

### 4. Mesh Editor — `aruct:plugin-mesh-editor` (Pro) · **XL** (phased)

**Why Q2:** Architects need custom forms that parametric nodes can't produce. Push/pull (extrude)
is the single most important verb.

See `04-mesh-editor-plugin.md` for full spec.

**Q2 scope (v1 only — 6 weeks):**
- `mesh` node type with serializable BufferGeometry
- Vertex + face select + move
- Extrude (push/pull)
- Cube/sphere/cylinder placement primitives

---

### 5. Terrain / Topography — `aruct:plugin-terrain` (Pro) · **L**

**Why Q2:** Real sites have grades. Without terrain, the site is a flat slab.

**Deliverables:**
- `terrain` node: grid-based heightmap (rows × cols × elevation values)
- Terrain tool: paint elevation with sculpt-like brush strokes on 2D floorplan
- Contour line renderer (2D + 3D)
- Import elevation from GeoTIFF or CSV grid
- Cut/fill volume computation vs flat datum
- Site sections cut through terrain + building

---

### 6. Schedules Engine — `aruct:plugin-schedules` (Pro) · **L**

**Why Q2:** Door/window/room schedules are a required CD deliverable.
`drawing-sheet` node already exists; the query engine is missing.

**Deliverables:**
- Schedule query: walk scene graph by node kind, extract parametric fields
- Built-in schedule types: Door Schedule, Window Schedule, Room/Zone Finish Schedule
- Custom schedule: user-defined column → node field mapping
- Render schedule as table on `drawing-sheet`
- Export to CSV and PDF

---

## Q3 — Interoperability (months 7–9)

Connect to the consultant ecosystem. Unblocks professional multi-discipline projects.

### 7. DWG/DXF Import + Export — `aruct:plugin-dwg` (Team) · **XL**

**Why:** Every architect, surveyor, and structural engineer sends DWG.
Without it, Aruct can't enter real project workflows.

**Approach:** Use `dxf-parser` (MIT) for import. For export: generate DXF entities
(LWPOLYLINE, INSERT, DIMENSION) from scene graph. Full native DWG (Teigha/ODA) is a
separate Team-tier feature requiring a commercial library license.

**Deliverables:**
- DXF import: walls, slabs, outlines → `wall`/`slab` nodes (best-effort)
- DXF import: blocks → `item` nodes (unresolved catalog)
- DXF import: dimensions → `construction-dimension` nodes
- DXF/DWG export: produce 2D plan from scene graph
- Team plan gate

---

### 8. Point Cloud — `aruct:plugin-point-cloud` (Team) · **L**

**Why:** Renovation/as-built work starts with a scan. LiDAR is standard on iPhones.

**Deliverables:**
- Parse `.e57` and `.las`/`.laz` point cloud files (use `laz-perf` wasm)
- `point-cloud` node: stores file reference + bounding box + LOD metadata
- WebGPU point renderer: instanced points with color/intensity
- Visibility toggle in floorplan (show as 2D density heatmap)
- Crop box tool to isolate a region
- Team plan gate

---

## Q4 — Advanced (months 10–12)

Power features for top-tier Pro/Team users.

### 9. Offline Render — `aruct:plugin-render` (Pro) · **L**

**Why:** Client presentation quality. Real-time SSGI is good but not Enscape-quality.

**Approach:** Use THREE's `WebGLRenderer` in an offscreen worker + progressive path-tracing
via `three-gpu-pathtracer` (already tested in viewer). Generate high-res PNG/EXR.

**Deliverables:**
- Render job queue (background worker, no UI block)
- Quality presets: Draft (32 samples), Standard (256), High (1024)
- Camera presets per saved camera position
- Downloadable PNG (2K/4K)
- Environment HDRI selector
- Denoiser (OIDN wasm)

---

### 10. Curtain Wall System — `aruct:plugin-curtain-wall` (Pro) · **L**

**Why:** Major element in commercial architecture.
Current `wall` node handles opaque loadbearing only.

**Deliverables:**
- `curtain-wall` node: span, height, grid (X mullion spacing, Y floor-to-floor)
- Panel types: glazing, spandrel, opaque panel, vent panel
- Frame profiles: mullion/transom width + depth
- Corner conditions: butt joint, mitre, fin
- IFC export as `IfcCurtainWall`

---

### 11. Energy Analysis — `aruct:plugin-energy` (Team) · **XL**

**Why:** Code compliance and sustainability reporting are increasingly required.

**Approach:** Use EnergyPlus via WASM or call an energy API (Ladybug Tools Cloud)
with scene geometry converted to a simplified thermal model.

**Deliverables:**
- Zone-level thermal properties (U-value per wall layer, glazing SHGC)
- Annual energy use index (EUI) estimate
- Monthly heating/cooling load chart
- Compliance target overlay (ASHRAE 90.1 / ECBC)
- Export to GreenBuildingXML (.gbXML)

---

### 12. Mesh Editor v2 (Pro) · **M**

Complete the mesh editor (Q2 shipped v1 — vertex/face/extrude):
- Edge select + slide, edge loops
- Loop cut
- Bevel (edges + vertices)
- Boolean union/subtract/intersect (via `three-bvh-csg`)
- GLB → editable mesh conversion

---

## Summary Table

| # | Plugin | Plan | Category | Q | Effort |
|---|---|---|---|---|---|
| 1 | GLB Export | Pro | export | Q1 | M |
| 2 | Texture Manager | Pro | materials | Q1 | L |
| 3 | Sections & Elevations | Pro | documentation | Q1 | L |
| 4 | Mesh Editor v1 | Pro | modeling | Q2 | M (scoped) |
| 5 | Terrain | Pro | modeling | Q2 | L |
| 6 | Schedules Engine | Pro | documentation | Q2 | L |
| 7 | DWG/DXF | Team | interop | Q3 | XL |
| 8 | Point Cloud | Team | interop | Q3 | L |
| 9 | Offline Render | Pro | rendering | Q4 | L |
| 10 | Curtain Wall | Pro | modeling | Q4 | L |
| 11 | Energy Analysis | Team | analysis | Q4 | XL |
| 12 | Mesh Editor v2 | Pro | modeling | Q4 | M |

---

## Free Improvements (no gating, any quarter)

These should ship alongside plugin work — they widen the user base and reduce support burden:

| Item | Effort | Quarter |
|---|---|---|
| OBJ/FBX/glTF geometry import (no catalog required) | M | Q1 |
| Text + leader annotation on sheets | M | Q1 |
| Version history UI (scene checkpoints) | M | Q2 |
| Room area rollup from zone nodes | S | Q2 |
| Keyboard shortcut customization | S | Q2 |
| Measurement → CSV export | S | Q1 |

---

## Resource Model

One senior full-stack engineer + one 3D specialist can deliver this roadmap.
Each quarter: 1 large feature (L) + 1–2 medium features (M).
XL features (DWG, Energy) each consume a full quarter for one engineer.

Q1 is the highest-leverage quarter: GLB export, textures, and sections together
transform the platform from "impressive demo" to "can produce a real drawing set."
