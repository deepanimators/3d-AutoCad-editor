# Node Types — Complete Inventory

All node kinds defined in `packages/core/src/schema/nodes/`. Each row notes the schema file, renderer system, known gaps, and whether the kind is visible in the editor UI.

## Architecture / Envelope

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `wall` | `wall.ts` | `wall-system.tsx` | Wall tool (2D + 3D) | Curved walls limited; no composite multi-layer walls; glass wall type; structural wall type with structural properties |
| `door` | `door.ts` | `door-system.tsx` | Door placement on wall | Door animation (open/close); threshold materials; sidelight/transom variants |
| `window` | `window.ts` | `window-system.tsx` | Window placement on wall | Awning/casement/sliding variants; window animation; interior/exterior sill depth |
| `skylight` | `skylight.ts` | (item-based) | Placement on roof | Custom skylight shapes; flashing detail |
| `ceiling` | `ceiling.ts` | `ceiling-system.tsx` | Auto-generated from level | Coffered, tray, dropped ceiling types; acoustic tile grid |
| `slab` | `slab.ts` | `slab-system.tsx` | Auto / manual floor slab | Multi-layer floor assembly (finish + structural); slab edge detail |
| `curtain-wall` | `curtain-wall.ts` | (panel UI) | Curtain wall panel | No 3D renderer yet; grid customization; mullion profiles |
| `roof` | `roof.ts` | `roof-system.tsx` | Roof tool | — |
| `roof-segment` | `roof-segment.ts` | (part of roof) | — | Flashing, eave detail, fascia |
| `dormer` | `dormer.ts` | (part of roof) | — | Custom dormer types |
| `cupola` | `cupola.ts` | (GLB item) | — | — |

## Vertical / Level

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `level` | `level.ts` | `level-system.tsx` | Level manager | Level duplication; level reordering with content reparenting |
| `building` | `building.ts` | — | Top-level container | — |
| `site` | `site.ts` | — | Site container | Site boundary drawing; site grading |

## Stairs / Circulation

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `stair` | `stair.ts` | `stair-system.tsx` | Stair tool | Spiral stairs; helical stairs; custom tread shapes |
| `stair-segment` | `stair-segment.ts` | (part of stair) | — | Landing segments; winder steps |
| `elevator` | `elevator.ts` | `elevator-interaction-system.tsx` | Elevator placement | Elevator shaft auto-cutout through slabs |
| `fence` | `fence.ts` | `fence-system.tsx` | Fence tool | Fence gate placement; post caps; spline path |

## Structure

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `column` | `column.ts` | `column-geometry.ts` | Item placement | Structural column with load path; UC/UB sections; tapered columns |
| `structural-grid` | `structural-grid.ts` | — | Structural grid panel | 3D renderer for grid beams; bay labeling |
| `slab` | (see above) | — | — | — |

## MEP — HVAC

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `duct-segment` | `duct-segment.ts` | (system graph) | MEP tool | 3D duct renderer; flexible duct type; insulation layer |
| `duct-fitting` | `duct-fitting.ts` | — | Auto-placed | 3D renderer; fitting type library |
| `duct-terminal` | `duct-terminal.ts` | — | Terminal placement | Terminal type library (grilles, diffusers) |
| `hvac-equipment` | `hvac-equipment.ts` | — | Equipment placement | Equipment specs (CFM, tons, kW); connection validation |
| `box-vent` | `box-vent.ts` | — | Roof venting | — |
| `ridge-vent` | `ridge-vent.ts` | — | Roof venting | — |
| `turbine-vent` | `turbine-vent.ts` | — | Roof venting | — |
| `eyebrow-vent` | `eyebrow-vent.ts` | — | Roof venting | — |

## MEP — Plumbing

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `pipe-segment` | `pipe-segment.ts` | (system graph) | Plumbing tool | 3D pipe renderer; pipe material/schedule (copper, PVC, PEX) |
| `pipe-fitting` | `pipe-fitting.ts` | — | Auto-placed | 3D renderer; fitting type library |
| `pipe-trap` | `pipe-trap.ts` | — | Trap placement | — |
| `liquid-line` | `liquid-line.ts` | — | Refrigerant/gas lines | 3D renderer |

## Roofing / Exterior

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `gutter` | `gutter.ts` | — | Gutter tool | 3D renderer; gutter profile shapes |
| `downspout` | `downspout.ts` | — | Downspout placement | 3D renderer; elbow fittings |
| `chimney` | `chimney.ts` | — | Chimney placement | 3D renderer; cap styles |
| `solar-panel` | `solar-panel.ts` | — | Solar panel panel | Solar energy output calc; panel wiring |

## Catalog Items / Furniture

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `item` | `item.ts` | `item-system.tsx` | Item catalog browser | Item search by room type; item snapping to surfaces; item parametric variants |
| `shelf` | `shelf.ts` | (item-based) | — | Adjustable shelf heights; shelf loads |
| `cabinet` | `cabinet.ts` | — | — | 3D renderer; cabinet configurator (width/height/depth); door styles |

## Geometry / Mesh

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `mesh` | `mesh.ts` | `geometry-system.tsx` | Mesh editor panel | Boolean operations (union, subtract, intersect) beyond CSG in viewer; mesh sculpting; subdivision |
| `lineset` | `lineset.ts` | — | — | 2D lineset renderer; lineweight; line types |

## Site / Survey

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `terrain` | `terrain.ts` | — | Terrain panel | 3D terrain renderer with height map; contour lines; cut/fill volumes |
| `point-cloud` | `point-cloud.ts` | `scan-system.tsx` | Point cloud panel | LOD streaming for large clouds; classification coloring |
| `scan` | `scan.ts` | `scan-system.tsx` | — | — |

## Documentation / Annotation

| Kind | Schema | Renderer | Editor UI | Known Gaps |
|---|---|---|---|---|
| `measurement` | `measurement.ts` | — | Measurement tool | — |
| `construction-dimension` | `construction-dimension.ts` | — | Dimension tool | Styled dimensions (arrows, text, extension lines); dimension styles |
| `drawing-sheet` | `drawing-sheet.ts` | — | Drawing sheet panel | Sheet renderer for PDF export; title block template; viewport scaling |
| `guide` | `guide.ts` | `guide-system.tsx` | Guide placement | — |
| `section` | `section.ts` | — | Sections panel | 3D section cut renderer; section elevation views |
| `zone` | `zone.ts` | `zone-system.tsx` | Zone rollup panel | Zone labeling on floor plan; program/use designation |
| `spawn` | `spawn.ts` | — | — | First-person view spawn point |

## Summary Stats

- **Total node kinds:** ~50
- **Have 3D renderer:** ~30
- **Have editor UI tool:** ~25
- **Schema only (no renderer/tool):** ~15 — these are the highest-priority gap items

## Highest-Priority Missing Renderers

1. `curtain-wall` — schema + panel exist, no 3D mesh
2. `gutter`, `downspout`, `chimney` — exterior detail nodes, no 3D
3. `cabinet` — no 3D renderer at all
4. `terrain` — no mesh/heightmap renderer
5. `drawing-sheet` — no PDF-quality sheet renderer
6. `structural-grid` — no beam/column renderer
7. `section` — no section-cut plane renderer

## Highest-Priority Missing Node Kinds

| Missing Kind | Rationale |
|---|---|
| Railing / balustrade | Stairs, mezzanines, balconies all need railings |
| Beam / structural member | Structural framing for exposed/industrial designs |
| Ceiling grid / tile system | Commercial interiors |
| Composite wall (multi-layer) | Building physics / energy analysis |
| Glazing system (parametric) | High-end facades |
| Topographic boundary | Site work — cut/fill, retaining walls |
| Space / room object | IFC `IfcSpace`; needed for proper BIM |
| Tag / label annotation | Callouts on drawings |
| North arrow / scale bar | Drawing annotation |
| Parking space | Site layout |
| Ramp | Accessibility / parking structure |
