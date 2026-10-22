# Gap Analysis — Aruct Editor

Comprehensive feature inventory and gap analysis for `aruct/editor` vs. [CADCraft](https://github.com/storytold/cadcraft) (AutoCAD-style open-source CAD, pure Rust) and the broader AEC/CAD market.

**Last reviewed:** 2026-10-22 · **Scope:** `@aruct/core`, `@aruct/viewer`, `@aruct/editor`, `apps/editor`

## What Aruct Is

Web-native 3D architectural design editor. Goal: design buildings (walls, roofs, MEP, structure) in a real-time 3D environment, export to IFC/GLB/DXF, collaborate, embed in other products via plugins.

**Not** an AutoCAD replacement — no command-line drafting, no 2D paper space, no DWG workflow.

## Document Index

| Doc | Covers |
|---|---|
| [node-types.md](node-types.md) | All 50+ node kinds: schema fields, renderer status, known gaps |
| [2d-floorplan.md](2d-floorplan.md) | 2D floorplan editor: tools, snap, constraints, gaps vs CadCraft 2D |
| [3d-viewer-rendering.md](3d-viewer-rendering.md) | 3D viewer: renderer pipeline, post-processing, walkthrough, themes |
| [file-formats.md](file-formats.md) | Import/export: DXF, IFC, GLB, BOM, Point Cloud — status and gaps |
| [annotation-measurements.md](annotation-measurements.md) | Measurements, construction dimensions, drawing sheets, schedules |
| [collaboration.md](collaboration.md) | Real-time presence, collaborators, sharing, version history |
| [ai-automation.md](ai-automation.md) | Tripo 3D generation, MCP server, AI features and gaps |
| [auth-billing.md](auth-billing.md) | Firebase auth, plan tiers (Free/Pro/Team), Stripe/Razorpay, feature gates |
| [plugin-system.md](plugin-system.md) | Plugin API v1: discovery, lifecycle, catalog, authoring contract |
| [ui-ux.md](ui-ux.md) | Shell, toolbar, panels, keyboard shortcuts, mobile, gaps |
| [mep-hvac-systems.md](mep-hvac-systems.md) | MEP: ducts, pipes, HVAC equipment, riser diagram |
| [site-terrain-context.md](site-terrain-context.md) | Site, terrain, building, solar panels, structural grid |
| [cadcraft-comparison.md](cadcraft-comparison.md) | Side-by-side feature map: Aruct vs CadCraft |

## Summary: What Aruct Has Built

### Strengths
- Rich 3D architectural node system (50+ node types): walls, roofs, stairs, MEP, structure
- Real-time 3D viewer (Three.js/R3F) with BVH, walkthrough, post-processing, CSG
- 2D floorplan editor with wall mitering, door/window placement, snap, alignment guides
- Multi-floor/level system with slab support and vertical model
- IFC export, GLB export, DXF import/export, BOM export, schedules export
- Real-time collaboration (presence, scene collaborators)
- Plugin architecture (v1): external plugins can register node types and UI
- MCP server for AI agent control
- AI 3D generation (Tripo integration)
- Auth, billing (Stripe + Razorpay), Free/Pro/Team plans
- Polyhaven texture catalog + Poly Pizza model catalog integration
- Point cloud / scan import and viewer system
- Admin panel with audit log, impersonation, coupon management
- Organization workspaces with member roles
- Version history with per-event restore

### Critical Gaps vs Market

| Gap | Priority | Effort |
|---|---|---|
| No 2D annotation (dimensions, text, hatching on drawings) | High | 40–80 h |
| No IFC read (import IFC from Revit/ArchiCAD) | High | 60–120 h |
| No DWG read (the format architects actually exchange) | High | 30–60 h |
| No PDF plan underlay / import | High | 20–40 h |
| No parametric constraints | High | 80–150 h |
| No structural analysis integration | Medium | external |
| No energy analysis (panel exists, logic stub) | Medium | 40–80 h |
| No command palette / keyboard command entry | Medium | 10–20 h |
| No offline / desktop mode | Medium | 40–80 h |
| No multiplayer cursor/conflict resolution (presence-only today) | Medium | 30–60 h |
| Missing many wall types (glass, curtain, composite) | Medium | 20–40 h |
| No stair railing system | Medium | 15–30 h |
| No ceiling grid / suspended ceiling systems | Low | 10–20 h |
| No furniture/fixture library search | Low | 10–20 h |
