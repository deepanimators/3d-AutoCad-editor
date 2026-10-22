# Plugin System — Features and Gaps

Source: `wiki/architecture/plugin-authoring.md`, `packages/core/src/store/use-scene-plugins.test.ts`, `apps/editor/lib/plugins/`

## What Exists

### Plugin API v1

Defined in `wiki/architecture/plugin-authoring.md`. Key contract:

```ts
interface Plugin {
  id: string            // unique reverse-domain ID: "com.example.plugin"
  name: string          // display name
  version: string       // semver
  nodes?: PluginNodeDef[]     // custom node type registrations
  panels?: PluginPanelDef[]   // custom sidebar panels
  tools?: PluginToolDef[]     // custom editor tools
}
```

### Discovery
- `setPluginDiscovery(url)` — point to a plugin manifest URL
- Plugins fetched from user-configured CDN or local server
- User plugin preferences stored in DB: `users.pluginPrefs` (JSON array of plugin IDs)
- Admin panel: `app/admin/plugins/` — review installed plugins
- User panel: `app/plugins/` — manage enabled plugins

### Plugin Lifecycle
1. Manifest fetched from discovery URL
2. Plugin JS bundle loaded into the editor via `<script>` or dynamic import
3. Plugin registers node types, panels, tools against Aruct's global registry
4. Plugin UI rendered in designated slots (sidebar panels, toolbar)

### Store Integration
- `use-scene-plugins.test.ts` — tests for plugin integration with scene store
- Plugin nodes serialized to scene graph like built-in nodes

### Catalog Plugin
- `apps/editor/lib/plugins/catalog.ts` — plugin catalog management
- Plugins can register items (GLB models) into the item catalog

### Free Asset Sources (Built-in Plugins)
- **Polyhaven** — `lib/free-sources/poly-haven.ts` — 3D textures (PBR sets)
- **Poly Pizza** — `lib/free-sources/poly-pizza.ts` — 3D models (CC0)
- `api/proxy/polyhaven` — proxy endpoint for Polyhaven CORS
- `api/catalog/external` — external catalog source endpoint
- `api/admin/catalog/ingest-polyhaven` — batch ingest Polyhaven assets into DB

### Item Upload
- `api/items/upload` — users upload custom GLB items (Pro gate: `canUploadCustomItems`)
- `api/items/` — CRUD for catalog items
- `apps/editor/app/items/` — items management UI
- `apps/editor/app/catalog/` — catalog browser UI

---

## Plugin Authoring Contract

### What v1 Plugins Can Do
- Register custom node types with Zod schema
- Register sidebar panels
- Register editor tools (2D + 3D)
- Add items to the catalog
- Read the scene graph (read-only API)
- Listen to scene events

### What v1 Plugins Cannot Do (by design)
- Write directly to the scene graph without going through official mutation API
- Intercept renders (no Three.js access)
- Add toolbar buttons outside designated slots
- Override built-in node behavior
- Access other users' data

---

## Gaps

### Plugin Development Experience (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Plugin SDK / type package (`@aruct/plugin-sdk`) | Developers need types without copying from source |
| Plugin scaffolding CLI (`npx create-aruct-plugin`) | One command to start a plugin |
| Local dev mode (plugin from `localhost:3001`) | Hot reload during plugin development |
| Plugin documentation site | No public docs for plugin authoring |
| Plugin examples / starter templates | Show: simple panel, custom node type, custom tool |

### Plugin Capabilities (MEDIUM PRIORITY)
| Gap | Notes |
|---|---|
| Plugins write to scene graph | Currently read-only via documented API |
| Custom node renderers (Three.js) | Plugins register their own 3D geometry |
| Custom 2D canvas overlays | Plugins draw on the 2D floorplan |
| Plugin-to-plugin messaging | Plugins share data via the event bus |
| Plugin settings UI | Plugins store their own config per user |
| Plugin i18n (translations) | Plugins ship their own string catalogs |

### Plugin Distribution (MEDIUM PRIORITY)
| Gap | Notes |
|---|---|
| Public plugin registry / marketplace | Users discover and install plugins |
| Plugin versioning + auto-update | Ensure plugins use compatible API version |
| Plugin review / verification | Security: prevent malicious plugins |
| Plugin analytics (install count, active users) | For plugin authors |

### Security (HIGH PRIORITY)
| Gap | Notes |
|---|---|
| Sandboxed plugin execution (iframe / worker) | Currently plugins run in main thread with full DOM access |
| Plugin permission declarations | Plugin must declare what APIs it needs; user approves |
| CSP policy for plugin scripts | Prevent XSS from third-party plugin bundles |
| Plugin signature verification | Prevent tampering |

### Catalog System (MEDIUM PRIORITY)
| Gap | Notes |
|---|---|
| Catalog item search (text, tag, category) | Browse-only today; no text search |
| Catalog item thumbnails | Auto-generate thumbnail from GLB |
| Catalog item tagging (by room, style, brand) | — |
| Catalog import from external URL (Sketchfab, Turbosquid) | — |
| Team catalog with shared custom items | Team tier exists; items scoping unclear |
| Catalog version / update notification | Plugin item updates notify users |

---

## Comparison Table

| Feature | CadCraft | Aruct |
|---|---|---|
| Plugin / extension API | ❌ (planned: Rust/WASM) | ✅ v1 (JS) |
| Plugin marketplace | ❌ | ❌ |
| Public plugin SDK | ❌ | ❌ |
| 3D item catalog | ❌ | ✅ (Polyhaven + Poly Pizza) |
| Custom item upload | ❌ | ✅ Pro |
| Script automation | ✅ (AutoLISP, JSON) | ❌ |

---

## Recommended Next Steps

1. **`@aruct/plugin-sdk` npm package** — TypeScript types for the plugin API
2. **Plugin documentation** — public docs: Plugin shape, lifecycle, available hooks
3. **Plugin examples repo** — starter templates for common patterns
4. **Sandboxed execution** — move plugin scripts to a `<iframe>` or SharedWorker with a message-passing API
5. **Plugin marketplace** — simple listing on the website; install with one click
6. **Custom node renderers** — allow plugins to register Three.js objects for custom node kinds
