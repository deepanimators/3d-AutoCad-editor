# Plugins System Investigation & Implementation — 2026-07-27

## Existing Plugin Architecture

`@aruct/core` already has a complete plugin registry system:

### Core Types (`packages/core/src/registry/types.ts`)
```ts
type Plugin = {
  id: string
  apiVersion: 1
  nodes?: AnyNodeDefinition[]
}
```
Plugins contribute **node type definitions** — new 3D object kinds that can be placed in scenes.

### Registry API (`packages/core/src/registry/registry.ts`)
- `loadPlugin(plugin)` — registers plugin nodes
- `setPluginDiscovery(fn)` / `extendPluginDiscovery(fn)` — hook for app-level plugin loading
- `discoverPlugins()` — called at bootstrap to load all discovered plugins
- `isNodeKindEnabled(kind, installedPlugins)` — checks if a node kind is active

### Scene-Level Plugin State
Each scene carries `installedPlugins: string[]` — a list of plugin IDs that are active for that scene. Nodes from disabled plugins are skipped during rendering and interaction.

### Example Plugin
The codebase references `aruct:plugin-trees` as a standalone example in `.planning/editor-plugin-trees-example.md`.

---

## What Was Built

### Plugin Catalog (`apps/editor/lib/plugins/catalog.ts`)
Static definition of 8 plugins:

| Plugin ID | Name | Plan | Status |
|-----------|------|------|--------|
| `aruct:core` | Core Building Elements | Free | Stable |
| `aruct:plugin-polyhaven` | Poly Haven Models | Free | Stable |
| `aruct:plugin-polypizza` | Poly Pizza Models | Free | Stable |
| `aruct:plugin-ai-gen` | AI Model Generator | Pro | Beta |
| `aruct:plugin-sun-study` | Sun & Shadow Study | Pro | Coming soon |
| `aruct:plugin-bom` | Bill of Materials | Pro | Coming soon |
| `aruct:plugin-ifc` | IFC / BIM Export | Team | Coming soon |
| `aruct:plugin-collab` | Real-Time Collaboration | Team | Coming soon |

### User Plugin Preferences (DB)
- Added `plugin_prefs` text column to `users` table (stores JSON array of enabled plugin IDs)
- Migration: `apps/editor/lib/db/migrations/0003_user_plugin_prefs.sql`

### API (`apps/editor/app/api/user/plugins/route.ts`)
- `GET /api/user/plugins` — returns user's enabled plugin IDs
- `PUT /api/user/plugins` — toggle a plugin on/off (validates plan requirement)

### User-Facing Plugins Page (`/plugins`)
- Browse all available plugins grouped by category
- Toggle switch for each plugin
- Expand for detailed description and feature list
- Locked state with "Upgrade" link for plan-gated plugins
- "Coming soon" badge for unimplemented plugins
- Accessible from user menu → "Plugins"

### Admin Plugins Page (`/admin/plugins`)
- Table view of all registered plugins
- Shows ID, plan requirement, status, built-in flag
- Linked from admin sidebar

---

## Plugins Functional Today

| Plugin | Status | What works |
|--------|--------|-----------|
| Poly Haven | ✅ | External catalog search, proxy loading with GLB preference |
| Poly Pizza | ✅ (with API key) | External catalog search |
| AI Generator | ✅ (with Tripo3D key) | Model generation via `/api/generate/tripo3d` |

---

## Plugins Not Yet Implemented

These exist in the catalog as "coming soon":
- **Sun Study** — requires solar path calculation + scene overlay rendering
- **BOM Export** — requires scene node counting/area calculation + PDF generation
- **IFC Export** — requires IFC format mapping library
- **Real-time Collaboration** — requires WebSocket server + OT conflict resolution

---

## How to Add a Real Plugin

1. Create a `Plugin` object with node definitions in a package (e.g., `packages/plugin-trees`)
2. Register it via `extendPluginDiscovery` in the app bootstrap
3. Add an entry to `PLUGIN_CATALOG` in `lib/plugins/catalog.ts`
4. Run migration to ensure `plugin_prefs` column exists
