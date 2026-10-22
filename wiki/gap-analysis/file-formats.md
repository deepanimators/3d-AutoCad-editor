# File Formats — Import / Export Status and Gaps

Source: `apps/editor/app/api/export/`, `apps/editor/app/api/import/`

## Current Status

### Export

| Format | Route | Plan Gate | Status | Known Gaps |
|---|---|---|---|---|
| **GLB** | `export/glb` | Pro | Done | Large scenes: materials not all exported; point clouds not in GLB |
| **IFC** | `export/ifc` | Team | Done | See IFC gaps below |
| **DXF** | `export/dxf` | Pro | Done | 2D floor plan only; no 3D entities; no annotation/dimensions in export |
| **BOM** | `export/bom` | Pro | Done | Bill of materials CSV; covers items + structural; no cost pricing |
| **Schedules** | `export/schedules` | Pro | Done | Door/window schedules; no room/zone schedule |
| **Measurements** | `export/measurements` | Free | Done | Raw measurement data export |

### Import

| Format | Route | Plan Gate | Status | Known Gaps |
|---|---|---|---|---|
| **DXF** | `import/dxf` | Pro | Done | 2D geometry → wall nodes; no block/attribute import; limited entity support |
| **Point Cloud** | `import/point-cloud` | Pro | Done | LAS/LAZ → scan node; large files may time out |

---

## IFC Details

### IFC Export (Team tier)
Implemented via server-side IFC writer. Exports:
- `IfcWall`, `IfcSlab`, `IfcRoof`, `IfcColumn`
- `IfcDoor`, `IfcWindow`
- `IfcStair`
- `IfcSpace` (from zone nodes)
- `IfcBuildingStorey` (from level nodes)
- `IfcBuilding`, `IfcSite`, `IfcProject`

**IFC Export Gaps:**
| Gap | Priority |
|---|---|
| `IfcBeam`, `IfcMember` (structural framing) | High |
| `IfcCurtainWall` with panels | High |
| `IfcRailing` | High |
| MEP: `IfcDuctSegment`, `IfcPipeSegment`, `IfcFlowFitting` | High |
| Equipment: `IfcAirTerminal`, `IfcAirHandlingUnit` | Medium |
| `IfcFurniture` (items as furniture elements) | Medium |
| Property sets (Pset_WallCommon, Pset_SlabCommon, etc.) | High |
| Material layer sets (`IfcMaterialLayerSetUsage`) | High |
| IFC 4.3 (current standard) — IFC 2×3 only? | High |
| IFC classification references (Uniclass, OmniClass) | Medium |
| IfcGrid (structural grid as IFC grid) | Low |

### IFC Import — MISSING ENTIRELY (HIGH PRIORITY)
No IFC read capability. This is a critical gap: architects and engineers routinely exchange IFC files from Revit, ArchiCAD, Vectorworks, Tekla. Without IFC import, Aruct cannot participate in BIM workflows.

**What IFC import would unlock:**
- Receive a Revit structural model → add interior design in Aruct
- Receive a contractor's MEP model → coordinate in Aruct
- Open ArchiCAD export for further editing
- Round-trip: export IFC from Aruct, modify externally, re-import

**Recommended approach:** Use the `web-ifc` (open-source) library (`@thatopen/web-ifc`) — same tech used by IFC.js and That Open Engine. Parse on the server, convert to Aruct scene graph.

---

## DXF Details

### DXF Export (Pro tier)
Exports the 2D floor plan as DXF entities.

**DXF Export Gaps:**
| Gap | Priority |
|---|---|
| Wall centerlines vs face lines | Medium |
| Door/window symbols (standard arc symbols) | High |
| Room labels / text entities | High |
| Dimension entities (DIMLINEAR, etc.) | High |
| Hatch entities for rooms | Medium |
| Layer organization (walls on `A-WALL`, doors on `A-DOOR`) | High |
| Multi-floor: separate layers or separate files per level | Medium |
| 3D DXF (MESH / 3DFACE entities) | Medium |
| DXF R2018 (currently may write R2000) | Low |

### DXF Import (Pro tier)
Reads 2D DXF and attempts to convert LINE/POLYLINE entities to wall nodes.

**DXF Import Gaps:**
| Gap | Priority |
|---|---|
| Block / INSERT handling | High |
| TEXT / MTEXT → annotation nodes | Medium |
| CIRCLE, ARC → wall curve detection | Medium |
| Layer filter (import only specific layers) | High |
| DIMENSION entities → construction-dimension nodes | Medium |
| Hatch regions → zone nodes | Medium |
| DWG import (not DXF) | High |

---

## DWG — MISSING ENTIRELY (HIGH PRIORITY)

DWG is the dominant CAD file format used by architects. No DWG read or write. This forces users to request DXF exports from AutoCAD/Revit, which is lossy and requires extra steps.

**Recommended approach:**
- Use LibreCAD's `libdxfrw` (MIT) for DXF; DWG is legally complex
- Alternatively: `ODA File Converter` (free but proprietary) server-side
- Or: accept DWG upload → convert to DXF server-side via ODA → import DXF

---

## GLB / glTF Details

### GLB Export (Pro tier)
Exports the full 3D scene as a binary glTF.

**GLB Export Gaps:**
| Gap | Priority |
|---|---|
| Texture baking (item textures into scene GLB) | Medium |
| Draco compression for large meshes | Medium |
| KTX2 texture export | Medium |
| Animation export (door/window open states) | Low |
| LOD export for web viewers | Low |
| Point cloud nodes excluded from GLB | Medium |
| Scan/LiDAR data in GLB | Low |

### GLB Import — MISSING
Users cannot import a GLB scene into Aruct to continue editing. Items import as `item` nodes (catalog items) but a whole-scene GLB cannot be reconstructed into editable nodes.

---

## PDF — MISSING (HIGH PRIORITY)

### PDF Plan Underlay / Import
Architects work constantly with PDF plans received from consultants, surveys, or clients. No PDF underlay in Aruct. Users cannot:
- Import a PDF floor plan as a reference for tracing walls
- Scale/calibrate the PDF underlay

**Recommended approach:** Convert PDF page to image server-side (using `pdfjs-dist`), then show as a texture on a guide plane in the 2D view.

### PDF Plot / Print Output
No vector PDF export of the 2D floor plan (only screenshot-based thumbnail). CadCraft's `PLOT` command produces proper PDF with layers, fonts, and lineweights.

---

## Formats Comparison — Aruct vs CadCraft

| Format | CadCraft | Aruct |
|---|---|---|
| DXF read | ✅ R12–2018, ASCII + binary | ✅ Partial (2D entities) |
| DXF write | ✅ R2000, full round-trip | ✅ Partial (floor plan) |
| DWG read | ✅ R13–2018 (via acadrust) | ❌ |
| DWG write | ✅ R2000 | ❌ |
| SVG export | ✅ | ❌ |
| PNG export | ✅ | ✅ (thumbnail) |
| PDF plot | ✅ | ❌ (vector); ✅ screenshot only |
| IFC export | ❌ | ✅ (Team) |
| IFC import | ❌ | ❌ |
| GLB export | ❌ | ✅ (Pro) |
| BOM CSV | ❌ | ✅ (Pro) |
| LAS/LAZ point cloud | ❌ | ✅ (Pro) |
| STL | ❌ | ❌ |
| OBJ | ❌ | ❌ |
| Rhino 3DM | ❌ | ❌ |
| Revit RVT | ❌ | ❌ |

---

## Recommended Roadmap

1. **IFC import** — highest impact for BIM professionals
2. **PDF underlay** — instant value for tracing plans
3. **DWG import** (server-side ODA conversion) — opens the AutoCAD user base
4. **DXF export improvement** — proper layers, text, dimensions
5. **Vector PDF floor plan export** — replaces screenshot for drawings
6. **GLB import** (scene reconstruction) — round-trip for external tools
7. **STL / OBJ export** — 3D printing and rendering
