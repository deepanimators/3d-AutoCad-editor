# Mesh Editor Plugin — Blender-like Capabilities

**Plugin ID:** `aruct:plugin-mesh-editor`
**Plan:** Pro
**Category:** modeling

---

## What Exists Today

Aruct is **exclusively parametric**. All geometry is produced by pure `geometry(node, ctx)` builders
and rebuilt by `GeometrySystem` on node dirty. There is NO vertex/edge/face editing anywhere.

The only "free-form" affordances today:
- Polygon boundary/hole editing on slab, ceiling, zone, site (vertex/midpoint/edge handles on 2D polygons)
- Spline control-point/tangent editing on fences
- CSG exists engine-internally (roof segments, dormers cut roof) — not user-exposed

`item` nodes are opaque loaded GLB meshes. No sub-object editing.

---

## What Users Need (Priority Order)

### Tier 1 — Must have (month 1–3)

| Capability | Description | Effort |
|---|---|---|
| **`mesh` node type** | New schema node holding serializable BufferGeometry (positions, normals, UVs, index). Foundational — everything below requires it. | **L** |
| **Vertex select + move** | Box/lasso/click vertex selection; translate selected verts; snap to grid/other verts | **M** |
| **Extrude** | Push/pull selected faces along normals — SketchUp's most-used verb. | **M** |
| **Face select + move** | Select faces, translate/rotate/scale selection | **M** |

### Tier 2 — High value (month 4–6)

| Capability | Description | Effort |
|---|---|---|
| **Edge select + slide** | Select edges, edge loops; slide along surface | **M** |
| **Loop cut** | Insert edge loops with slide preview | **M** |
| **Bevel** | Chamfer/round edges and vertices with segment count | **M** |
| **User-facing boolean ops** | Expose union/subtract/intersect between meshes (CSG engine already exists in `three-bvh-csg`) | **M** |
| **Import as editable mesh** | Convert placed `item` GLB into an editable `mesh` node | **M** |

### Tier 3 — Advanced (month 7–12)

| Capability | Description | Effort |
|---|---|---|
| **Subdivision surface** | Catmull-Clark smoothing for organic forms | **L** |
| **Sculpt brushes** | Grab, smooth, inflate, pinch, flatten brushes for terrain/organics | **XL** |
| **Normal editing** | Per-vertex/face normal overrides for shading control | **M** |
| **UV editing panel** | 2D UV map editor with unwrap modes (smart, cube, cylinder, sphere, planar) | **L** |

---

## Implementation Architecture

### Recommended Approach: Three.js Half-Edge + TSL Pipeline

**Why:** Full control, native integration with existing registry/renderer/selection/undo architecture.
No GPL contamination (Blender is GPL). Works in the WebGPU/TSL pipeline without any new heavy dependency.

**Existing assets to reuse:**
- `three-bvh-csg` (already in `packages/viewer/package.json`) — for boolean ops
- `three-mesh-bvh` (already in `packages/editor`) — for raycast acceleration
- `Box3`, `BufferGeometry`, `Vector3` already imported throughout

### Data Model

```typescript
// packages/core/src/schema/nodes/mesh.ts

const meshSchema = baseNode.extend({
  type: z.literal('mesh'),
  // Serializable geometry — stored as typed arrays
  positions: z.array(z.number()),   // Float32, stride 3
  normals: z.array(z.number()),     // Float32, stride 3 (recomputed if empty)
  uvs: z.array(z.number()),         // Float32, stride 2
  indices: z.array(z.number()),     // Uint32
  // Sub-object selection (not persisted — editor state only)
  // material slot override
  materialSlot: z.string().optional(),
})

export type MeshNode = z.infer<typeof meshSchema>
```

Geometry persists as flat number arrays in the scene graph (JSON-safe).
On load: reconstruct `BufferGeometry` from arrays.
On edit: run topology operation → write new arrays → `updateNode`.

### Half-Edge Topology Layer (packages/nodes/src/mesh/topology.ts)

Build a lightweight half-edge data structure ONLY when the mesh editor is active.
Not persisted — constructed from the stored arrays at edit time.

```typescript
interface HalfEdgeMesh {
  vertices: Vertex[]
  halfEdges: HalfEdge[]
  faces: Face[]
  // Ops:
  extrude(faceIds: number[], distance: number): HalfEdgeMesh
  loopCut(edgeId: number, count: number): HalfEdgeMesh
  bevel(edgeIds: number[], amount: number, segments: number): HalfEdgeMesh
  dissolveEdge(edgeId: number): HalfEdgeMesh
  toBufferGeometry(): BufferGeometry
}
```

### Sub-object Selection

Extend `SelectionManager` with a mode: `'node' | 'vertex' | 'edge' | 'face'`.
When an editable mesh is selected and the mesh-editor plugin is active, the SelectionManager
enters sub-object mode. Raycasting targets the BVH-accelerated geometry, not the node handle.

```typescript
// packages/core/src/selection/selection-manager.ts
// Add sub-object selection mode:
type SubObjectSelection = {
  nodeId: string
  mode: 'vertex' | 'edge' | 'face'
  indices: Set<number>
}
```

### Undo Integration

Sub-object edits create standard `apply_patch` ops (the undo step stores old vs new
positions/normals/uvs/indices). No special undo infrastructure needed — same as node param changes.

### Registry Integration

```typescript
// packages/nodes/src/mesh/definition.ts
export const meshDefinition: NodeDefinition<MeshNode> = {
  kind: 'mesh',
  category: 'geometry',
  renderer: MeshNodeRenderer,       // Three.js BufferGeometry → Mesh
  floorplan: buildMeshFloorplan,    // XZ projection footprint
  parametrics: meshParametrics,     // bounding box readout, vertex count
  tool: MeshPlacementTool,          // cube/sphere/cylinder primitives to start
  affordances: [MeshEditAffordance],// vertex handles when selected + editor active
}
```

### Mesh Editor Panel (sidebar)

```
┌─────────────────────────────────┐
│ Mesh Editor          [✏ Edit]   │
├─────────────────────────────────┤
│ Mode: [Vertex] [Edge] [Face]    │
│                                 │
│ Selection: 4 vertices           │
│ Transform: [Move] [Rotate] [Scale]│
│                                 │
│ Operations:                     │
│  [Extrude]  [Loop Cut]  [Bevel] │
│  [Dissolve] [Merge]  [Fill]     │
│  [Boolean Union]                │
│  [Boolean Subtract]             │
│                                 │
│ Import as mesh:                 │
│  [Convert selected item →]      │
└─────────────────────────────────┘
```

---

## Plugin Entry (catalog.ts addition)

```typescript
{
  id: 'aruct:plugin-mesh-editor',
  name: 'Mesh Editor',
  description: 'Edit vertices, edges, and faces of 3D objects directly.',
  longDescription: 'Blender-style mesh editing for Aruct. Select vertices, extrude faces, add edge loops, bevel edges, and run boolean operations. Convert any imported model to an editable mesh. Essential for custom architectural forms, feature walls, and bespoke furniture.',
  category: 'modeling',
  requiredPlan: 'pro',
  status: 'beta',
  icon: '✏️',
  features: [
    'Vertex, edge, and face selection modes',
    'Extrude faces (push/pull)',
    'Loop cut and bevel',
    'Boolean union / subtract / intersect',
    'Convert imported GLB to editable mesh',
    'UV editing panel',
  ],
  builtIn: false,
}
```

---

## Phased Delivery

| Phase | Features | Duration |
|---|---|---|
| **v1** | `mesh` node type, vertex/face select + move, extrude, cube/sphere/cylinder primitives | 6 weeks |
| **v2** | Edge select + slide, loop cut, bevel, boolean ops, GLB→mesh conversion | 6 weeks |
| **v3** | Subdivision surface, UV editing panel | 4 weeks |
| **v4** | Sculpt brushes (grab, smooth, inflate) | 8 weeks |

Total to feature-complete: ~6 months.
