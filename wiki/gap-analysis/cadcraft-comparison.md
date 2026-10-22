# Aruct vs CadCraft — Side-by-Side Comparison

## Context

| | **Aruct** | **CadCraft** |
|---|---|---|
| Domain | 3D architectural design (BIM-lite) | 2D CAD drafting (AutoCAD clone) |
| Stack | TypeScript, Next.js, Three.js, React | Rust, egui, WebAssembly |
| Runtime | Web (browser-only) | Native desktop + WASM web |
| License | Proprietary (open-source packages) | MIT / Apache-2.0 |
| Stage | Beta | Pre-alpha (≈38% AutoCAD parity) |
| Business model | SaaS (Free/Pro/Team) | Free forever, open-source |
| Users | Architects, interior designers, contractors | CAD drafters, AutoCAD refugees |

**These tools are not direct competitors** — they serve overlapping but distinct user segments. The comparison identifies where Aruct should look at CadCraft's approach for features it could add.

---

## Feature Comparison

### 2D Drafting

| Feature | Aruct | CadCraft | Notes |
|---|---|---|---|
| Command-line interface | ❌ | ✅ | CadCraft's core differentiator |
| Typed coordinate entry | ❌ | ✅ `@3.5,2` `@5<45` | Critical for precision drafting |
| Object snaps (endpoint, midpoint, center…) | Partial | ✅ Full | Aruct has endpoint + midpoint |
| Polar tracking (custom angles) | Partial | ✅ | Aruct: 45°/90° only |
| Object snap tracking | ❌ | ✅ | Tracking lines from snap points |
| Grid snap | ❌ | ✅ | Aruct has alignment guides only |
| Ortho lock | Partial | ✅ | Aruct: implicit via angle constraint |
| Status bar (X, Y, angle) | ❌ | ✅ | — |
| Dynamic input (on-cursor entry) | ❌ | ✅ | — |
| Grip editing | ❌ | ✅ | Click node corner → drag to resize |
| LINE / POLYLINE draw | ❌ | ✅ | Aruct has wall-only lines |
| CIRCLE, ARC, ELLIPSE | ❌ | ✅ | No 2D shape primitives |
| RECTANGLE, POLYGON | ❌ | ✅ | — |
| SPLINE | ❌ | ✅ | Aruct fence uses spline internally |
| HATCH / fill | ❌ | ✅ | — |
| OFFSET | Partial | ✅ | Aruct: move wall only |
| TRIM / EXTEND | ❌ | ✅ | — |
| MIRROR | ❌ | ✅ | — |
| ARRAY (rect / polar) | ❌ | ✅ | — |
| STRETCH | ❌ | ✅ | — |

### Annotation

| Feature | Aruct | CadCraft | Notes |
|---|---|---|---|
| Linear dimensions (styled) | Basic | ✅ Full DIMSTYLE | Arrowheads, text height, tolerances |
| Angular dimensions | ❌ | ✅ | — |
| Radius / diameter | ❌ | ✅ | — |
| TEXT / MTEXT | ❌ | ✅ | No on-canvas text in Aruct |
| Multileader (callout) | ❌ | ✅ | — |
| TABLE / schedule grid | ❌ | ✅ | Aruct has panels; not on canvas |
| Room area labels | ❌ (panel) | Partial | Both need work |
| Drawing sheet / paper space | Schema only | ✅ Full layouts | — |
| PDF plot | ❌ | ✅ | CadCraft → real vector PDF |
| Layers (on/off, color, linetype) | ❌ | ✅ | — |

### 3D Modeling

| Feature | Aruct | CadCraft | Notes |
|---|---|---|---|
| Architectural 3D (walls, roofs, stairs) | ✅ Rich | ❌ | CadCraft: 2D only, 3D is 2% roadmap |
| Parametric constraints | ❌ | ✅ (geometric + dimensional) | — |
| Solid modeling (CSG) | Partial (walls) | ❌ | — |
| Free-form mesh editing | Partial | ❌ | Aruct mesh node |
| 3D walkthrough | ✅ | ❌ | — |
| Sun study / shadows | ✅ | ❌ | — |
| PBR materials | ✅ | ❌ | — |
| 3D section cut | ❌ | ❌ | Both missing |
| Surface modeling | ❌ | ❌ | — |

### File Formats

| Format | Aruct | CadCraft |
|---|---|---|
| DXF read | ✅ (partial) | ✅ R12–2018 full |
| DXF write | ✅ (partial) | ✅ R2000 full round-trip |
| DWG read | ❌ | ✅ R13–2018 |
| DWG write | ❌ | ✅ R2000 |
| IFC export | ✅ (Team) | ❌ |
| IFC import | ❌ | ❌ |
| GLB export | ✅ (Pro) | ❌ |
| SVG export | ❌ | ✅ |
| PDF plot | ❌ | ✅ |
| Point cloud (LAS/LAZ) | ✅ | ❌ |
| BOM CSV | ✅ | ❌ |

### Collaboration and Platform

| Feature | Aruct | CadCraft |
|---|---|---|
| Cloud storage | ✅ | ❌ (local files) |
| Real-time presence | ✅ | ❌ |
| Real-time co-editing | ❌ | ❌ |
| Scene sharing | ✅ (Pro) | ❌ |
| Version history | ✅ | ❌ |
| Organization workspaces | ✅ | ❌ |
| Auth / accounts | ✅ Firebase | ❌ |
| Billing / subscriptions | ✅ | ❌ |
| Plugin/extension API | ✅ v1 | ❌ (planned) |
| MCP server | ✅ (Pro) | ✅ |
| AI 3D generation | ✅ Tripo | ❌ |
| Scripting / automation | ❌ | ✅ (AutoLISP, JSON) |
| CLI | ❌ | ✅ `cadcraft-cli` |

### Localization and Accessibility

| Feature | Aruct | CadCraft |
|---|---|---|
| Multi-language UI | ❌ (English only) | ✅ 14 languages |
| RTL support | ❌ | ✅ (Arabic) |
| CJK text | ❌ | ✅ (fallback) |
| Accessibility (WCAG) | ❌ (unaudited) | Partial |

---

## What CadCraft Does Best (Aruct Could Learn From)

| Learning | CadCraft Approach | Aruct Gap |
|---|---|---|
| Precision drafting | Command-line with typed coordinates, full snap modes | No coordinate entry, partial snaps |
| Undo granularity | Every command is one undo step | Stack-based but not per-command |
| Dimension styling | Full DIMSTYLE variables | No dimension styles |
| Script automation | `.scr` files, JSON, AutoLISP, CLI | MCP only (no user scripting) |
| File round-trip | DXF/DWG save preserves everything | DXF export incomplete |
| Localization | 14 languages from launch | English only |
| Status bar | Always-visible cursor position | Missing |

## What Aruct Does Best (CadCraft Cannot Match)

| Advantage | Aruct | Notes |
|---|---|---|
| 3D architectural design | Walls, roofs, stairs, MEP in real 3D | CadCraft is 2D-only |
| Building information | Zones, BOM, schedules, IFC export | BIM-adjacent |
| Materials + rendering | PBR, walkthrough, sun study | Real visual design |
| Cloud + collaboration | SaaS, sharing, presence, history | CadCraft is local-only |
| MEP data model | Duct + pipe + system graph | CAD tools rarely have this |
| AI generation | Tripo 3D model generation | Future-ready |
| Point cloud integration | LiDAR/scan import | Survey workflow |
| Subscription model | Revenue model exists | CadCraft is free/open |
| Plugin ecosystem | v1 API, catalog | CadCraft: planned |

---

## Strategic Conclusion

Aruct should **not** try to become CadCraft (command-line CAD). Instead, it should:

1. **Own the 3D architectural design space** — deepen node types, renderers, MEP tools
2. **Complete the BIM loop** — IFC read + write; DWG import; proper drawing sheets
3. **Add just enough 2D precision** — coordinate display, styled dimensions, styled room labels
4. **Leverage the platform** — collaboration, AI, plugins where CadCraft can't compete
5. **Target the handoff workflow** — architects who design in Aruct export to AutoCAD/Revit for documentation

The user who needs AutoCAD will use AutoCAD or CadCraft. The user who needs to design a 3D building and collaborate with a team will use Aruct.
