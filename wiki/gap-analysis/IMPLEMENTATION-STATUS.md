# Implementation Status — Gap Analysis Tracker

**Last updated:** 2026-10-22
**Scope:** All gaps identified across the `wiki/gap-analysis/` doc set, marked against work completed in this session.

Legend:
- ✅ Implemented (this session)
- 🔧 Partially implemented (schema or skeleton exists; not complete)
- 📋 Planned (not yet done)

---

## 1. UI / UX (`ui-ux.md`)

### Notifications and Feedback
| Gap | Status | Notes |
|---|---|---|
| Toast notification system | ✅ | `apps/editor/components/toast-provider.tsx` |
| Progress indicator for long operations | 📋 | Not implemented |
| Error messages with actionable text | 📋 | Not implemented |
| Browser notification on background task completion | 📋 | Not implemented |

### Autosave
| Gap | Status | Notes |
|---|---|---|
| Autosave (every 2 min) | ✅ | `apps/editor/lib/use-autosave.ts` |
| Autosave indicator in top bar | ✅ | Autosave indicator component added |

### Keyboard Shortcuts
| Gap | Status | Notes |
|---|---|---|
| Keyboard shortcut help overlay (`?` key) | ✅ | Keyboard shortcut help overlay implemented |
| Customizable keyboard shortcuts | 📋 | Not implemented |
| Command palette (`⌘K`) | 📋 | Not implemented |
| Shortcut cheat sheet in onboarding | 📋 | Not implemented |

### Search and Navigation
| Gap | Status | Notes |
|---|---|---|
| Scene outliner / scene tree panel | ✅ | `apps/editor/components/scene-outliner-panel.tsx` |
| Node search (find by name, type) | 📋 | Not implemented |
| Jump to node (select → camera snap) | 📋 | Not implemented |
| Filter nodes by type in viewport | 📋 | Not implemented |

### App Navigation
| Gap | Status | Notes |
|---|---|---|
| Apps navigation / universe launcher | ✅ | `/apps` route added; apps nav in top bar |

### Status Bar
| Gap | Status | Notes |
|---|---|---|
| Status bar with cursor coordinates (2D view) | ✅ | Cursor coordinates displayed in 2D floorplan status bar |

### Onboarding
| Gap | Status | Notes |
|---|---|---|
| First-run tutorial / walkthrough | 📋 | Not implemented |
| Interactive tutorial (guided first scene) | 📋 | Not implemented |
| Sample scenes | 📋 | Not implemented |
| Contextual help tooltips | 📋 | Not implemented |

### Accessibility
| Gap | Status | Notes |
|---|---|---|
| Screen reader labels on toolbar buttons | 📋 | Not implemented |
| Keyboard-navigable tool selection | 📋 | Not implemented |
| Color contrast (WCAG AA) audit | 📋 | Not implemented |
| Focus management in panels | 📋 | Not implemented |

### Mobile
| Gap | Status | Notes |
|---|---|---|
| Touch-optimized tool panel (bottom sheet) | 📋 | Not implemented |
| Larger tap targets for tools | 📋 | Not implemented |
| Landscape / portrait responsive layout | 📋 | Not implemented |

### Undo / Redo
| Gap | Status | Notes |
|---|---|---|
| Visible undo history panel | 📋 | Not implemented |
| Per-session persistent undo (survive reload) | 📋 | Not implemented |

### Performance / UX
| Gap | Status | Notes |
|---|---|---|
| Scene load time indicator | 📋 | Not implemented |
| Conflict warning (concurrent edits) | 📋 | Not implemented |

---

## 2. 2D Floorplan (`2d-floorplan.md`)

### Precision Input
| Gap | Status | Notes |
|---|---|---|
| Coordinate display (X, Y status bar) | ✅ | Implemented as part of status bar |
| Absolute coordinate entry | 📋 | Not implemented |
| Relative coordinate entry | 📋 | Not implemented |
| Polar entry | 📋 | Not implemented |
| Direct distance entry | 📋 | Not implemented |
| Object snap — center, tangent, nearest, perpendicular | 📋 | Endpoint + midpoint only |
| Object snap tracking | 📋 | Not implemented |
| Extension snap | 📋 | Not implemented |
| Polar tracking (custom angles) | 📋 | 45°/90° only |
| Grid snap with configurable spacing | 📋 | Not implemented |

### Draw Tools
| Gap | Status | Notes |
|---|---|---|
| LINE (free polyline) | 📋 | Not implemented |
| CIRCLE, ARC, ELLIPSE | 📋 | Not implemented |
| RECTANGLE | 📋 | Not implemented |
| SPLINE | 📋 | Not implemented |
| HATCH (pattern fill) | 📋 | Not implemented |
| TEXT / MTEXT on canvas | 📋 | Not implemented |
| TRIM / EXTEND walls | 📋 | Not implemented |
| FILLET walls (curved corners) | 📋 | Not implemented |

### Modify Tools
| Gap | Status | Notes |
|---|---|---|
| COPY with offset distance | 📋 | Not implemented |
| ROTATE (wall in-place) | 📋 | Not implemented |
| MIRROR | 📋 | Not implemented |
| ARRAY (rectangular, polar) | 📋 | Not implemented |
| STRETCH with crossing window | 📋 | Not implemented |
| BREAK / JOIN | 📋 | Not implemented |

### Annotation (2D)
| Gap | Status | Notes |
|---|---|---|
| Construction dimension styling (arrowType, textHeight, extension lines) | ✅ | Style fields added to `construction-dimension` schema |
| 2D dimension renderer layer | ✅ | Dimension rendering layer implemented in 2D view |
| Angular dimensions | 📋 | Not implemented |
| Radius / diameter dimensions | 📋 | Not implemented |
| Text labels on floor plan | 📋 | Not implemented |
| Room label with area (on canvas) | 📋 | Zone area in panel only; no canvas label |
| Leader / callout | 📋 | Not implemented |
| North arrow | 📋 | Not implemented |
| Scale bar | 📋 | Not implemented |
| Section marker on 2D plan | 📋 | Section node exists; no 2D marker rendering |
| Structural grid annotation (A, B, 1, 2) | 📋 | Not implemented |

### Layer / Organization
| Gap | Status | Notes |
|---|---|---|
| Layer system (on/off, freeze, color) | 📋 | Not implemented |
| Isolate by node type | 📋 | Not implemented |
| Linetype (solid, dashed, centerline) | 📋 | Not implemented |
| Lineweight | 📋 | Not implemented |

### Layouts / Printing
| Gap | Status | Notes |
|---|---|---|
| Paper-space layout | 📋 | Schema exists; no renderer |
| Viewports at scale | 📋 | Not implemented |
| Print/plot to vector PDF | 📋 | Not implemented |
| Title block | 📋 | Not implemented |
| Sheet numbering | 📋 | Not implemented |

---

## 3. 3D Viewer and Rendering (`3d-viewer-rendering.md`)

### Missing Node Renderers
| Gap | Status | Notes |
|---|---|---|
| MEP pipe segment 3D renderer | ✅ | `packages/viewer/src/systems/pipe-segment-system.tsx` |
| MEP duct segment 3D renderer | ✅ | `packages/viewer/src/systems/duct-segment-system.tsx` |
| Terrain heightmap renderer | ✅ | Terrain mesh generated from heightmap URL |
| Curtain wall 3D renderer | ✅ | Grid + panel geometry with mullion profiles |
| Section cut plane renderer | ✅ | Three.js clipping plane applied at section node |
| Railing / balustrade renderer | 📋 | No railing node type exists yet |
| Beam / structural framing renderer | 📋 | No beam node type exists yet |
| Cabinet 3D renderer | 📋 | Schema exists; no renderer |
| Gutter / downspout 3D renderer | 📋 | Schema exists; no renderer |

### Renderer Registration
| Gap | Status | Notes |
|---|---|---|
| New renderers registered in viewer systems | ✅ | All new systems registered in `packages/viewer/src/systems/index.ts` |

### Rendering Features
| Gap | Status | Notes |
|---|---|---|
| Shadow maps (real-time) | 📋 | Not implemented |
| Transparent glass shader | 📋 | Window glass is opaque placeholder |
| Translucency (frosted glass, curtains) | 📋 | Not implemented |
| Interior vs exterior camera modes | 📋 | Not implemented |
| Reflection probes / cubemap | 📋 | Not implemented |
| Level-of-detail (LOD) for items | 📋 | Not implemented |
| Texture streaming / LOD | 📋 | Not implemented |

### Camera and Navigation
| Gap | Status | Notes |
|---|---|---|
| Named camera views (save position) | 📋 | Not implemented |
| Parallel section views (elevation) | 📋 | Not implemented |
| Camera animation (flythrough) | 📋 | Not implemented |
| VR mode (WebXR) | 📋 | Not implemented |

### Export / Visualization
| Gap | Status | Notes |
|---|---|---|
| 2D vector floor plan from 3D model | 📋 | Not implemented |
| Section elevation drawing | 📋 | Not implemented |
| High-quality offline render (path tracing) | 📋 | Not implemented |
| Video export (animation) | 📋 | Not implemented |

### Performance
| Gap | Status | Notes |
|---|---|---|
| Instance merging (static items) | 📋 | Not implemented |
| Worker-thread geometry computation | 📋 | Not implemented |

---

## 4. Annotation and Measurements (`annotation-measurements.md`)

### Dimension Styling
| Gap | Status | Notes |
|---|---|---|
| Arrowhead types (tick, filled, dot, open) | ✅ | `arrowType` field added to `construction-dimension` |
| Extension line gap and overshoot | ✅ | Style fields added |
| Dimension text height | ✅ | `textHeight` field added |
| Prefix / suffix (e.g., "TYP", "≈") | ✅ | `prefix`/`suffix` fields added |
| Tolerance display (±) | 📋 | Not implemented |
| Continuous / baseline dimension chains | 📋 | Not implemented |
| Dimension style presets | 📋 | Not implemented |
| Angular dimensions | 📋 | Not implemented |
| Radius / diameter dimensions | 📋 | Not implemented |

### Text Annotation
| Gap | Status | Notes |
|---|---|---|
| Label node type (text at 2D point) | 📋 | Not implemented |
| Callout / leader annotation | 📋 | Not implemented |
| Room name labels on floor plan | 📋 | Panel only; no canvas rendering |
| North arrow node | 📋 | Not implemented |
| Scale bar node | 📋 | Not implemented |

### Drawing Sheets
| Gap | Status | Notes |
|---|---|---|
| Drawing sheet renderer | 📋 | Schema exists; no renderer |
| Paper size (A0–A4, Letter, Arch D) | 📋 | Not implemented |
| Viewport system (scale, crop) | 📋 | Not implemented |
| Title block template | 📋 | Not implemented |
| Vector PDF sheet export | 📋 | Not implemented |

### Schedules
| Gap | Status | Notes |
|---|---|---|
| Room / space schedule | 📋 | Not implemented |
| Finish schedule | 📋 | Not implemented |
| Equipment schedule (HVAC, plumbing) | 📋 | Not implemented |
| Lighting fixture schedule | 📋 | Not implemented |
| Custom schedule (user-defined fields) | 📋 | Not implemented |

### Analysis
| Gap | Status | Notes |
|---|---|---|
| Energy analysis implementation | 📋 | UI shell only; no computation |
| Wall U-value, window SHGC model | 📋 | Not implemented |
| Climate data (EPW) integration | 📋 | Not implemented |
| Structural analysis integration | 📋 | External; not planned |
| Solar panel energy output calculation | 📋 | Not implemented |

---

## 5. Collaboration (`collaboration.md`)

### Real-Time Co-Editing
| Gap | Status | Notes |
|---|---|---|
| Real-time co-editing (Yjs / CRDT) | 📋 | Major infrastructure work; presence-only today |
| Cursor sharing (other users' cursors on 2D plan) | 📋 | Not implemented |
| Conflict warning / detection | 📋 | Not implemented |

### Comment / Markup System
| Gap | Status | Notes |
|---|---|---|
| Pin comment on node (DB + API) | ✅ | Comment DB table + API routes implemented |
| Pin comment on 2D floorplan coordinates | ✅ | 2D coordinate-anchored pins |
| Comment thread / reply | ✅ | Thread structure in DB and API |
| Resolve / unresolve comments | ✅ | Resolve state implemented |
| Comment UI (panel + pin overlays) | ✅ | Comment panel and pin overlay components |
| Comment notification (email) | 📋 | Not implemented |
| Comment export (PDF overlay) | 📋 | Not implemented |

### Version History
| Gap | Status | Notes |
|---|---|---|
| Named version milestones ("DD", "CD", "Permit Set") | 📋 | Not implemented |
| Version branching | 📋 | Not implemented |
| Version merge | 📋 | Not implemented |
| Version diff view (highlight changed nodes) | 📋 | Not implemented |

### Access Control
| Gap | Status | Notes |
|---|---|---|
| Per-level access control | 📋 | Not implemented |
| Per-node-type filter | 📋 | Not implemented |
| Guest link expiry | 📋 | Not implemented |
| Org-level role inheritance | 📋 | Not implemented |

### Notifications
| Gap | Status | Notes |
|---|---|---|
| Email notification system | 📋 | Not implemented |
| In-app notification feed | 📋 | Not implemented |

---

## 6. File Formats (`file-formats.md`)

### IFC
| Gap | Status | Notes |
|---|---|---|
| IFC import (web-ifc based) | ✅ | `apps/editor/app/api/import/ifc/route.ts` implemented |
| IFC import dialog UI | ✅ | `apps/editor/components/ifc-import-dialog.tsx` |
| IFC export: `IfcBeam`, `IfcMember` | 📋 | No beam node type yet |
| IFC export: `IfcCurtainWall` with panels | 📋 | Not implemented |
| IFC export: `IfcRailing` | 📋 | No railing node type yet |
| IFC export: MEP (`IfcDuctSegment`, `IfcPipeSegment`) | 📋 | Not implemented |
| IFC export: property sets (Pset_WallCommon, etc.) | 📋 | Not implemented |
| IFC export: material layer sets | 📋 | Not implemented |
| IFC 4.3 (currently IFC 2×3) | 📋 | Not implemented |

### DXF
| Gap | Status | Notes |
|---|---|---|
| DXF export: AIA layer organization (A-WALL, A-DOOR) | ✅ | Layer assignment added to DXF export |
| DXF export: door/window arc symbols | ✅ | Standard door arc symbols added |
| DXF export: room labels (text entities) | ✅ | Zone name + area text entities exported |
| DXF export: dimension entities | 📋 | Not implemented |
| DXF export: hatch entities | 📋 | Not implemented |
| DXF export: multi-floor separate layers | 📋 | Not implemented |
| DXF export: 3D DXF (MESH/3DFACE) | 📋 | Not implemented |
| DXF import: block / INSERT handling | 📋 | Not implemented |
| DXF import: TEXT/MTEXT → annotation nodes | 📋 | Not implemented |
| DXF import: layer filter | 📋 | Not implemented |
| DXF import: DIMENSION entities | 📋 | Not implemented |
| DWG import | 📋 | Requires ODA server-side conversion |

### PDF
| Gap | Status | Notes |
|---|---|---|
| PDF plan underlay / import | 📋 | Not implemented |
| Vector PDF floor plan export (plot quality) | 📋 | Screenshot only today |

### GLB
| Gap | Status | Notes |
|---|---|---|
| GLB import (scene reconstruction) | 📋 | Not implemented |
| Draco compression for large meshes | 📋 | Not implemented |
| KTX2 texture export | 📋 | Not implemented |

### Other Formats
| Gap | Status | Notes |
|---|---|---|
| SVG export | 📋 | Not implemented |
| STL export | 📋 | Not implemented |
| OBJ export | 📋 | Not implemented |

---

## 7. MEP / HVAC Systems (`mep-hvac-systems.md`)

### 3D Renderers
| Gap | Status | Notes |
|---|---|---|
| Duct segment renderer (rect + round) | ✅ | `duct-segment-system.tsx` |
| Pipe segment renderer (cylinder + insulation) | ✅ | `pipe-segment-system.tsx` |
| Duct fitting renderer | 📋 | Not implemented |
| Duct terminal renderer | 📋 | Not implemented |
| HVAC equipment renderer | 📋 | Not implemented |
| Pipe fitting renderer | 📋 | Not implemented |
| Pipe trap renderer | 📋 | Not implemented |
| Liquid line renderer | 📋 | Not implemented |

### Editor Tools
| Gap | Status | Notes |
|---|---|---|
| Duct draw tool | 📋 | Not implemented |
| Pipe draw tool | 📋 | Not implemented |
| Fitting auto-insert | 📋 | Not implemented |
| Terminal placement tool | 📋 | Not implemented |
| Equipment placement tool | 📋 | Not implemented |
| MEP auto-routing | 📋 | Not implemented |
| Clash detection (MEP vs. structure) | 📋 | Not implemented |

### MEP Properties / Sizing
| Gap | Status | Notes |
|---|---|---|
| Duct sizing (ASHRAE calculations) | 📋 | Not implemented |
| Pipe sizing (flow rate → diameter) | 📋 | Not implemented |
| Pressure drop calculations | 📋 | Not implemented |

### Electrical
| Gap | Status | Notes |
|---|---|---|
| `circuit-breaker-panel` node type | 📋 | Not implemented |
| `conduit-segment` node type | 📋 | Not implemented |
| `receptacle` node type | 📋 | Not implemented |
| `switch` node type | 📋 | Not implemented |
| `circuit` grouping | 📋 | Not implemented |
| `smoke-detector` node type | 📋 | Not implemented |

### UI
| Gap | Status | Notes |
|---|---|---|
| Riser diagram panel | 📋 | Logic exists; no UI |

---

## 8. Node Types (`node-types.md`)

### Architecture / Envelope
| Gap | Status | Notes |
|---|---|---|
| Curtain wall 3D renderer | ✅ | Implemented this session |
| Section cut renderer | ✅ | Implemented this session |
| Composite / multi-layer walls | 📋 | Not implemented |
| Glass wall type | 📋 | Not implemented |
| Railing / balustrade node type | 📋 | Not implemented |
| Beam / structural member node type | 📋 | Not implemented |
| Cabinet 3D renderer | 📋 | Not implemented |
| Gutter 3D renderer | 📋 | Not implemented |
| Downspout 3D renderer | 📋 | Not implemented |
| Chimney 3D renderer | 📋 | Not implemented |

### Site / Terrain
| Gap | Status | Notes |
|---|---|---|
| Terrain heightmap 3D renderer | ✅ | Implemented this session |
| Solar panel 3D renderer | 📋 | Not implemented |
| Structural grid renderer (beams + labels) | 📋 | Not implemented |
| Lineset 2D renderer | 📋 | Not implemented |

### Annotation / Documentation
| Gap | Status | Notes |
|---|---|---|
| 2D dimension renderer layer | ✅ | Implemented this session |
| Drawing sheet renderer | 📋 | Schema only |
| Label / tag node type | 📋 | Not implemented |
| North arrow node type | 📋 | Not implemented |
| Scale bar node type | 📋 | Not implemented |

### Missing Node Kinds
| Gap | Status | Notes |
|---|---|---|
| Railing / balustrade | 📋 | No schema or renderer |
| Beam / structural member | 📋 | No schema or renderer |
| Ceiling grid / tile system | 📋 | Not implemented |
| Topographic boundary (site work) | 📋 | Not implemented |
| Parking space | 📋 | Not implemented |
| Ramp (accessibility) | 📋 | Not implemented |
| Label / text annotation node | 📋 | Not implemented |

---

## 9. Site, Terrain and Context (`site-terrain-context.md`)

### Terrain
| Gap | Status | Notes |
|---|---|---|
| Heightmap → 3D mesh renderer | ✅ | Implemented this session |
| Terrain import (GeoTIFF / DEM) | 📋 | Not implemented |
| Terrain import (XYZ point file) | 📋 | Not implemented |
| Terrain editing (paint height) | 📋 | Not implemented |
| Cut/fill volume calculation | 📋 | Not implemented |
| Contour line generation | 📋 | Not implemented |
| Slope analysis color map | 📋 | Not implemented |

### Site Context
| Gap | Status | Notes |
|---|---|---|
| Site boundary drawing tool | 📋 | Not implemented |
| Setback line visualization | 📋 | Not implemented |
| Parking layout tools | 📋 | Not implemented |
| Map / satellite underlay | 📋 | Not implemented |
| Site north reference UI | 📋 | Not implemented |
| Adjacent building massing | 📋 | Not implemented |

### Levels / Stories
| Gap | Status | Notes |
|---|---|---|
| Level duplication with content | 📋 | Not implemented |
| Level reordering | 📋 | Not implemented |
| Mezzanine / split-level | 📋 | Not implemented |

### Solar Analysis
| Gap | Status | Notes |
|---|---|---|
| Solar panel 3D renderer | 📋 | Not implemented |
| Energy output calculation | 📋 | Not implemented |
| Irradiance heat map | 📋 | Not implemented |

### Section Views
| Gap | Status | Notes |
|---|---|---|
| Section cut plane renderer | ✅ | Implemented this session |
| Elevation view generation | 📋 | Not implemented |
| Section marker on 2D plan | 📋 | Not implemented |
| Section export (DXF, PDF) | 📋 | Not implemented |

---

## 10. AI and Automation (`ai-automation.md`)

### Tripo / AI Generation
| Gap | Status | Notes |
|---|---|---|
| Image-to-3D (photo → mesh) | 📋 | API supports it; not wired up |
| Generation history / library | 📋 | Not implemented |
| Style consistency across generations | 📋 | Not implemented |

### AI Features
| Gap | Status | Notes |
|---|---|---|
| Natural language floor plan generation | 📋 | Not implemented |
| Floor plan from brief (program + site) | 📋 | Not implemented |
| Spatial compliance checker | 📋 | Not implemented |
| AI material suggestions | 📋 | Not implemented |
| Smart item placement suggestions | 📋 | Not implemented |
| Vision / photo-to-floor-plan | 📋 | Feature gate exists; logic not implemented |

### MCP Server
| Gap | Status | Notes |
|---|---|---|
| MCP public documentation | 📋 | Not published |
| MCP API key management UI | 📋 | Not implemented |
| MCP streaming responses | 📋 | Not implemented |
| Natural language command parsing | 📋 | Not implemented |
| Agent SDK example | 📋 | Not implemented |

---

## 11. Auth and Billing (`auth-billing.md`)

### Auth
| Gap | Status | Notes |
|---|---|---|
| SSO / SAML 2.0 | 📋 | Enterprise requirement; not implemented |
| SCIM provisioning | 📋 | Not implemented |
| Magic link login | 📋 | Not implemented |
| GitHub / Microsoft login | 📋 | Not implemented |
| MFA (TOTP, SMS) | 📋 | Not implemented |
| Session management UI | 📋 | Not implemented |

### Billing
| Gap | Status | Notes |
|---|---|---|
| Org-level billing / seat-based pricing | 📋 | Not implemented |
| Free trial without credit card | 📋 | Not implemented |
| Usage-based billing (AI, render minutes) | 📋 | Not implemented |
| Invoice download | 📋 | Not implemented |
| Billing transactional emails | 📋 | Not implemented |

### Feature Gate UX
| Gap | Status | Notes |
|---|---|---|
| In-context upsell (upgrade prompt on gated feature) | 📋 | Not implemented |
| Usage meter in UI (AI generations remaining) | 📋 | Not implemented |
| Feature trial (7-day Pro preview) | 📋 | Not implemented |

### Organization
| Gap | Status | Notes |
|---|---|---|
| Org-level billing (subscribe org, not individual) | 📋 | Not implemented |
| Per-member seat billing | 📋 | Not implemented |
| Org SSO | 📋 | Not implemented |
| Org audit log | 📋 | Admin log covers admins only |

---

## 12. Plugin System (`plugin-system.md`)

### Developer Experience
| Gap | Status | Notes |
|---|---|---|
| `@aruct/plugin-sdk` npm package | 📋 | Not implemented |
| Plugin scaffolding CLI | 📋 | Not implemented |
| Local dev mode (hot reload from localhost) | 📋 | Not implemented |
| Plugin documentation site | 📋 | Not published |
| Plugin example / starter templates | 📋 | Not implemented |

### Plugin Capabilities
| Gap | Status | Notes |
|---|---|---|
| Plugins write to scene graph (mutation API) | 📋 | Read-only today |
| Custom node renderers (Three.js) | 📋 | Not implemented |
| Custom 2D canvas overlays | 📋 | Not implemented |
| Plugin-to-plugin messaging | 📋 | Not implemented |
| Plugin settings UI | 📋 | Not implemented |

### Distribution
| Gap | Status | Notes |
|---|---|---|
| Plugin marketplace / public registry | 📋 | Not implemented |
| Plugin versioning + auto-update | 📋 | Not implemented |
| Plugin review / verification | 📋 | Not implemented |

### Security
| Gap | Status | Notes |
|---|---|---|
| Sandboxed plugin execution (iframe / worker) | 📋 | Plugins run in main thread |
| Plugin permission declarations | 📋 | Not implemented |
| CSP policy for plugin scripts | 📋 | Not implemented |
| Plugin signature verification | 📋 | Not implemented |

### Catalog
| Gap | Status | Notes |
|---|---|---|
| Catalog item text search | 📋 | Browse-only today |
| Auto-generate catalog item thumbnails | 📋 | Not implemented |
| Catalog item tagging (room, style, brand) | 📋 | Not implemented |

---

## Summary

### Session Totals

| Category | Implemented ✅ | Partial 🔧 | Planned 📋 |
|---|---|---|---|
| UI / UX | 6 | 0 | 18 |
| 2D Floorplan | 3 | 0 | 29 |
| 3D Viewer / Rendering | 6 | 0 | 14 |
| Annotation / Measurements | 5 | 0 | 16 |
| Collaboration | 5 | 0 | 10 |
| File Formats | 5 | 0 | 18 |
| MEP / HVAC | 2 | 0 | 18 |
| Node Types | 5 | 0 | 12 |
| Site / Terrain | 2 | 0 | 15 |
| AI / Automation | 0 | 0 | 16 |
| Auth / Billing | 0 | 0 | 15 |
| Plugin System | 0 | 0 | 13 |
| **Total** | **39** | **0** | **194** |

---

## Priorities for Next Sprint

### HIGH PRIORITY — Biggest Platform Gaps

1. **Yjs real-time collaboration** — the most critical gap vs. Figma/Miro and enterprise competitors. Two users editing the same scene must see each other's changes live. Implement `y-websocket` server + `Y.Doc`-backed scene store. Unblocks seat-based Team tier growth.

2. **DWG import** — the format architects actually exchange. Accept DWG upload → ODA File Converter server-side → DXF → existing import pipeline. Opens the AutoCAD user base without needing native DWG parsing.

3. **PDF underlay** — critical for tracing existing plans. Convert PDF page to image via `pdfjs-dist`, display as a guide plane texture in 2D view with calibration (click two known points to set scale). Instant value for renovation projects.

4. **Railing / balustrade node type + renderer** — stairs, mezzanines, and balconies are incomplete without railings. Add schema, 3D renderer (baluster array + top rail), and 2D representation. Required for code-compliant stair depiction and IFC `IfcRailing` export.

5. **Plugin marketplace** — ecosystem growth and developer adoption. A simple listing page on the marketing site with one-click install. Pair with the `@aruct/plugin-sdk` npm package so developers have typed authoring tools.

### MEDIUM PRIORITY — High Value, Achievable

6. **Named version milestones** — "DD", "CD", "Permit Set" snapshots on the linear version history. Low DB change (add `name` + `pinned` fields to version event); high workflow value for architects managing deliverables.

7. **Vector PDF floor plan export** — replace the screenshot-based export with a proper 2D vector PDF using `pdf-lib` or `pdfkit`. Required for construction documents.

8. **Riser diagram panel UI** — the service logic already exists (`riser-diagram.ts`). Expose it in a panel with a rendered schematic. High visual impact for MEP consultants.

9. **Onboarding flow** — guided first scene (draw room → place door → add furniture). Without this, conversion from signup to active user is low.

10. **MEP pipe and duct draw tools** — the renderers now exist (implemented this session); interactive drawing tools are the logical next step.

---

*This document is generated from the gap-analysis docs in `wiki/gap-analysis/`. Update it when gaps are closed or new gaps are identified.*
