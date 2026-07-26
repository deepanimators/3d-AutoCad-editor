# Investigation: Items Catalog & 2D Alignment Bugs

**Date:** 2026-07-26  
**Status:** Partially fixed — AI catalog persistence pending

---

## Bug 1: 2D Footprint Misalignment (FIXED)

### Symptom
Items placed in the editor appear at the correct position in 3D but their 2D floorplan footprint (the yellow/selected square in the 2D pane) is offset from the actual object position.

### Root Cause
**File:** `packages/nodes/src/item/floorplan.ts:156 — buildItemFloorplan`

The 3D renderer correctly applies `node.asset.offset` as a positional shift on the GLB model:
```tsx
// renderer.tsx:691
<Clone position={node.asset.offset} ...>
```

But `buildItemFloorplan` computed the 2D footprint center as:
```ts
const centerLocalZ = node.asset.attachTo === 'wall-side' ? depth / 2 : 0
const [centerOffsetX, centerOffsetY] = rotateVec(0, centerLocalZ, transform.rotation)
const cx = transform.x + centerOffsetX  // ← asset.offset[0] missing
const cy = transform.y + centerOffsetY  // ← asset.offset[2] missing
```

`asset.offset[0]` (local X) and `asset.offset[2]` (local Z) were never rotated into world space and applied, so the 2D footprint center was wrong for any asset with a non-zero offset.

### Fix Applied
```ts
const assetOffset = node.asset.offset ?? [0, 0, 0]
const [centerOffsetX, centerOffsetY] = rotateVec(
  assetOffset[0],                    // local X offset
  centerLocalZ + assetOffset[2],     // local Z: wall-side half-depth + asset Z offset
  transform.rotation,
)
const cx = transform.x + centerOffsetX
const cy = transform.y + centerOffsetY
```

---

## Bug 2: Windows/Doors Tabs — 0 Items (FIXED)

### Symptom
The Windows and Doors category tabs showed 0 items. Users could click the tab but see nothing.

### Root Cause
Windows and doors are **parametric structural wall-placement nodes** (`WindowNode`, `DoorNode`), not GLB catalog items. They have their own dedicated placement tools (`'window'`, `'door'`). The `window` and `door` `CatalogCategory` values existed in the type system but no GLB items in `CATALOG_ITEMS` use these categories.

### Fix Applied
Instead of GLB catalog items, the Windows and Doors tabs now show **type picker tiles** — one tile per window/door type (10 window types, 10 door types). Clicking a tile arms the structural placement tool (`setTool('window')` / `setTool('door')`), then the user clicks a wall to place. Type can be adjusted in the properties panel after placement.

**Window types:** fixed, sliding, casement, awning, hopper, single-hung, double-hung, bay, bow, louvered  
**Door types:** hinged, double, french, folding, pocket, barn, sliding, garage-sectional, garage-rollup, garage-tiltup

Each tile has a simple SVG illustration and a one-line description.

**Files changed:**
- `packages/editor/src/components/ui/sidebar/panels/items-panel/index.tsx`
  - `selectCategory()` now calls `setTool('window')` / `setTool('door')` instead of `setTool('item')` for structural categories
  - Grid area conditionally renders `StructuralTypePicker` for window/door categories
  - New components: `WindowSVG`, `DoorSVG`, `StructuralTypePicker`

---

## Bug 3: AI-Generated Items Not Appearing in Catalog (FIXED)

### Symptom
Models generated via Tripo3D (`/api/tripo/generate`) were saved to `globalModels` DB table but never appeared in the editor's Items panel. Users had to regenerate models repeatedly.

### Root Cause (Multi-layered)

**Layer 1 — Wrong source value**  
`apps/editor/app/api/tripo/generate/route.ts` saved `source: 'tripo3d'` but `AssetInput` only accepts `'library' | 'community' | 'mine'`. The source filter in `ItemsPanel` would never match `'tripo3d'`.

**Layer 2 — ItemsPanel never fetches from DB**  
`EditorItemsPanel` in both `apps/editor/app/page.tsx` and `apps/editor/components/scene-loader.tsx` passed no `items` prop to `ItemsPanel`, so it always fell back to the hardcoded `CATALOG_ITEMS` static array. Even though `/api/catalog` route exists and correctly queries `globalModels`, nothing called it.

**Layer 3 — Null category excluded items**  
Tripo generate saves `category: null`. `LegacyItemsPanel` filters: `item.category === activeCategory.catalogCategory` — null never matches any category, so even if items were fetched, they'd never display.

### Fixes Applied

**`apps/editor/app/api/tripo/generate/route.ts`**
- Changed `source: 'tripo3d'` → `source: 'mine'`

**`apps/editor/app/page.tsx` + `apps/editor/components/scene-loader.tsx`**
Both `EditorItemsPanel` components updated to:
1. `useEffect` on mount: fetch `/api/catalog?limit=48`
2. Map DB rows to `AssetInput[]` (source mapping: `mine/tripo3d` → `'mine'`, `polyhaven/polypizza` → `'community'`, else `'library'`)
3. `category: null` items default to `'furniture'`
4. Pass `items={[...CATALOG_ITEMS, ...dbItems]}` — DB items merged with built-in catalog
5. `showSourceFilter={dbItems.length > 0}` — source chips appear only when there are DB items

**`packages/editor/src/components/ui/sidebar/panels/items-panel/index.tsx`**
- `categoryItems` filter extended: when `activeSource === 'mine'`, items with no/null category also shown in active tab — catches any legacy `category: null` rows

### How AI Items Now Appear
1. User generates model via Tripo3D
2. Route saves to `globalModels` with `source: 'mine'`
3. When user opens Items panel: panel fetches `/api/catalog?limit=48`
4. AI items appear in their category tab (defaulting to Furniture if no category)
5. User can switch source chip to "Mine" to see only their generated models

---

## Files Changed Summary

| File | Change |
|------|--------|
| `packages/nodes/src/item/floorplan.ts` | Apply `asset.offset` to 2D footprint center (Bug 1 fix) |
| `packages/editor/src/components/ui/sidebar/panels/items-panel/index.tsx` | Window/Door type pickers + structural tool arming (Bug 2 fix) |
| `packages/editor/src/store/use-editor.tsx` | Added `lighting`, `decor` to `CatalogCategory` (prior session) |
| `packages/editor/src/components/ui/action-menu/furnish-tools.tsx` | Expanded to 9 categories (prior session) |
| `apps/editor/app/api/tripo/generate/route.ts` | `source: 'tripo3d'` → `source: 'mine'` (Bug 3 fix) |
| `apps/editor/app/page.tsx` | Fetch `/api/catalog` on mount, merge with `CATALOG_ITEMS`, pass to `ItemsPanel` (Bug 3 fix) |
| `apps/editor/components/scene-loader.tsx` | Same catalog fetch + merge as page.tsx (Bug 3 fix) |
