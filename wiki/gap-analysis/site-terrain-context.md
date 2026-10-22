# Site, Terrain and Building Context — Features and Gaps

## What Exists

### Site / Building Hierarchy

```
site
└── building
    └── level (floor 1, floor 2, …)
        ├── wall, door, window, …
        ├── slab
        └── ceiling
```

- `site.ts` — top-level container; no geometry of its own
- `building.ts` — building container; floors/levels aggregate here
- `level.ts` — floor level with `elevation` and `height` properties; storey system
- Multi-floor managed by `storey.ts` (service) and `level-height.ts`
- Level system (`level-system.tsx`) handles floor/ceiling visibility per active level

### Terrain (`terrain.ts`)
- Schema exists with `heightmap` URL field and `scale` properties
- No 3D renderer (heightmap → mesh conversion not implemented)
- Terrain panel: `terrain-panel.tsx` — UI to set terrain properties
- **Status: data model only; terrain is invisible in the 3D view**

### Structural Grid (`structural-grid.ts`)
- Schema: grid of columns at bay spacings (x-spacings[], y-spacings[])
- Tests: `structural-grid.test.ts`
- No 3D renderer for beams or column labels
- No 2D grid annotation (A, B, C / 1, 2, 3 column reference)

### Solar Panels (`solar-panel.ts`)
- Schema: panel dimensions, efficiency, tilt, azimuth, array layout
- Presets: `solar-panel-presets.ts` — common residential and commercial panel specs
- No 3D renderer
- No energy output calculation (needs climate data + panel specs)

### Fence / Site Boundary (`fence.ts`)
- Schema + 3D renderer + fence-system.tsx
- Spline-path fence (`fence-spline.ts` + tests)
- Fence centerline (`fence-centerline.ts`)
- Can represent site perimeter, property lines, retaining walls

### Section Cuts (`section.ts`)
- Schema: cut plane (position, normal, look direction)
- Sections panel: `sections-panel.tsx`
- No 3D section cut renderer (scene is not clipped at the section plane)
- No elevation view generation

---

## Gaps

### Terrain (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Heightmap → 3D mesh renderer | Core feature; terrain is invisible today |
| Terrain import: GeoTIFF / DEM | Standard survey data formats |
| Terrain import: XYZ point file | Surveyor output |
| Terrain editing (paint height) | Grade design |
| Cut/fill volume calculation | Earthwork quantification |
| Contour line generation + display | Standard site plan output |
| Topographic background (2D plan) | Show contours on floor plan |
| Slope analysis (color map) | Identify buildable areas |
| Flood zone overlay | Site risk |
| Shadow study on terrain | — |

### Site Context (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Site boundary drawing | Property line as a closed polygon |
| Setback lines | Legal setback visualization |
| Parking layout tools | Parking stall + drive aisle |
| Hardscape / paving areas | Sidewalk, driveway surfaces |
| Planting / landscape objects | Trees, shrubs (from catalog) |
| Street and road context | Reference geometry |
| Map underlay (satellite or topo) | Import from mapping service |
| Site north reference | Sun study needs site north; no UI for it |

### Building Context
| Gap | Notes |
|---|---|
| Adjacent buildings (context massing) | Shows shadow impact on neighbors |
| Building footprint on site | Position building on terrain |
| Multiple buildings on one site | Site with several structures |
| Building envelope calculation | GFA, FAR, lot coverage |
| Zoning envelope visualization | Maximum buildable volume |

### Structural Grid (MEDIUM)
| Gap | Notes |
|---|---|
| Column/beam renderer | Grid is data-only today |
| Grid annotation (A/B/1/2 labels) on 2D plan | Standard architectural drawing requirement |
| Grid line extension | Extend grid beyond building footprint |
| Structural grid export (DXF/IFC) | `IfcGrid` |
| Grid-based slab span calculation | Preliminary structural sizing |

### Levels / Stories (MEDIUM)
| Gap | Notes |
|---|---|
| Level duplication with content | Copy floor 1 to create floor 2 |
| Level reordering (drag to reorder) | — |
| Mezzanine / split-level | Partial floor at intermediate height |
| Basement / below-grade levels | Negative elevation levels |
| Roof level / penthouse | Level at top of structure |
| Floor finish elevation vs slab elevation | Structural vs finished floor height |

### Solar Analysis (MEDIUM)
| Gap | Notes |
|---|---|
| Solar panel 3D renderer | Panels are invisible today |
| Energy output calculation | kWh/year estimate |
| Optimal tilt + azimuth recommendation | Based on latitude |
| Solar irradiance map (heat map on roof) | Shows best placement zones |
| Self-shading analysis | From adjacent panels / roof obstructions |

### Section Views (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Section cut plane renderer | Clip scene at section plane; show cut faces |
| Elevation view generation | Orthographic view from a direction |
| Section marker on 2D plan | Circle with reference number |
| Section export (DXF, PDF) | Standard deliverable |
| Interior elevation views | Per-room interior elevations |

---

## What Aruct Has vs CadCraft

| Site/Terrain Feature | CadCraft | Aruct |
|---|---|---|
| Multi-level / storey system | ❌ (2D only) | ✅ |
| Terrain schema | ❌ | ✅ (schema only) |
| Terrain renderer | ❌ | ❌ |
| Solar panels | ❌ | ✅ (schema only) |
| Structural grid | ❌ | ✅ (schema only) |
| Section cut (3D) | ❌ | ❌ |
| Site boundary | ❌ | ❌ |
| Map underlay | ❌ | ❌ |
| Contour lines | ❌ | ❌ |
| Building context massing | ❌ | ❌ |

Aruct has a richer architectural data model than CadCraft in this domain — but execution (renderers, tools) is missing for most site/terrain features.

---

## Recommended Next Steps

1. **Terrain heightmap renderer** — TIN mesh from heightmap URL; visible in 3D
2. **Section cut plane** — clip the Three.js scene at the section plane; show cut materials
3. **Site boundary tool** — draw closed polygon as property line; show setbacks
4. **Solar panel renderer** — even a simple flat mesh; display energy output label
5. **Map/satellite underlay** — geotiff or tile-based background on 2D floorplan
6. **Structural grid annotation** — A/B/1/2 labels on 2D plan
7. **Level duplication** — copy floor with all nodes reparented
8. **Contour line generation** — from terrain heightmap; display on 2D plan
