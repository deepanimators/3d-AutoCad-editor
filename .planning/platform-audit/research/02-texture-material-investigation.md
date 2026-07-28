# Texture & Material System — Codebase Investigation

**Date:** 2026-07-28
**Status:** Complete — system is far more mature than expected

---

## Key Findings

1. **`MaterialMapsSchema` already exists** in `packages/core/src/schema/material.ts` with all 10 PBR maps
2. **`MaterialMapPropertiesSchema` already exists** with roughness, metalness, repeat, rotation, normal scale, emissive, AO, etc.
3. **Storage provider chain already exists** in `apps/editor/lib/storage.ts` (S3 → R2 → Firebase fallback)
4. **Unified slot model** already implemented: `node.slots: Record<string, MaterialRef>`
5. **Material paint panel** already exists in `packages/editor/src/components/ui/controls/`

The texture plugin needs: texture file upload API + surface to wire maps through existing resolution chain + panel UI.

---

## Material Schema (packages/core/src/schema/material.ts)

### MaterialProperties (lines 18–26)
```typescript
color: z.string().default('#ffffff')
roughness: z.number().min(0).max(1).default(0.5)
metalness: z.number().min(0).max(1).default(0)
opacity: z.number().min(0).max(1).default(1)
transparent: z.boolean().default(false)
side: z.enum(['front', 'back', 'double']).default('front')
```

### MaterialSchema (lines 28–40)
```typescript
id: z.string().optional()
preset: MaterialPreset.catch('custom').optional()
properties: MaterialProperties.optional()
texture: z.object({
  url: AssetUrl,
  repeat: z.tuple([z.number(), z.number()]).optional(),
  scale: z.number().optional(),
}).optional()
```

### MaterialMapsSchema (lines 72–83) — ALREADY EXISTS
```typescript
albedoMap: AssetUrl.optional()
metalnessMap: AssetUrl.optional()
roughnessMap: AssetUrl.optional()
normalMap: AssetUrl.optional()
displacementMap: AssetUrl.optional()
aoMap: AssetUrl.optional()
emissiveMap: AssetUrl.optional()
bumpMap: AssetUrl.optional()
alphaMap: AssetUrl.optional()
lightMap: AssetUrl.optional()
```

### MaterialMapPropertiesSchema (lines 86–107) — ALREADY EXISTS
```typescript
color, roughness, metalness
repeatX, repeatY, rotation
wrapS, wrapT: TextureWrapMode ('Repeat'|'ClampToEdge'|'MirroredRepeat')
normalScaleX, normalScaleY
emissiveIntensity, emissiveColor
displacementScale, bumpScale
aoMapIntensity, lightMapIntensity
transparent, flipY, opacity, side
```

### MaterialPreset values
`'white' | 'brick' | 'concrete' | 'wood' | 'glass' | 'metal' | 'plaster' | 'tile' | 'marble' | 'custom'`

---

## Slot Model

**`packages/core/src/lib/slots.ts`**
```typescript
// glTF material names starting with 'slot_' mark paintable slots
deriveSlotId('slot_bed_frame.001') → 'bed_frame'  // strips prefix + Blender dedupe suffix
slotLabelFromId('bed_frame') → 'Bed frame'
```

**Wall slots** (`packages/core/src/schema/nodes/wall.ts` lines 109–127):
```typescript
// node.slots: Record<string, string>  — key = slotId, value = MaterialRef
// MaterialRef = 'library:<id>' | 'scene:<id>'
// Missing keys inherit WALL_SURFACE_SLOT_DEFAULTS
```

**Scene material storage** (`packages/core/src/schema/scene-material.ts`):
```typescript
SceneMaterial: { id: SceneMaterialId, name: string, material: MaterialSchema }
// Stored in scene graph, resolved via 'scene:<id>' refs
```

---

## Material Resolution Chain

### Wall (packages/viewer/src/systems/wall/wall-materials.ts)
```
node.slots[slotId]
  → 'library:<id>': lookup in MATERIAL_CATALOG
  → 'scene:<id>':   lookup in scene.materials
  → dangling ref:   fallback to WALL_SLOT_DEFAULT[slotId]
```

### Item / GLB (packages/nodes/src/item/renderer.tsx)
```
GLB material.name → deriveSlotId() → node.slots[slotId] override
  → 'library:<id>': catalog material
  → 'scene:<id>':   scene material
  → absent:         original GLB material
```

### Cabinet (packages/nodes/src/cabinet/geometry/shared.ts)
```
node.slots[slotId] → legacy node.materialPreset → CABINET_SLOT_DEFAULTS[slotId]
```

---

## Storage Infrastructure (apps/editor/lib/storage.ts)

Provider chain:
1. **AWS S3** — `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
2. **Cloudflare R2** — `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
3. **Firebase Storage** — `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `FIREBASE_PROJECT_ID`
4. **None** — uploads disabled

```typescript
uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string>
getStoragePublicUrl(key: string): string   // R2: ${R2_PUBLIC_BASE_URL}/${key}
```

Texture upload just needs to call `uploadBuffer('textures/<userId>/<uuid>.<ext>', buffer, mimeType)`.

---

## Existing Upload API

**`apps/editor/app/api/items/upload/route.ts`**
- Handles GLB item upload with validation + plan check
- Pattern to reuse for texture upload route

---

## Existing Material UI

**`packages/editor/src/components/ui/controls/material-paint-panel.tsx`**
- Paint panel with erase, reset, material picker
- Uses `activePaintMaterial`, `activePaintTarget`, `paintEraser` state

**`packages/editor/src/components/ui/controls/material-picker.tsx`**
- Category tabs: colors, wood, stone, brick, tile, concrete, metal, fabric, leather, roofing, ground, glass, other
- Source filter: all | aruct | mine | workspace | community
- Material swatches from `getDynamicLibraryMaterials()`

---

## What To Implement for Plugin v1

The schema is already complete (`MaterialMapsSchema` exists). The renderer likely doesn't apply maps yet (they're declared in schema but may not be wired through to Three.js materials).

### Step 1: Check if maps are wired in the renderer
Search for `albedoMap` or `normalMap` usage in `packages/viewer/src/systems/wall/wall-materials.ts`
and `packages/viewer/src/lib/materials.ts` to verify. If not wired, add the map application.

### Step 2: Texture upload API
**Create:** `apps/editor/app/api/textures/upload/route.ts`
```typescript
// POST multipart/form-data { file: File }
// Auth + Pro plan check
// Validate: image, max 16MB, PNG/JPG/WebP/EXR
// Call uploadBuffer(`textures/${userId}/${uuid}.${ext}`, buffer, mimeType)
// Return { url: string }
```

### Step 3: Map scene material to use uploaded texture URLs
**Edit** `packages/core/src/schema/scene-material.ts` or `MaterialSchema`:
Add `maps?: MaterialMapsSchema` field to `MaterialSchema` (may already be a field — check).
If `MaterialMapsSchema` is already in `MaterialSchema`, nothing to add.

### Step 4: Texture Manager Panel
**Create:** `apps/editor/components/panels/texture-manager-panel.tsx`
- Show selected node's slots
- For each slot: color swatch + upload button for albedo, normal, roughness, metalness, AO maps
- File input → POST /api/textures/upload → update scene material `.maps.albedoMap = url`
- UV scale/repeat controls (repeatX, repeatY from `MaterialMapPropertiesSchema`)

### Step 5: Plugin catalog entry + sidebar tab
- `apps/editor/lib/plugins/catalog.ts` — add `aruct:plugin-texture-manager` (Pro, materials category)
- `apps/editor/app/page.tsx` — add conditional tab
- `apps/editor/components/scene-loader.tsx` — add conditional tab

---

## Files To Touch

| File | Action |
|---|---|
| `apps/editor/app/api/textures/upload/route.ts` | CREATE |
| `apps/editor/components/panels/texture-manager-panel.tsx` | CREATE |
| `packages/viewer/src/lib/materials.ts` OR `wall-materials.ts` | EDIT — wire PBR maps to Three.js |
| `apps/editor/lib/plugins/catalog.ts` | EDIT |
| `apps/editor/app/page.tsx` | EDIT |
| `apps/editor/components/scene-loader.tsx` | EDIT |

---

## Effort Estimate

**v1 (upload + albedo + roughness/metalness maps + panel):** 2 weeks
Major work is verifying renderer map application and wiring maps through the existing resolution chain.

**Key risk:** `MaterialMapsSchema` may be declared but not applied in the renderer — verify first.
