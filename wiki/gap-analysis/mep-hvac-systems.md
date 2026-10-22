# MEP / HVAC Systems — Features and Gaps

MEP = Mechanical, Electrical, Plumbing

Source: `packages/core/src/schema/nodes/` (duct-*, pipe-*, hvac-*, liquid-line), `packages/core/src/services/system-graph.ts`, `packages/core/src/services/riser-diagram.ts`

## What Exists

### Schema / Data Model

#### HVAC Ductwork
| Node | File | Fields |
|---|---|---|
| `duct-segment` | `duct-segment.ts` | shape (rect/round/oval), width, height/diameter, materialId, insulation, flow direction |
| `duct-fitting` | `duct-fitting.ts` | fitting type (elbow/tee/reducer/cap), transition geometry |
| `duct-terminal` | `duct-terminal.ts` | terminal type (supply/return/exhaust), CFM, neck size |
| `hvac-equipment` | `hvac-equipment.ts` | equipment type (AHU/RTU/FCU/split), capacity (tons/kW), connections |

#### Plumbing
| Node | File | Fields |
|---|---|---|
| `pipe-segment` | `pipe-segment.ts` | material (copper/PVC/CPVC/PEX/cast-iron), diameter, schedule, slope |
| `pipe-fitting` | `pipe-fitting.ts` | fitting type (elbow/tee/coupling/reducer/union) |
| `pipe-trap` | `pipe-trap.ts` | trap type (P-trap/S-trap), inlet/outlet connections |
| `liquid-line` | `liquid-line.ts` | refrigerant/gas lines; insulation; line set type |

#### Roof Venting (passive)
| Node | Notes |
|---|---|
| `box-vent` | Attic ventilation |
| `ridge-vent` | Continuous ridge ventilation |
| `turbine-vent` | Spinning turbine ventilator |
| `eyebrow-vent` | Eave ventilator |

### System Graph (`packages/core/src/services/system-graph.ts`)
- Port connectivity model: each MEP node has typed ports (inlet/outlet/branch)
- Graph validates connections (duct to duct, pipe to fitting, etc.)
- Tests: `system-graph.test.ts`
- `validate-dwv.ts` — drain/waste/vent system validation

### Port Connectivity (`packages/core/src/services/port-connectivity.ts`)
- Connects MEP segments end-to-end
- Tests: `port-connectivity.test.ts`

### Riser Diagram (`packages/core/src/services/riser-diagram.ts`)
- Generates a schematic riser diagram from the pipe/duct 3D topology
- Shows vertical stacks and horizontal branches in diagrammatic form
- Tests: `riser-diagram.test.ts`

---

## Gaps

### 3D Renderers (ALL MISSING — HIGH PRIORITY)
None of the MEP node types have a 3D renderer. The data model is rich but nothing is visible in the 3D view. Users have to infer MEP routing from the system graph only.

| Missing Renderer | Priority |
|---|---|
| Duct segment (rectangular, round) | High |
| Duct fitting (elbow, tee, reducer) | High |
| Duct terminal (ceiling diffuser, grille) | High |
| HVAC equipment (box geometry with connections) | High |
| Pipe segment (cylinder + insulation wrap) | High |
| Pipe fitting (elbow, tee) | High |
| Pipe trap | Medium |
| Liquid line (flexible line path) | Medium |

**Recommended approach:** Procedural geometry for ducts (BoxGeometry for rect, CylinderGeometry for round); fittings generated from transition geometry. Items catalog for equipment (pre-modeled GLB assets for RTUs, FCUs, AHUs).

### MEP Editor Tools (ALL MISSING — HIGH PRIORITY)
No tools for drawing MEP systems. Users can create nodes via scene graph but there's no interactive tool.

| Missing Tool | Priority |
|---|---|
| Duct draw tool (click start → click end → segment created) | High |
| Pipe draw tool (similar to wall draw) | High |
| Fitting auto-insert (elbow inserted when duct changes direction) | High |
| Terminal placement on ceiling/wall | High |
| Equipment placement tool | High |
| MEP routing (auto-route between two points avoiding obstacles) | Medium |
| Clash detection (MEP vs. structure) | Medium |

### MEP Properties (MEDIUM PRIORITY)
| Gap | Notes |
|---|---|
| Duct sizing (ASHRAE calculations: CFM → duct size) | Mechanical engineers need this |
| Pipe sizing (flow rate → pipe diameter) | — |
| Pressure drop calculations | — |
| Friction loss | — |
| HVAC load matching (equipment selection vs. zone loads) | Needs energy panel data |

### Electrical (ENTIRELY MISSING)
No electrical node types at all.

| Missing Kind | Notes |
|---|---|
| `circuit-breaker-panel` | Electrical panel location |
| `conduit-segment` | Electrical conduit routing |
| `wire-run` | Wire path between devices |
| `receptacle` | Outlet placement |
| `lighting-fixture` | (item lights exist; no electrical circuit) |
| `switch` | Light switch |
| `smoke-detector` | Life safety |
| `data-outlet` / `network-port` | Low-voltage |
| `circuit` | Group devices into circuits |

### Standards / Compliance (LOW — External)
| Gap | Notes |
|---|---|
| SMACNA ductwork standards | Duct sizing tables |
| ASHRAE 62.1 ventilation | Minimum OA calculations |
| IPC / UPC plumbing code | Drain sizing, trap requirements |
| NEC electrical code | Wire sizing, circuit load |

---

## What Aruct Has vs CadCraft

| MEP Feature | CadCraft | Aruct |
|---|---|---|
| MEP data model | ❌ | ✅ (rich schema) |
| MEP 3D renderer | ❌ | ❌ |
| MEP editor tools | ❌ | ❌ |
| HVAC equipment schema | ❌ | ✅ |
| Plumbing schema | ❌ | ✅ |
| Riser diagram | ❌ | ✅ (logic, no UI) |
| System graph validation | ❌ | ✅ |
| DWV validation | ❌ | ✅ |
| IFC MEP export | ❌ | ❌ |
| Electrical schema | ❌ | ❌ |
| Clash detection | ❌ | ❌ |

Aruct has the most complete MEP data model of any web-based architectural editor, but it lacks 3D visibility and edit tools — making it invisible to users currently.

---

## Recommended Next Steps

1. **Duct segment + pipe segment 3D renderers** — even simple cylinders/boxes make MEP visible
2. **Pipe draw tool** — interactive routing tool similar to wall draw
3. **Duct draw tool** — interactive duct routing with direction locking
4. **Auto-fitting insertion** — when a segment direction changes, insert appropriate elbow
5. **Riser diagram panel** — expose the riser diagram service in a UI panel
6. **Clash detection** — check MEP segments against structural and architectural elements
7. **IFC MEP export** — `IfcDuctSegment`, `IfcPipeSegment`, `IfcFlowFitting`
8. **Electrical schema** — add `receptacle`, `conduit-segment`, `circuit` node types
