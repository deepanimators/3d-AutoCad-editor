# Annotation and Measurements — Features and Gaps

## What Exists

### Measurement System (`packages/core/src/schema/nodes/measurement.ts`)
- Persistent `measurement` nodes stored in scene graph
- 2D and 3D draft ownership (floorplan vs 3D viewer)
- Quick-measure (hover-based proximity display) — `floorplan-quick-measure-layer.tsx`
- Measurement tool (click two points) — `floorplan-measurement-tool-layer.tsx` + tests
- Units system (meters; unit display conversion)
- Snapping support for measurement endpoints

**Measurement node fields** (from schema):
- `start`, `end` — 3D points
- `text` — optional override label
- `unit` — display unit
- `visible` — toggleable

### Construction Dimensions (`packages/core/src/schema/nodes/construction-dimension.ts`)
- Lightweight dimension nodes for construction guidance
- Not styled; no arrowhead/extension line configuration
- Tests exist: `construction-dimension.test.ts`
- Migration test: `use-scene-construction-dimension-migration.test.ts`

### Zone Quantities (`packages/core/src/lib/zone-quantities.ts`)
- Calculates area, perimeter for zone nodes
- Used by zone rollup panel
- Tests: `zone-quantities.test.ts`

### Zone Rollup Panel (`apps/editor/components/zone-rollup-panel.tsx`)
- Lists all zones with area (m²/ft²)
- Gross/net area breakdown
- No PDF/CSV export of zone schedule

### Schedules Panel (`apps/editor/components/schedules-panel.tsx`)
- Door schedule: ID, type, size, material
- Window schedule: ID, type, size, glazing
- Export: `api/export/schedules` — CSV
- Gaps: no room schedule; no equipment schedule; no finish schedule

### BOM Panel (`apps/editor/components/bom-panel.tsx`)
- Bill of materials: catalog items with count
- Export: `api/export/bom` — CSV
- Gaps: no unit cost / pricing; no material quantities

### Drawing Sheet Node (`packages/core/src/schema/nodes/drawing-sheet.ts`)
- Schema exists for drawing sheet
- No renderer: the sheet is not drawn in 3D or 2D views
- No viewport system for showing portions of the model at scale
- Tests: `drawing-sheet.test.ts`

### Sections Panel (`apps/editor/components/sections-panel.tsx`)
- UI panel for managing section nodes
- Section node schema: `section.ts`
- No 3D section cut renderer
- No elevation view generation

### Sun Study Panel (`apps/editor/components/sun-study-panel.tsx`)
- Time-of-day and date sun angle simulation
- Azimuth / altitude controls
- Live shadow update in 3D viewer
- Gaps: no shadow study time-lapse; no solar access analysis report

### Energy Panel (`apps/editor/components/energy-panel.tsx`)
- Panel UI for energy analysis
- Status: UI shell exists; computation logic is placeholder/stub
- Gaps: no wall U-value, window SHGC, infiltration model; no HVAC sizing

### Point Cloud Panel (`apps/editor/components/point-cloud-panel.tsx`)
- Import LAS/LAZ via `api/import/point-cloud`
- Display in 3D viewer via scan-system
- Gaps: registration (align cloud to model); classification coloring; measurement on cloud points

---

## Gaps vs CadCraft and Market

### Dimension Styling (HIGH PRIORITY)
CadCraft has full `DIMSTYLE` — arrowhead type/size, text height, extension line offset, gap, tolerance format, prefix/suffix, alternate units, scale factor, etc.

Aruct has none of this. The `construction-dimension` node has no style properties. Needed:

| Gap | Notes |
|---|---|
| Arrowhead types (architectural tick, filled arrow, dot, open arrow) | — |
| Extension line gap and overshoot | — |
| Dimension text style (font, height) | — |
| Prefix / suffix (e.g., "≈", "TYP") | — |
| Tolerance display (±) | — |
| Continuous / baseline dimension chains | — |
| Dimension style presets (Architectural, Engineering, Decimal) | — |
| Angular dimensions | — |
| Radius / diameter dimensions | — |

### Text Annotation (HIGH PRIORITY)
No on-canvas text annotation at all. CadCraft has `TEXT` and `MTEXT` on the drawing canvas with full formatting.

Aruct needs:
- `label` node type (text at a point in 2D space)
- `callout` / leader annotation
- Room name labels (drawn on floor plan, not just in panel)
- North arrow node
- Scale bar node

### Drawing Sheets (HIGH PRIORITY)
`drawing-sheet` node exists in schema but has no renderer or layout engine. A proper drawing sheet system would:
1. Define paper size (A0–A4, Letter, Arch D)
2. Place viewports showing portions of the model at a specified scale
3. Add title block (project, sheet number, date, client, author)
4. Crop / clip viewport to show specific level or zone
5. Export the sheet to vector PDF

### Schedules (MEDIUM PRIORITY)
Current schedules cover doors and windows only.

Missing:
- Room / space schedule (area, occupancy, finish)
- Finish schedule (floor, wall, ceiling materials per room)
- Equipment schedule (HVAC, plumbing fixtures)
- Lighting fixture schedule
- Structural member schedule
- Custom schedule (user-defined fields)

### Energy Analysis (MEDIUM PRIORITY)
Panel UI shell exists. Full implementation would need:
- Wall assembly U-value (per material layer)
- Window SHGC and U-factor
- Infiltration rate per wall type
- Occupancy schedule
- Plug loads
- HVAC system efficiency
- Climate data (EPW weather file)
- Output: peak heating/cooling loads, EUI (kWh/m²/yr)
- Integration: OpenStudio/EnergyPlus or simplified ASHRAE load calc

### Structural Analysis (LOW — External)
No structural analysis. This is typically handled externally (ETABS, RAM, RISA). Aruct could:
- Export a structural model (columns, beams, slabs) with loads to a structural solver
- Import analysis results (stress, deflection) as a visualization overlay

### Comparison Table

| Feature | CadCraft | Aruct |
|---|---|---|
| Styled linear dimensions | ✅ Full DIMSTYLE | ✅ Basic only |
| Angular dimensions | ✅ | ❌ |
| Radius/diameter dimensions | ✅ | ❌ |
| Text on canvas | ✅ TEXT + MTEXT | ❌ |
| Leader / callout | ✅ MLEADER | ❌ |
| Table (schedule grid) | ✅ TABLE | ❌ |
| Room area labels | ✅ via MTEXT + FIELD | ❌ (panel only) |
| Drawing sheet / paper space | ✅ Full layouts + viewports | ❌ (schema only) |
| PDF plot from drawing | ✅ | ❌ |
| Zone area schedule | ❌ | ✅ Panel |
| Door/window schedule | ❌ | ✅ CSV |
| BOM (item count) | ❌ | ✅ CSV |
| Sun study | ❌ | ✅ |
| Energy panel | ❌ | ✅ (stub) |
| Point cloud import | ❌ | ✅ |

---

## Recommended Next Steps

1. **Dimension styling** — add `style` object to `construction-dimension` schema with arrowhead, text, line properties
2. **Label node** — `label` node with text, font, size, color — renders on 2D canvas
3. **Drawing sheet renderer** — viewport + title block + PDF export
4. **Room labels on floor plan** — auto-populate zone name + area on 2D canvas
5. **Angular and radial dimensions** — extend dimension tool
6. **Energy analysis implementation** — connect panel to real load calc
7. **Room/zone schedule export** — add to schedules endpoint
