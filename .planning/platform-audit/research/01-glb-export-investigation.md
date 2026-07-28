# GLB Export — Codebase Investigation

**Date:** 2026-07-28
**Status:** Complete — GLTFExporter already implemented; only catalog entry + sidebar tab missing

---

## Key Finding

GLB export code **already exists** in `packages/editor/src/lib/glb-export.ts`.
The plugin catalog entry and sidebar wiring are the only missing pieces.

---

## Files Found

### GLB Export Library
**`packages/editor/src/lib/glb-export.ts`**
- Imports `GLTFExporter` from `three/examples/jsm/exporters/GLTFExporter.js`
- Exports main export function + custom GLTFExporter plugins for texture reference handling
- Complete scene-to-GLB serialization with `MeshStandardMaterial` support

### Export UI
**`packages/editor/src/components/editor/export-manager.tsx`**
- UI logic for triggering exports
- Already has download-trigger pattern (createObjectURL → anchor click)

### Existing Export API Routes
**`apps/editor/app/api/export/bom/route.ts`** — Bill of Materials
**`apps/editor/app/api/export/ifc/route.ts`** — IFC/BIM

No GLB export API route yet (GLB export is client-side via GLTFExporter).

---

## Plugin Catalog

**`apps/editor/lib/plugins/catalog.ts`**

```typescript
// Types
export type PluginPlan = 'free' | 'pro' | 'team'
export type PluginStatus = 'stable' | 'beta' | 'coming_soon'
export type PluginCategory = 'core' | 'catalog' | 'ai' | 'export' | 'analysis' | 'collaboration'
// NOTE: 'modeling', 'materials', 'documentation' categories NOT YET in type

export type PluginEntry = {
  id: string
  name: string
  description: string
  longDescription: string
  category: PluginCategory
  requiredPlan: PluginPlan
  status: PluginStatus
  icon: string
  features: string[]
  builtIn: boolean
}

export const PLUGIN_CATALOG: PluginEntry[] = [ /* 8 entries */ ]
```

**Current catalog entries:**
1. `aruct:core` — free, core
2. Poly Haven Models — free, catalog
3. Poly Pizza Models — free, catalog
4. AI Model Generator — pro, ai
5. Sun & Shadow Study — pro, analysis
6. Bill of Materials — pro, export
7. IFC / BIM Export — team, export
8. Real-Time Collaboration — team, collaboration

**To add:** `aruct:plugin-glb-export` (Pro, export category)
Also need to extend `PluginCategory` with: `'modeling' | 'materials' | 'documentation' | 'interop' | 'rendering'`

---

## Sidebar Tab Pattern

**`apps/editor/app/page.tsx`** (line ~223)

```typescript
const sidebarTabs = [
  { id: 'site', label: 'Scene', component: () => null, mobileDefaultSnap: 0.5, mobileIcon: <Layers />, icon: <Layers /> },
  { id: 'build', label: 'Build', component: BuildTab, ... },
  { id: 'items', label: 'Items', component: EditorItemsPanel, ... },
  // Plugin-conditional tabs:
  ...(enabledPlugins.includes('aruct:plugin-bom') ? [{
    id: 'bom', label: 'BOM', component: BomPanel, mobileDefaultSnap: 0.5,
    mobileIcon: <BarChart2 className="h-5 w-5" />, icon: <BarChart2 className="h-5 w-5" />,
  }] : []),
  ...(enabledPlugins.includes('aruct:plugin-sun-study') ? [{ ... }] : []),
  ...(enabledPlugins.includes('aruct:plugin-collab') ? [{ ... }] : []),
  { id: 'settings', label: 'Settings', component: SettingsPanel, ... },
  { id: 'plugins', label: 'Plugins', component: UnifiedPluginsPanel, ... },
]
```

**`apps/editor/components/scene-loader.tsx`** (line ~226) — identical pattern, icons use `<Image>` instead of JSX icon components.

---

## Three.js Version

**`packages/viewer/package.json`**: `"three": "^0.185"` → installed `0.185.1`

GLTFExporter import path: `three/examples/jsm/exporters/GLTFExporter.js`

---

## What To Implement

1. **Extend `PluginCategory` type** in `catalog.ts` — add `'modeling' | 'materials' | 'documentation' | 'interop' | 'rendering'`
2. **Add catalog entry** for `aruct:plugin-glb-export` to `PLUGIN_CATALOG`
3. **Add sidebar tab** in `page.tsx` + `scene-loader.tsx` — conditional on `enabledPlugins.includes('aruct:plugin-glb-export')`
4. **Create GLB export panel** in `apps/editor/components/panels/glb-export-panel.tsx` — wraps existing `glb-export.ts` function
5. No new export API route needed — export is entirely client-side

---

## Effort Estimate

1 day — all heavy lifting already done in `packages/editor/src/lib/glb-export.ts`.
