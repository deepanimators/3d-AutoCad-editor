# Plugin Architecture — Adding Pro/Team-Only Features

Every new feature ships as a plugin entry. Plan gating (client + server) is automatic.

---

## How the Plugin System Works

### Two Plugin Layers

**1. Catalog plugins** — account-level, stored in `users.pluginPrefs` (DB).
These control sidebar panel visibility, API access, and feature toggles across all scenes.
Examples: BOM, Sun Study, IFC Export, Collab, Mesh Editor (new).

**2. Node-pack plugins** — scene-level, stored in `scene.installedPlugins[]`.
These register new node kinds (renderers, tools, floorplan builders).
Examples: Nature pack (trees/flowers/grass), future Terrain pack.

For most new features (mesh editor, texture manager, etc.), you want **catalog plugins**.

---

## The Gating Flow

```
User clicks "Enable Plugin"
        ↓
[Client] PLAN_RANK[userPlan] >= PLAN_RANK[plugin.requiredPlan]?
  NO  → show "Upgrade" button linking to /pricing
  YES → PUT /api/user/plugins { id, enabled: true }
        ↓
[Server] planRank[plugin.requiredPlan] <= planRank[session.plan]?
  NO  → 403 { error: 'plan_upgrade_required', requiredPlan }
  YES → write to users.pluginPrefs in DB
        ↓
[Server response] { enabled: string[] }
        ↓
[Client] dispatch window event 'aruct:plugins-changed'
        ↓
[Home/SceneLoader] update enabledPlugins state → sidebar tab appears
```

Both client AND server enforce plan. Server is the security boundary.

---

## Adding a New Pro Plugin — Step by Step

### Step 1: Register in the catalog

**File:** `apps/editor/lib/plugins/catalog.ts`

```typescript
// Add to the PLUGIN_CATALOG array:
{
  id: 'aruct:plugin-mesh-editor',
  name: 'Mesh Editor',
  description: 'Edit vertices, faces, and edges of any 3D object.',
  longDescription: 'Blender-style mesh editing — vertex select, extrude, bevel, loop cut, boolean ops.',
  category: 'modeling',           // add 'modeling' to PluginCategory if needed
  requiredPlan: 'pro',            // 'free' | 'pro' | 'team'
  status: 'beta',                 // 'stable' | 'beta' | 'coming-soon'
  icon: '✏️',
  features: [
    'Vertex / edge / face selection',
    'Extrude (push/pull)',
    'Loop cut and bevel',
    'Boolean operations',
  ],
  builtIn: false,
}
```

That's ALL that's needed for gating. The rest is UI.

### Step 2: Add a sidebar panel (if the plugin needs a panel tab)

**Files:** `apps/editor/app/page.tsx` AND `apps/editor/components/scene-loader.tsx`
(both need the same change)

```typescript
// In the sidebarTabs array inside Home (page.tsx):
...(enabledPlugins.includes('aruct:plugin-mesh-editor')
  ? [{ id: 'mesh-editor', label: 'Mesh', icon: PenTool, component: MeshEditorPanel }]
  : []),
```

`enabledPlugins` state is kept in sync via the `aruct:plugins-changed` window event —
no additional wiring needed.

### Step 3: Create the panel component

Create `apps/editor/components/mesh-editor-panel.tsx` (or in `packages/editor/src/`).
The component can use any editor/viewer/scene state.

### Step 4 (optional): Gate API routes

If the plugin needs a backend API, validate plan at the route:

```typescript
// apps/editor/app/api/mesh/route.ts
import { getSession } from '@/lib/auth-server'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const planRank = { free: 0, pro: 1, team: 2 }
  if ((planRank[session.plan] ?? 0) < planRank['pro']) {
    return NextResponse.json({ error: 'plan_upgrade_required', requiredPlan: 'pro' }, { status: 403 })
  }

  // ... plugin logic
}
```

---

## Plugin Category Types (current + proposed)

```typescript
// apps/editor/lib/plugins/catalog.ts
export type PluginCategory =
  | 'core'
  | 'catalog'
  | 'ai'
  | 'analysis'
  | 'export'
  | 'collaboration'
  | 'modeling'       // NEW — mesh editor, terrain
  | 'materials'      // NEW — texture manager, PBR editor
  | 'documentation'  // NEW — sections, schedules
  | 'interop'        // NEW — DWG/DXF, point cloud
```

---

## Node-Pack Plugin Pattern (for new node types)

For features that introduce new node kinds (e.g., terrain, editable mesh, curtain wall):

```typescript
// packages/nodes/src/terrain/definition.ts
export const terrainDefinition: NodeDefinition<TerrainNode> = {
  kind: 'terrain',
  category: 'site',
  renderer: TerrainRenderer,
  tool: TerrainTool,
  floorplan: buildTerrainFloorplan,
  parametrics: terrainParametrics,
  // MCP description for AI agents:
  mcpDescription: 'A terrain mesh with elevation data and grading information.',
}
```

The node kind is then registered in `PLUGIN_CATALOG` as a scene-level plugin
and listed in the catalog's node-pack registry. Users install it per-scene.
Plan gating still applies at the catalog-plugin level.

---

## Proposed New Plugins (all Pro/Team)

| Plugin ID | Plan | Category | What it does |
|---|---|---|---|
| `aruct:plugin-mesh-editor` | Pro | modeling | Vertex/edge/face editing, extrude, bevel, loop cut, boolean |
| `aruct:plugin-texture-manager` | Pro | materials | Texture upload, PBR material editor, material library |
| `aruct:plugin-terrain` | Pro | modeling | Site topography, contours, cut/fill |
| `aruct:plugin-sections` | Pro | documentation | Section cuts, elevation views on sheets |
| `aruct:plugin-schedules` | Pro | documentation | Door/window/room/finish schedule engine |
| `aruct:plugin-glb-export` | Pro | export | GLB/glTF scene export |
| `aruct:plugin-dwg` | Team | interop | DWG/DXF import and export |
| `aruct:plugin-point-cloud` | Team | interop | .e57/.las point cloud rendering |
| `aruct:plugin-render` | Pro | rendering | Offline path-traced render output |
| `aruct:plugin-curtain-wall` | Pro | modeling | Mullion/panel/spandrel facade system |
| `aruct:plugin-energy` | Team | analysis | Daylighting + thermal envelope analysis |

---

## Free Features (no gating needed)

Some gaps should be free for all users:

- OBJ/FBX/glTF geometry import (widens catalog)
- Version history UI (trust/transparency)
- Keyboard shortcut customization
- Text/leader/tag annotations
- Basic room area readout from `zone` nodes
