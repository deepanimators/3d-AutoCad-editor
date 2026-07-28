# Sections & Elevations — Codebase Investigation

**Date:** 2026-07-28
**Status:** Complete

---

## Key Findings

1. **Orthographic camera already exists** — fully functional, toggled via `useViewer.cameraMode`
2. **No clipping planes** — no `renderer.clippingPlanes` anywhere; wall banding uses material splits + CSG, not runtime clipping
3. **Node registration pattern** is clear — discriminated union in `packages/core/src/schema/types.ts`
4. **Drawing-sheet node already exists** at `packages/core/src/schema/nodes/drawing-sheet.ts`

---

## Orthographic Camera

**`packages/viewer/src/components/viewer/viewer-camera.tsx`**
```typescript
export const ViewerCamera = () => {
  const cameraMode = useViewer((state) => state.cameraMode)
  return cameraMode === 'perspective' ? (
    <PerspectiveCamera far={1000} fov={50} makeDefault near={0.1} position={[10, 10, 10]} />
  ) : (
    <OrthographicCamera far={1000} makeDefault near={-1000} position={[10, 10, 10]} zoom={20} />
  )
}
```

**`packages/viewer/src/store/use-viewer.ts`** (line ~40)
```typescript
cameraMode: 'perspective' | 'orthographic'
setCameraMode: (mode: 'perspective' | 'orthographic') => void
```

**`packages/core/src/schema/camera.ts`**
```typescript
export const CameraSchema = z.object({
  position: Vector3Schema,
  target: Vector3Schema,
  mode: z.enum(['perspective', 'orthographic']).default('perspective'),
  fov: z.number().optional(),
  zoom: z.number().optional(),
})
```

To trigger orthographic view from section panel:
```typescript
import { useViewer } from '@aruct/viewer'
useViewer.getState().setCameraMode('orthographic')
// Also set camera position to look along section normal
```

---

## Clipping Planes — Current State

**None.** Zero matches for `clippingPlanes` in `packages/viewer/src/`.

Wall banding (material split at floor height) uses `splitGeometryAtHorizontalPlanes()` — a
pre-split geometry technique, not runtime clipping. CSG (door/window cutouts) uses `three-bvh-csg`.

For section cut rendering, we have two options:
1. **Three.js `renderer.clippingPlanes`** — global clip, shows everything beyond the plane clipped.
   Requires access to the WebGPURenderer instance. Needs investigation into how to access it from React.
2. **Custom TSL shader clip** — add a clip plane uniform to node materials. More surgical but more work.
3. **V1 shortcut: orthographic camera only** — position camera at section normal, no clip. Shows section
   as an elevation/cutaway looking through the building. Not a true section but useful and shippable fast.

---

## Node Schema Registration Pattern

**`packages/core/src/schema/types.ts`** (lines 49–97)

All nodes register via Zod discriminated union on `type`:
```typescript
export const AnyNode = z.discriminatedUnion('type', [
  SiteNode,
  BuildingNode,
  // ... 47 entries
])
```

**`packages/core/src/schema/base.ts`** — BaseNode:
```typescript
export const BaseNode = z.object({
  id: z.string(),
  type: nodeType('node'),
  name: z.string().optional(),
  parentId: z.string().nullable(),
  visible: z.boolean().default(true),
  camera: CameraSchema.optional(),
  metadata: z.json().optional(),
})
```

---

## Node Definition Pattern (guide example)

**`packages/nodes/src/guide/definition.ts`**
```typescript
export const guideDefinition: NodeDefinition<typeof GuideNode> = {
  kind: 'guide',
  bake: 'strip',
  schemaVersion: 1,
  schema: GuideNode,
  category: 'site',
  defaults: () => { /* ... */ },
  capabilities: {
    selectable: { hitVolume: 'bbox' },
    duplicable: false,
    deletable: true,
    presettable: false,
  },
  parametrics: guideParametrics,
  dirtyTracking: false,
  renderer: { kind: 'parametric', module: () => import('./renderer') },
  system: { module: () => import('./system'), priority: 5 },
  presentation: { /* ... */ },
  mcp: { /* ... */ },
}
```

Files per node kind:
```
packages/nodes/src/<kind>/
  definition.ts   — NodeDefinition export
  schema.ts       — local schema re-export
  renderer.tsx    — React Three Fiber component
  system.tsx      — per-frame system
  parametrics.ts  — UI controls
  index.ts        — barrel
```

---

## Drawing Sheet Node (existing)

**`packages/core/src/schema/nodes/drawing-sheet.ts`** (174 lines)

Complex nested structures: `DrawingSheetPlacedView`, `DrawingSheetDocumentMarker`,
`DrawingSheetKeyedNoteInstance`. Uses internal discriminated unions for marker kinds.

Section views should eventually target `DrawingSheetPlacedView` — but not needed for v1 panel.

---

## Rendering Architecture

**Entry:** `packages/viewer/src/components/viewer/index.tsx`
- Mounts: `<SceneRenderer>`, `<RegisteredSystems>`, `<ViewerCamera>`, `<Lights>`, `<PostProcessing>`

**Dispatch:** `packages/viewer/src/components/renderers/node-renderer.tsx` (lines 30–56)
- Path 1: Custom JSX renderer (wall, door, window)
- Path 2: Generic `<ParametricNodeRenderer>` for pure `def.geometry()` kinds

**Systems** (`packages/viewer/src/systems/`): 18 directories, sorted by priority (GeometrySystem = 2)

**Post-processing** (`packages/viewer/src/components/viewer/post-processing.tsx`):
AO/SSGI, denoise, selection outline, full RenderPipeline

---

## What To Implement (v1)

### Step 1: Section node schema
**Create:** `packages/core/src/schema/nodes/section.ts`
```typescript
export const sectionSchema = baseNode.extend({
  type: z.literal('section'),
  planePosition: z.tuple([z.number(), z.number(), z.number()]).default([0, 2, 0]),
  planeNormal: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 1]),
  width: z.number().default(20),
  height: z.number().default(6),
  label: z.string().default('Section A'),
})
export type SectionNode = z.infer<typeof sectionSchema>
```

**Edit:** `packages/core/src/schema/types.ts` — add `SectionNode` to the `AnyNode` discriminated union

### Step 2: Section node definition + renderer
**Create:** `packages/nodes/src/section/` with definition.ts, renderer.tsx (dashed box in 3D showing cut plane), system.tsx, parametrics.ts

### Step 3: Sections panel
**Create:** `apps/editor/components/panels/sections-panel.tsx`
- List section nodes, Add button, position controls
- "View" button: calls `useViewer.getState().setCameraMode('orthographic')` + positions camera

### Step 4: Plugin catalog + sidebar tab
- Add `aruct:plugin-sections` to `apps/editor/lib/plugins/catalog.ts`
- Add conditional tab in `apps/editor/app/page.tsx` + `apps/editor/components/scene-loader.tsx`

### V1 Clipping Strategy
Use `renderer.clippingPlanes` accessed via `useThree().gl` from inside the Canvas. A `SectionClippingSystem` component (mounted inside Canvas when plugin enabled) can manage clipping planes reactively.

---

## Files To Touch

| File | Action |
|---|---|
| `packages/core/src/schema/nodes/section.ts` | CREATE |
| `packages/core/src/schema/types.ts` | EDIT — add SectionNode to union |
| `packages/nodes/src/section/definition.ts` | CREATE |
| `packages/nodes/src/section/renderer.tsx` | CREATE |
| `packages/nodes/src/section/system.tsx` | CREATE |
| `apps/editor/components/panels/sections-panel.tsx` | CREATE |
| `apps/editor/lib/plugins/catalog.ts` | EDIT |
| `apps/editor/app/page.tsx` | EDIT |
| `apps/editor/components/scene-loader.tsx` | EDIT |

---

## Effort Estimate

**v1 (orthographic view + section plane node):** 2 weeks
**v2 (clipping plane cut):** +1 week (need renderer access pattern)
**v3 (section on drawing-sheet):** +2 weeks
