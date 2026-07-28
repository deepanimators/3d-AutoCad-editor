# Texture & Material Plugin — Full PBR Pipeline

**Plugin ID:** `aruct:plugin-texture-manager`
**Plan:** Pro
**Category:** materials

---

## What Exists Today

Aruct has a **slot-based color tinting system** only:

- Each node kind declares named material slots (e.g., `wall`: `interior`, `exterior`, `band`, `trim`)
- Slots store a hex color string: `slot.color = '#c0a0c0'`
- 4 global presets (clay, white, mono, blueprint) tint all slots simultaneously
- Material Paint mode: click a surface to apply current slot color
- **No texture upload, no UV mapping, no PBR parameters, no material asset library**

The renderer uses `MeshLambertMaterial` for solid mode and `MeshStandardMaterial` for rendered mode —
the PBR material (`MeshStandardMaterial`) already understands `map`, `roughnessMap`, `normalMap`, etc.
The pipeline is ready; only the data layer and UI are missing.

---

## What Users Need (Priority Order)

### Tier 1 — Essential (month 1–3)

| Capability | Description | Effort |
|---|---|---|
| **Texture upload + hosting** | Upload PNG/JPG/WebP → stored in R2, referenced by URL in material slot | **M** |
| **Albedo (color/diffuse) map** | Assign texture image to the base color of a slot | **S** |
| **Roughness + metalness maps** | PBR parameter textures for realistic surfaces | **S** |
| **Normal map** | Surface detail without geometry cost | **S** |
| **UV scale / offset / rotation** | Tile texture across large surfaces; align patterns | **M** |
| **Material library panel** | Browse, preview, and apply saved materials | **M** |

### Tier 2 — Important (month 4–6)

| Capability | Description | Effort |
|---|---|---|
| **Poly Haven texture import** | Direct import of CC0 PBR texture packs (already have Poly Haven API access) | **M** |
| **Ambient occlusion map** | Baked AO for contact shadow detail | **S** |
| **Emissive map** | Self-illuminated surfaces (screens, signage, neon) | **S** |
| **Opacity / alpha map** | Translucent materials (glass brick, perforated metal) | **S** |
| **Displacement map** | Geometric surface displacement (stone, tile grout) | **M** |
| **Per-face material assignment** | Assign different materials to different faces of an item | **L** |

### Tier 3 — Advanced (month 7–12)

| Capability | Description | Effort |
|---|---|---|
| **Material graph / node editor** | Visual shader graph (nodes, blend modes, mix) | **XL** |
| **UV unwrapping tools** | Auto smart-unwrap, seam marking, packing | **L** |
| **Substance/Quixel bridge** | Direct import from Substance 3D Assets, Megascans | **L** |
| **Procedural texture generators** | Noise, brick, wood grain, concrete crack generators | **L** |
| **Material takeoff output** | Export material list with area per material to CSV | **M** |

---

## Data Model Changes

### Material Slot Upgrade

Extend the existing slot schema in `packages/core/src/schema/shared/material.ts`:

```typescript
// Current:
const slotSchema = z.object({
  color: z.string().optional(),
})

// Extended:
const textureRefSchema = z.object({
  url: z.string(),                 // R2 CDN URL or absolute URL
  scaleU: z.number().default(1),
  scaleV: z.number().default(1),
  offsetU: z.number().default(0),
  offsetV: z.number().default(0),
  rotation: z.number().default(0),  // radians
})

const slotSchema = z.object({
  color: z.string().optional(),
  // PBR maps — all optional; any absent = renderer defaults
  albedoMap: textureRefSchema.optional(),
  roughnessMap: textureRefSchema.optional(),
  metalnessMap: textureRefSchema.optional(),
  normalMap: textureRefSchema.optional(),
  aoMap: textureRefSchema.optional(),
  emissiveMap: textureRefSchema.optional(),
  opacityMap: textureRefSchema.optional(),
  displacementMap: textureRefSchema.optional(),
  // PBR scalars (override when no map)
  roughness: z.number().min(0).max(1).default(0.7),
  metalness: z.number().min(0).max(1).default(0.0),
  emissiveIntensity: z.number().default(0),
})
```

Backwards-compatible: all new fields optional, existing scenes unaffected.

### Material Library Asset (DB + R2)

New DB table `material_assets`:

```sql
CREATE TABLE material_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT REFERENCES users(id),  -- null = global/built-in
  name        TEXT NOT NULL,
  thumbnail   TEXT,                       -- R2 URL for preview
  slot_data   JSONB NOT NULL,             -- serialized slotSchema
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Materials are portable slot-data blobs. Apply to any node's slot by reference.

---

## Renderer Integration

`MeshStandardMaterial` already accepts all these maps. Integration is mechanical:

```typescript
// packages/nodes/src/shared/material-builder.ts

function buildMaterial(slot: SlotData): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: new Color(slot.color ?? '#ffffff'),
    roughness: slot.roughness ?? 0.7,
    metalness: slot.metalness ?? 0.0,
  })

  if (slot.albedoMap) mat.map = loadTexture(slot.albedoMap)
  if (slot.roughnessMap) mat.roughnessMap = loadTexture(slot.roughnessMap)
  if (slot.metalnessMap) mat.metalnessMap = loadTexture(slot.metalnessMap)
  if (slot.normalMap) mat.normalMap = loadTexture(slot.normalMap)
  if (slot.aoMap) { mat.aoMap = loadTexture(slot.aoMap); mat.aoMapIntensity = 1 }
  if (slot.emissiveMap) { mat.emissiveMap = loadTexture(slot.emissiveMap); mat.emissiveIntensity = slot.emissiveIntensity ?? 0 }
  if (slot.opacityMap) { mat.alphaMap = loadTexture(slot.opacityMap); mat.transparent = true }

  return mat
}

function loadTexture(ref: TextureRef): Texture {
  const t = textureLoader.load(ref.url)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(ref.scaleU, ref.scaleV)
  t.offset.set(ref.offsetU, ref.offsetV)
  t.rotation = ref.rotation
  return t
}
```

Cache textures by URL in a `Map<string, Texture>` — same URL reused across all nodes.

---

## Upload API (apps/editor)

```typescript
// apps/editor/app/api/textures/upload/route.ts
// Accepts multipart/form-data; stores to R2; returns CDN URL

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (planRank(session.plan) < planRank('pro')) return 403

  const form = await req.formData()
  const file = form.get('file') as File
  // Validate: image, max 16MB, PNG/JPG/WebP/EXR
  const key = `textures/${session.userId}/${uuid()}-${file.name}`
  await r2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  return NextResponse.json({ url: `${process.env.R2_PUBLIC_URL}/${key}` })
}
```

---

## Texture Manager Panel (sidebar)

```
┌──────────────────────────────────────┐
│ Material Editor                      │
├──────────────────────────────────────┤
│ Selected: Wall — exterior slot       │
│                                      │
│  [Preview cube]   Color: #C8C8C8     │
│                   Roughness: 0.65    │
│                   Metalness: 0.00    │
│                                      │
│ Maps:                                │
│  Albedo      [texture-brick.jpg ✕]   │
│  Normal      [+ Upload]              │
│  Roughness   [+ Upload]              │
│  Metalness   [+ Upload]              │
│  AO          [+ Upload]              │
│                                      │
│ UV Tiling:                           │
│  Scale U: [2.0]  Scale V: [2.0]     │
│  Offset U: [0.0] Offset V: [0.0]    │
│  Rotation: [0°]                      │
│                                      │
│ ─────────────────────────────────── │
│ Material Library   [Save current]   │
│ [Brick Wall] [Concrete] [Steel]...  │
│ [From Poly Haven ↗]                  │
└──────────────────────────────────────┘
```

---

## Poly Haven Texture Integration

Poly Haven API already provides JSON metadata + download URLs for PBR texture packs.
Existing Poly Haven plugin handles assets — texture import extends it:

```typescript
// Fetch Poly Haven texture pack:
// GET https://api.polyhaven.com/asset/<id>  → returns files with resolution variants
// Files: diffuse (albedo), nor_gl (normal), rough (roughness), metal (metalness), ao

async function importPolyHavenTexture(assetId: string, resolution: '1k'|'2k'|'4k') {
  const meta = await fetch(`https://api.polyhaven.com/asset/${assetId}`).then(r => r.json())
  const files = meta.files.blend[resolution]  // or .gltf
  return {
    albedoMap: { url: files.diffuse.url },
    normalMap: { url: files.nor_gl.url },
    roughnessMap: { url: files.rough.url },
    aoMap: { url: files.ao.url },
  }
}
```

---

## Plugin Entry

```typescript
{
  id: 'aruct:plugin-texture-manager',
  name: 'Texture & Material Manager',
  description: 'Upload textures, edit PBR materials, and build a material library.',
  longDescription: 'Upload your own texture maps (albedo, normal, roughness, metalness, AO) and apply them to any surface. Browse and import CC0 materials from Poly Haven. Save reusable materials to your library and apply them across scenes. Essential for photorealistic renders and material takeoffs.',
  category: 'materials',
  requiredPlan: 'pro',
  status: 'beta',
  icon: '🎨',
  features: [
    'Upload PNG/JPG/WebP/EXR texture maps',
    'Full PBR: albedo, normal, roughness, metalness, AO, emissive, opacity',
    'UV scale, offset, and rotation per slot',
    'Reusable material library (save and apply across scenes)',
    'Import CC0 PBR texture packs from Poly Haven',
    'Material takeoff: area per material to CSV',
  ],
  builtIn: false,
}
```

---

## Phased Delivery

| Phase | Features | Duration |
|---|---|---|
| **v1** | Schema extension, texture upload API, albedo + roughness + metalness maps, UV scale/offset, slot panel upgrade | 4 weeks |
| **v2** | Normal, AO, emissive, opacity maps; material library (save/load/browse); Poly Haven texture import | 4 weeks |
| **v3** | Displacement map; per-face material on `mesh` node; material takeoff CSV export | 3 weeks |
| **v4** | Procedural generators; Substance/Quixel bridge | 8 weeks |

Total to feature-complete: ~5 months.
