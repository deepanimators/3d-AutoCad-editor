# 2D Floorplan Editor — Features and Gaps

Source: `packages/editor/src/components/editor-2d/`

## What Exists

### Tools
| Tool | File | Status | Notes |
|---|---|---|---|
| Wall draw | `floorplan-registered-tool-layer.tsx` | Done | Straight walls; wall chain drawing |
| Wall move | `floorplan-wall-move-ghost-layer.tsx` | Done | Ghost preview while moving |
| Door placement | Tool via registered tool layer | Done | Snaps to wall face |
| Window placement | Tool via registered tool layer | Done | Snaps to wall face |
| Stair tool | Registered tool | Done | Rectangular footprint |
| Measurement tool | `floorplan-measurement-tool-layer.tsx` + tests | Done | Click-two-points measurement |
| Quick measure | `floorplan-quick-measure-layer.tsx` | Done | Hover-based proximity dimension |
| Guide placement | Tool | Done | Horizontal/vertical guides |
| Item placement | Tool | Done | Places GLB items on floor plane |
| Box select | Registered tool | Done | Drag-select multiple nodes |
| Group move | `floorplan-group-move.tsx` | Done | Move multiple selected nodes |

### Interaction / Overlays
| Feature | File | Status |
|---|---|---|
| Snap beacon | `floorplan-snap-beacon-layer.tsx` | Done |
| Alignment guides (live) | `floorplan-alignment-guide-layer.tsx` | Done |
| Cursor indicator | `floorplan-cursor-indicator-overlay.tsx` | Done |
| Context action menu (single node) | `floorplan-registry-action-menu.tsx` | Done |
| Context action menu (multi-select) | `floorplan-group-action-menu.tsx` | Done |
| Context action menu (floorplan bg) | `floorplan-action-menu-layer.tsx` | Done |
| Move overlay (registry node) | `floorplan-registry-move-overlay.tsx` | Done |
| Hotkey handlers | `floorplan-hotkey-handlers.tsx` | Done |
| Render context | `floorplan-render-context.tsx` | Done |

### Snap System (`packages/core/src/services/snap.ts`)
- Wall endpoint snap
- Wall midpoint snap
- Wall perpendicular snap
- Grid snap
- Guide snap
- Angle constraint (45°/90° increments)

### Wall System (`packages/core/src/systems/wall/`)
- Wall mitering (auto-join at corners) — `wall-mitering.ts`
- Wall footprint polygon — `wall-footprint.ts`
- Wall curve support — `wall-curve.ts`
- Wall move with miter recompute — `wall-move.ts`
- Wall-top boundary (plane-bound tops per level) — `wall-top.ts`

### Space Detection (`packages/core/src/lib/space-detection.ts`)
- Auto-detects enclosed rooms from wall polygons
- Creates zone nodes for detected spaces

### Alignment System (`packages/core/src/services/alignment.ts`)
- Anchor-based alignment
- Multi-node alignment to reference edge

---

## Gaps vs CadCraft 2D (AutoCAD-style)

### Precision Input (HIGH PRIORITY)
| CadCraft Feature | Status in Aruct | Notes |
|---|---|---|
| Coordinate display (X, Y status bar) | Missing | Users can't see cursor coordinates |
| Absolute coordinate entry (`5.5, 3.2`) | Missing | No typed input during placement |
| Relative coordinate entry (`@1.5, 0`) | Missing | — |
| Polar entry (`@3.0<45`) | Missing | — |
| Direct distance entry | Missing | — |
| Object snap modes (endpoint, midpoint, center, perpendicular, tangent) | Partial (endpoint, midpoint) | Missing: center, tangent, nearest, perpendicular |
| Object snap tracking | Missing | Tracking lines from snap points |
| Extension snap | Missing | Snap along extended edge line |
| Polar tracking (angle increments) | Partial | 45°/90° only; no custom angle |
| Ortho lock | Partial | No explicit ortho toggle key |
| Grid snap with configurable spacing | Missing | No grid snap; guides only |

### Draw Tools (MEDIUM PRIORITY)
| CadCraft Tool | Status in Aruct | Notes |
|---|---|---|
| LINE (free polyline drawing) | Missing | Walls only; no free 2D lines |
| CIRCLE, ARC, ELLIPSE | Missing | No 2D shape primitives |
| RECTANGLE | Missing | — |
| SPLINE | Missing | — |
| HATCH (pattern fill) | Missing | No fill patterns on floor plan |
| TEXT, MTEXT (on-canvas) | Missing | No text annotation on floorplan |
| OFFSET a wall | Partial | Via wall move; no formal OFFSET tool |
| TRIM / EXTEND walls | Missing | Wall trimming at intersections not exposed |
| FILLET walls | Missing | Curved wall corners not exposed as FILLET |

### Modify Tools (MEDIUM PRIORITY)
| CadCraft Tool | Status in Aruct | Notes |
|---|---|---|
| COPY with offset | Partial | Group copy exists; no distance offset |
| ROTATE | Partial | Item rotate; no wall rotate-in-place |
| MIRROR | Missing | No mirror tool for any node |
| SCALE | Partial | Item scale only |
| ARRAY (rectangular, polar) | Missing | — |
| STRETCH with crossing window | Missing | — |
| BREAK / JOIN | Missing | — |

### Annotation (HIGH PRIORITY)
| CadCraft Feature | Status in Aruct | Notes |
|---|---|---|
| Linear dimensions (styled) | Partial | `construction-dimension` exists but limited styling |
| Angular dimensions | Missing | — |
| Radius / diameter dimensions | Missing | — |
| Text labels on floor plan | Missing | No on-canvas text node |
| Room label with area | Partial | Zone shows area in zone panel; not drawn on canvas |
| Leader / callout | Missing | — |
| North arrow | Missing | — |
| Scale bar | Missing | — |
| Section marker | Partial | Section node exists; no marker on 2D plan |
| Grid / column annotation (A, B, 1, 2...) | Partial | Structural grid exists; no label rendering |

### Layer / Organization (MEDIUM PRIORITY)
| CadCraft Feature | Status in Aruct | Notes |
|---|---|---|
| Layers (on/off, freeze, color per layer) | Missing | No layer system; types act as implicit layers |
| Isolate by node type | Missing | — |
| Linetype (solid, dashed, centerline) | Missing | — |
| Lineweight | Missing | — |

### Layouts / Printing (HIGH PRIORITY)
| CadCraft Feature | Status in Aruct | Notes |
|---|---|---|
| Paper-space layout | Partial | `drawing-sheet` node exists; no full layout system |
| Viewports at scale | Missing | — |
| Print/Plot to PDF (floor plan quality) | Missing | GLB renders only; no 2D vector PDF |
| Title block | Missing | — |
| Sheet numbering | Missing | — |

---

## What Aruct Does That CadCraft Cannot

- Real-time 3D view synchronized with the 2D floorplan (same scene graph)
- Automatic wall mitering (auto-join corners — CadCraft requires manual FILLET)
- Automatic room/zone detection from wall polygons
- Door/window automatically cut opening in wall (CadCraft uses INSERT block)
- Multi-floor / storey system with automatic slab placement
- 3D walkthrough of the designed space directly from floorplan
- Real-time material application visible in 3D without extra render step
- MEP routing with port connectivity graph
- IFC export from the same data

---

## Recommended Next Steps (ranked)

1. **Coordinate display** — status bar showing cursor X, Y in current units. Fast win.
2. **Styled construction dimensions** — arrows, text style, extension line gaps.
3. **Room labels on canvas** — zone area + name drawn on the 2D plan.
4. **Section markers** — cut line with reference triangle on floorplan.
5. **Polar angle lock (any angle)** — extend snap to configurable increments.
6. **Grid snap** — configurable snap-to-grid separate from guides.
7. **Copy with distance input** — after select, type offset distance.
8. **Mirror tool** — across center axis or guide.
9. **HATCH / fill patterns** — on zones / slabs on 2D plan.
10. **2D vector PDF export** — floor plan quality, not a screenshot.
