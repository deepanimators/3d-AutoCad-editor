# Gap Analysis — Missing Features for Professional Architects

Benchmarked against: Revit, ArchiCAD, SketchUp Pro, Blender, Rhino.

Effort key: **S** < 1 week · **M** 1–4 weeks · **L** 1–3 months · **XL** 3+ months

---

## Critical Gaps

These block professional use entirely.

| Gap | Why it matters | Effort | Plugin? |
|---|---|---|---|
| **GLB/glTF export** | Universal 3D handoff format. Gate exists in code but export is unimplemented. Blocks Blender, AR/VR, game engine, web viewer pipelines. | **M** | Pro plugin |
| **DWG/DXF import & export** | Industry lingua franca. Consultants, surveyors, clients expect DWG. Every desktop CAD tool supports it. Without it, Aruct can't enter real project workflows. | **XL** | Pro plugin |
| **Full PBR material / texture pipeline** | No texture upload, no UV control, no material graph. Caps photorealism, prevents accurate material takeoffs, makes client presentations look unfinished. | **XL** | Pro plugin |
| **Free-form mesh editing (Blender-like)** | Platform is parametric-only. Architects need custom forms: feature walls, sculpted ceilings, site features, bespoke furniture. Push/pull is SketchUp's most-used verb. | **XL** | Pro plugin |
| **Door / window / room / finish schedules** | Primary CD deliverable. `drawing-sheet` node exists but no schedule engine. Revit and ArchiCAD produce these automatically. | **L** | Pro plugin |

---

## High Priority Gaps

Material to real project use.

| Gap | Why it matters | Effort | Plugin? |
|---|---|---|---|
| **Terrain / site topography** | `site` is a flat polygon only. Real sites have grades, contours, cut/fill. Site plans and sections need topography. | **L** | Pro plugin |
| **Sections & elevations as documented views** | No section-cut engine. Orthographic views exist but no annotated section/elevation on sheets. Core CD deliverable. | **L** | Pro plugin |
| **OBJ / FBX / glTF geometry import** | Manufacturers, consultants, scanned meshes. Only GLB-via-catalog + IFC import exist today. | **M** | Free |
| **Point-cloud (.e57 / .las) support** | `scan` node is image-only placeholder. As-built and renovation work needs real point clouds. | **L** | Team plugin |
| **Room area analytics & code checking** | `zone` captures rooms but no gross/net area rollup, occupancy loads, egress path checking, or program-vs-actual comparison. | **M** | Pro plugin |
| **Curtain wall / facade grid system** | No mullion-panel-spandrel system. Major element in commercial architecture. | **L** | Pro plugin |
| **Production-safe collaboration** | Presence is in-memory, unauthenticated, single-instance. Not production-safe for real multi-user teams. | **L** | Team plugin |

---

## Medium Priority

Needed for polish and professional workflow.

| Gap | Why it matters | Effort | Plugin? |
|---|---|---|---|
| **Component / family authoring UI** | Parametrics are code-only. Users can't create reusable parametric families without writing a plugin (vs Revit families, SketchUp components). | **L** | Pro plugin |
| **Offline ray-traced render** | SSGI is real-time approximation. No V-Ray/Enscape/Twinmotion-quality output for client presentations. | **L** | Pro plugin |
| **Annotations: text, leaders, tags, symbol library** | Beyond dimensions and zone labels, no free text, callout leaders, or legend library on sheets. | **M** | Free |
| **User-defined layers / visibility filters** | `levelMode` and type toggles exist but no user layers, worksets, or per-view visibility overrides. | **M** | Pro plugin |
| **Structural analysis** | `structural-grid` is annotation-only. No beams, framing members, or analytical model. | **XL** | Team plugin |
| **Energy / daylighting analysis** | Sun Study casts shadows but no daylight factor, thermal envelope, or energy modeling. | **XL** | Team plugin |

---

## Low Priority

Important but non-blocking.

| Gap | Why it matters | Effort | Plugin? |
|---|---|---|---|
| **WebXR / VR headset mode** | Walkthrough exists but no WebXR for VR headsets. | **M** | Pro plugin |
| **Version history / diff UI** | MCP supports checkpoints; no rich UI for users. | **M** | Free |
| **Keyboard shortcut customization** | Fixed in `use-keyboard.ts`. | **S** | Free |
| **Measurement → schedule export** | Measurements can't be tabulated/exported. | **S** | Free |
| **Landscape / hardscape parametrics** | Nature plugin has trees; no paving, planters, retaining walls. | **M** | Free/Pro |

---

## Gap vs Competitor Matrix

| Feature | Aruct | SketchUp Pro | Revit | ArchiCAD | Blender |
|---|---|---|---|---|---|
| Parametric building elements | ✅ 47 types | ⚠️ limited | ✅ families | ✅ objects | ❌ |
| Free-form mesh edit | ❌ | ✅ push/pull | ❌ | ❌ | ✅ full |
| PBR materials + texture upload | ❌ slot refs only | ✅ | ✅ | ✅ | ✅ full |
| UV unwrapping | ❌ | ✅ | ⚠️ | ⚠️ | ✅ full |
| DWG import/export | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| IFC import/export | ✅ | ⚠️ plugin | ✅ | ✅ | ⚠️ |
| GLB export | ❌ | ❌ | ❌ | ❌ | ✅ |
| Sections/elevations on sheets | ❌ | ✅ | ✅ | ✅ | ❌ |
| Door/window/room schedules | ❌ | ⚠️ | ✅ | ✅ | ❌ |
| AI / MCP integration | ✅ best-in-class | ❌ | ❌ | ❌ | ⚠️ |
| Browser-based, no install | ✅ | ❌ | ❌ | ❌ | ❌ |
| MEP (HVAC + plumbing) | ✅ | ❌ | ✅ | ⚠️ | ❌ |
| Terrain/topography | ❌ | ✅ Sandbox | ✅ | ✅ | ✅ |
| Real-time collaboration | ⚠️ beta | ❌ | ⚠️ cloud | ⚠️ BIMcloud | ❌ |
| Offline render | ❌ | V-Ray plugin | Enscape | Enscape | ✅ Cycles |
| Point clouds | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## Aruct's Differentiators (Strengths to Build On)

1. **Browser-based, zero install** — only web tool with this parametric depth
2. **MCP / AI integration** — Claude/Cursor can author and modify scenes via 50+ tools; no competitor has this
3. **47 parametric node types** — MEP, classical columns, full roof accessories unmatched in browser tools
4. **Schema-driven, clean layer architecture** — plugins can contribute rendering, tools, inspector, floorplan, MCP descriptions without touching core
5. **Single scene graph feeds 2D and 3D** — true parity, no separate 2D/3D models
