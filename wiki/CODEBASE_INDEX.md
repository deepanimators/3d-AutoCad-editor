# Aruct Editor — Codebase Index

> Fast orientation for AI agents. For deep architecture rules, read `wiki/architecture/` pages. For skills/workflows, read `.agents/skills/`.

---

## 1. Monorepo Structure

```
AC-Editor/
├── apps/editor/          # Next.js 16 standalone editor app
├── packages/core/        # @aruct/core — scene graph, node schemas, stores, event bus
├── packages/viewer/      # @aruct/viewer — Three.js canvas, renderers, systems
├── packages/editor/      # @aruct/editor — editor UI components, tools, stores
├── packages/mcp/         # @aruct/mcp — MCP server and scene storage adapters
├── packages/nodes/       # @aruct/nodes — extended node catalog
├── packages/ifc-converter/ # @aruct/ifc-converter — IFC file parsing
├── packages/ui/          # @repo/ui — shared Radix/shadcn primitives
├── turbo.json            # Turbo pipeline config
└── package.json          # Root workspace (bun@1.3.0, turbo@2)
```

### Package ownership and hard import boundaries

| Package | Owns | Must NOT import |
|---|---|---|
| `@aruct/core` | Scene graph (`useScene`), node schemas (Zod), event bus, spatial grid, scene registry | Three.js, `@aruct/viewer`, `@aruct/editor`, `apps/editor`, any rendering/UI concept |
| `@aruct/viewer` | Three.js canvas (`<Viewer>`), node renderers, viewer systems, `useViewer` store | `useEditor`, editor tools, phases, paint mode, floorplan state, editor-only overlays |
| `@aruct/editor` | Editor layout (`<Editor>`, `<EditorLayoutV2>`), tools, `useEditor` store, floorplan canvas, panels | `apps/editor`-specific routes, DB, Firebase, billing |
| `@aruct/mcp` | MCP server, stdio/HTTP transports, scene storage adapters (SQLite + API bridge) | UI code; uses only `@aruct/core` types |
| `apps/editor` | Next.js pages, API routes, DB client, Firebase auth, billing (Stripe/Razorpay), Yjs collab | Nothing — consumer of all packages |

---

## 2. `apps/editor` Route Map

All files under `apps/editor/app/`. Entry point: `apps/editor/app/layout.tsx`.

### Public Routes

| Path | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing page (uses `<LandingClient>`) |
| `/pricing` | `app/pricing/page.tsx` | Pricing tiers |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `/login` | `app/login/page.tsx` | Firebase email/password + Google sign-in |
| `/signup` | `app/signup/page.tsx` | Registration |
| `/verify-email` | `app/verify-email/page.tsx` | Email verification gate |
| `/billing/success` | `app/billing/success/page.tsx` | Post-checkout confirmation |
| `/viewer` | `app/viewer/page.tsx` | Public read-only 3D viewer |
| `/ifc-converter` | `app/ifc-converter/page.tsx` | Public IFC→GLB converter tool |
| `/dcc-bridge` | `app/dcc-bridge/page.tsx` | Blender/DCC plugin download page |

### Protected Routes (require `__session` cookie)

| Path | File | Purpose |
|---|---|---|
| `/editor` | `app/editor/page.tsx` | Local (unsaved) editor — full `<Editor>` with all panels |
| `/scene/[id]` | `app/scene/[id]/page.tsx` | Cloud scene editor — loads graph from DB, autosaves |
| `/scenes` | `app/scenes/page.tsx` | Scene library — list, create, open scenes |
| `/account` | `app/account/page.tsx` | User profile, plan, billing portal |
| `/catalog` | `app/catalog/page.tsx` | Global model catalog browser |
| `/items` | `app/items/page.tsx` | User's uploaded custom items |
| `/apps` | `app/apps/page.tsx` | Installed apps/integrations |
| `/plugins` | `app/plugins/page.tsx` | Enabled plugin list |
| `/plugins/marketplace` | `app/plugins/marketplace/page.tsx` | Plugin marketplace discovery |
| `/plugins/submit` | `app/plugins/submit/page.tsx` | Plugin submission form |
| `/org` | `app/org/page.tsx` | Organization list |
| `/org/[slug]` | `app/org/[slug]/page.tsx` | Team workspace dashboard |
| `/org/[slug]/invite/accept` | `app/org/[slug]/invite/accept/page.tsx` | Org invitation acceptance |

### Admin Routes (require `role === 'admin'`)

| Path | File | Purpose |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Admin dashboard overview |
| `/admin/users` | (API-driven via admin layout) | User management |
| `/admin/scenes` | `app/admin/scenes/page.tsx` | All scenes across users |
| `/admin/catalog` | `app/admin/catalog/page.tsx` | Global catalog management + Polyhaven ingest |
| `/admin/plugins` | `app/admin/plugins/page.tsx` | Plugin approval queue (`marketplace-admin-section.tsx`) |
| `/admin/plans` | `app/admin/plans/page.tsx` | Plan config editor |
| `/admin/coupons` | `app/admin/coupons/page.tsx` | Coupon/promo code management |
| `/admin/roles` | `app/admin/roles/page.tsx` | Custom role management |
| `/admin/storage` | `app/admin/storage/page.tsx` | S3/storage admin |
| `/admin/audit` | `app/admin/audit/page.tsx` | Audit log viewer |

### API Routes

| Path | Method(s) | Purpose |
|---|---|---|
| `/api/auth/session` | POST/DELETE | Create/destroy Firebase session cookie |
| `/api/me` | GET | Current user profile |
| `/api/account/profile` | PATCH | Update name/image |
| `/api/scenes` | GET, POST | List/create scenes |
| `/api/scenes/[id]` | GET, PUT, DELETE | Load/save/delete scene |
| `/api/scenes/[id]/collaborators` | GET, POST | Scene collaborators |
| `/api/scenes/[id]/comments` | GET, POST | Scene comments/pins |
| `/api/scenes/[id]/comments/[commentId]` | PATCH, DELETE | Edit/delete comment |
| `/api/scenes/[id]/history` | GET | Version history events |
| `/api/scenes/[id]/history/[eventId]/restore` | POST | Restore to past version |
| `/api/scenes/[id]/events` | POST | Append scene event |
| `/api/scenes/[id]/share-link` | POST | Generate share token |
| `/api/scenes/[id]/thumbnail` | POST | Upload thumbnail |
| `/api/catalog` | GET | List global models |
| `/api/catalog/[id]` | GET, DELETE | Single catalog item |
| `/api/catalog/external` | GET | Search Polyhaven / PolyPizza |
| `/api/catalog/import` | POST | Import external model into catalog |
| `/api/items` | GET, POST | User custom items |
| `/api/items/[id]` | GET, DELETE | Single custom item |
| `/api/items/upload` | POST | Upload GLB to S3 |
| `/api/import/ifc` | POST | Parse IFC file → scene nodes |
| `/api/import/dwg` | POST | Parse DWG file |
| `/api/import/dxf` | POST | Parse DXF → lineset nodes |
| `/api/import/pdf-underlay` | POST | Upload PDF underlay |
| `/api/import/point-cloud` | POST | Import point cloud |
| `/api/export/glb` | POST | Export scene as GLB |
| `/api/export/ifc` | POST | Export scene as IFC |
| `/api/export/dxf` | POST | Export scene as DXF |
| `/api/export/bom` | GET | Bill of materials |
| `/api/export/measurements` | GET | Measurement report |
| `/api/export/schedules` | GET | Room/zone schedules |
| `/api/billing/checkout` | POST | Stripe checkout session |
| `/api/billing/portal` | POST | Stripe customer portal |
| `/api/billing/webhook` | POST | Stripe webhook handler |
| `/api/billing/razorpay/create-subscription` | POST | Razorpay subscription |
| `/api/billing/razorpay/verify` | POST | Verify Razorpay payment |
| `/api/billing/razorpay/portal` | POST | Razorpay portal |
| `/api/billing/razorpay/cancel` | POST | Cancel Razorpay sub |
| `/api/billing/razorpay/webhook` | POST | Razorpay webhook |
| `/api/orgs` | GET, POST | List/create organizations |
| `/api/orgs/[slug]` | GET, PATCH, DELETE | Org CRUD |
| `/api/orgs/[slug]/members` | GET, POST | Org members |
| `/api/orgs/[slug]/members/[userId]` | PATCH, DELETE | Update/remove member |
| `/api/orgs/[slug]/scenes` | GET | Scenes owned by org |
| `/api/orgs/invite/accept` | POST | Accept invite token |
| `/api/plugins/marketplace` | GET, POST | List / submit plugins |
| `/api/plugins/marketplace/[id]` | GET, PATCH | Plugin detail / admin update |
| `/api/plugins/marketplace/[id]/install` | POST | Record install |
| `/api/plugins/marketplace/[id]/rate` | POST | Submit rating |
| `/api/user/plugins` | GET, PATCH | User's enabled plugin list |
| `/api/collab/sync` | POST | Yjs scene sync |
| `/api/collab/presence` | POST | Collab presence |
| `/api/textures/upload` | POST | Upload texture to S3 |
| `/api/tripo/generate` | POST | AI 3D generation (Tripo3D) |
| `/api/mcp` | POST | MCP HTTP transport endpoint |
| `/api/mcp/track` | POST | MCP usage tracking |
| `/api/proxy/polyhaven` | GET | CORS proxy for Polyhaven API |
| `/api/pricing/active-promos` | GET | Active coupons for pricing page |
| `/api/admin/users` | GET | All users (admin) |
| `/api/admin/users/[id]` | PATCH | Update user plan/role (admin) |
| `/api/admin/impersonate` | POST | Impersonate user (admin) |
| `/api/admin/migrate` | — | DB migration trigger |
| `/api/admin/catalog/ingest-polyhaven` | POST | Bulk ingest Polyhaven assets |
| `/api/admin/coupons` | GET, POST | Coupon CRUD (admin) |
| `/api/admin/coupons/[id]` | PATCH, DELETE | Single coupon (admin) |
| `/api/admin/plan-config` | GET | All plan configs (admin) |
| `/api/admin/plan-config/[planKey]` | PATCH | Update plan display config |
| `/api/admin/roles` | GET, POST | Role CRUD (admin) |
| `/api/admin/roles/[id]` | PATCH, DELETE | Single role (admin) |
| `/api/health` | GET | Health check |

---

## 3. Key Components

### `apps/editor/components/`

| File | Renders / Does |
|---|---|
| `scene-loader.tsx` | Client component for `/scene/[id]` — bootstraps `<Editor>` with cloud graph, wires autosave, handles share-token visibility |
| `top-bar.tsx` | Generic app top bar with nav links and user menu (used in non-editor pages) |
| `editor-top-bar.tsx` | Editor-specific top bar: scene name, autosave indicator, IFC/DWG/PDF import buttons |
| `landing-client.tsx` | Full landing page client — hero, features, pricing CTAs, animations |
| `app-shell.tsx` | Authenticated page shell: sidebar nav + main content area |
| `admin-shell.tsx` | Admin page shell with admin-specific navigation |
| `app-sidebar.tsx` | Left sidebar navigation for authenticated app pages |
| `scene-card.tsx` | Card component for scene thumbnail + metadata in scene list |
| `save-button.tsx` | "Create new scene" button and save-to-cloud logic; exported as `<CreateSceneButton>` |
| `autosave-indicator.tsx` | Dot/spinner showing `idle | saving | saved | error` autosave state |
| `collab-panel.tsx` | Real-time collaborators panel using Yjs presence |
| `comments-panel.tsx` | Scene comment/pin thread UI; requires `sceneId` prop |
| `outliner-panel.tsx` | Node tree outliner for the scene graph |
| `outliner-sidebar.tsx` | Sidebar wrapper for outliner, used in non-editor contexts |
| `build-tab.tsx` | Build mode tab: wall/slab/roof/stair/etc. placement buttons |
| `bom-panel.tsx` | Bill of materials panel (plugin-gated: `aruct:plugin-bom`) |
| `sun-study-panel.tsx` | Solar/shadow analysis panel (plugin-gated) |
| `texture-manager-panel.tsx` | Texture upload and assignment panel (plugin-gated) |
| `sections-panel.tsx` | Section cut management (plugin-gated) |
| `mesh-editor-panel.tsx` | Mesh/shape editing panel (plugin-gated) |
| `terrain-panel.tsx` | Terrain height-map panel (plugin-gated) |
| `schedules-panel.tsx` | Room/zone schedule export panel (plugin-gated) |
| `render-panel.tsx` | Offline render configuration panel (plugin-gated) |
| `curtain-wall-panel.tsx` | Curtain wall system panel (plugin-gated) |
| `point-cloud-panel.tsx` | Point cloud import and display panel (plugin-gated) |
| `energy-panel.tsx` | Energy analysis panel (plugin-gated) |
| `version-history-panel.tsx` | Scene version history browser (plugin-gated) |
| `zone-rollup-panel.tsx` | Zone area/program rollup (plugin-gated) |
| `unified-plugins-panel.tsx` | Plugin enable/disable management UI |
| `presence-bar.tsx` | Collab presence avatars bar |
| `viewer-toolbar.tsx` | 3D viewer toolbar buttons (`CommunityViewerToolbarLeft/Right`) |
| `ifc-import-dialog.tsx` | Dialog for IFC import with file upload |
| `dwg-import-dialog.tsx` | Dialog for DWG/DXF import |
| `pdf-underlay-dialog.tsx` | Dialog for PDF underlay placement |
| `floorplan-construction-preflight.tsx` | Validation overlay before entering floorplan construction mode |
| `glb-export-gate.tsx` | Plan-gated GLB export dialog |
| `shortcut-help-overlay.tsx` | Keyboard shortcut reference overlay |
| `mobile-shell-client.tsx` | Mobile-optimised shell wrapper |
| `rail-account-nav.tsx` | Account/sign-in nav in the editor rail |
| `user-menu.tsx` | Dropdown user menu (avatar, plan badge, sign out) |
| `theme-toggle.tsx` | Light/dark mode toggle |
| `ai-generate-tile.tsx` | AI 3D generation tile in the Items panel (plugin-gated) |

### `packages/editor/src/components/editor/`

| File | Renders / Does |
|---|---|
| `editor-layout-v2.tsx` | Main editor layout — 2D/3D split pane, sidebar, toolbar orchestration |
| `floorplan-panel.tsx` | SVG canvas wrapper for 2D floorplan view |
| `selection-manager.tsx` | Bridges viewer selection events into `useEditor` selection state |
| `node-action-menu.tsx` | Floating context menu on selected node |
| `node-arrow-handles.tsx` | 3D arrow drag handles for selected nodes |
| `custom-camera-controls.tsx` | Orbit controls wrapper with editor-specific constraints |
| `first-person-controls.tsx` | First-person walkthrough mode controller |
| `export-manager.tsx` | Orchestrates GLB/IFC/DXF export API calls |
| `bake-exporter.tsx` | Offline render/bake pass orchestrator |
| `thumbnail-generator.tsx` | Captures and uploads scene thumbnail |
| `snapshot-capture-overlay.tsx` | UI for snapshot/render capture region selection |

---

## 4. Database

### Client

- **File:** `apps/editor/lib/db/client.ts`
- **Driver:** `@neondatabase/serverless` + `drizzle-orm/neon-http`
- **Export:** `db` — Drizzle instance with full schema
- **Connection:** `process.env.DATABASE_URL`

### Migrations

- **Script:** `apps/editor/scripts/run-migration.mjs`
- **Trigger:** `prebuild` hook in `apps/editor/package.json` — runs automatically before every `next build`
- **Run manually:** `bun run db:migrate` (from `apps/editor/`)
- **Generate new migration SQL:** `bun run db:generate` → produces SQL in `apps/editor/lib/db/migrations/`

### Schema — `apps/editor/lib/db/schema.ts`

| Table | Key columns | Purpose |
|---|---|---|
| `users` | `id` (Firebase UID), `email`, `plan` (free/pro/team), `role`, `stripeCustomerId`, `razorpayCustomerId`, `subscriptionStatus` | User accounts and billing state |
| `scenes` | `id`, `ownerId`, `orgId`, `graphJson` (full scene JSON), `version`, `sizeBytes`, `nodeCount`, `isPublic` | Stored scenes |
| `sceneCollaborators` | `sceneId`, `userId`, `role` (editor/viewer) | Per-scene access sharing |
| `sceneEvents` | `sceneId`, `version`, `kind`, `graphJson` | Append-only event log for version history |
| `sceneComments` | `sceneId`, `userId`, `nodeId`, `positionX/Y`, `text`, `resolved`, `parentId` | Scene review comment pins |
| `organizations` | `id`, `slug`, `name`, `ownerId` | Team workspaces |
| `orgMembers` | `orgId`, `userId`, `role` (owner/admin/member) | Team membership |
| `orgInvitations` | `orgId`, `email`, `token`, `status` | Pending org invitations |
| `coupons` | `code`, `gateway`, `discountType`, `discountValue`, `appliesToPlans` | Promo codes (Stripe + Razorpay) |
| `planConfig` | `planKey`, `displayPriceCents`, `stripePriceId`, `razorpayPlanId`, `features` | Admin-editable plan display config |
| `roles` | `name`, `permissions` (JSON array), `isSystem` | Custom admin roles |
| `customItems` | `orgId`, `glbUrl`, `category` | User/org uploaded GLB assets |
| `globalModels` | `slug`, `source`, `s3Key`, `license` | Curated catalog (Polyhaven, PolyPizza, community) |
| `auditLog` | `orgId`, `userId`, `action`, `resourceType`, `resourceId` | Admin audit trail |
| `pluginRegistry` | `slug`, `manifestUrl`, `status` (pending/approved/rejected), `minPlan` | Plugin marketplace |
| `pluginRatings` | `pluginId`, `userId`, `rating`, `review` | Plugin ratings (unique per user) |

---

## 5. Auth

### Firebase Auth

- **Client init:** `apps/editor/lib/firebase/client.ts` — exports `firebaseAuth`
- **Admin SDK:** `apps/editor/lib/firebase/admin.ts` — exports `getAdminAuth()` (lazy init, Node.js only)
- **Env vars:** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### Session Cookie

- **Cookie name:** `__session`
- **Set:** `POST /api/auth/session` — client sends Firebase ID token; server calls `admin.createSessionCookie()` and sets `__session` as HttpOnly
- **Verified:** `apps/editor/lib/auth-server.ts` — `getSession()` calls `verifySessionCookie()` then DB-loads user row; `requireSession()` throws 401 on failure
- **Client helper:** `apps/editor/lib/auth-client.ts` — `signOut()`, `signInWithGoogle()`, etc.
- **Hook:** `apps/editor/lib/use-auth.tsx` — `useAuth()` React hook for client-side auth state

### Middleware — `apps/editor/middleware.ts`

- Runs on Edge (cannot use Firebase Admin)
- Protects: `/scenes`, `/scene/*`, `/account/*`, `/admin/*`
- Auth routes (`/login`, `/signup`): redirects authed users to `/scenes`
- Cookie check only — cryptographic verification happens in server components and API routes via `auth-server.ts`

---

## 6. State Management

All stores use **Zustand v5**.

### `useScene` — `packages/core/src/registry/scene-api.ts` (exported from `@aruct/core`)

- **Holds:** `nodes` map, `rootNodeIds`, `collections`, `materials`, `installedPlugins`, undo/redo history
- **Key actions:** `createNode`, `updateNode`, `deleteNode`, `pauseSceneHistory`, `restoreSceneHistory`
- **Used by:** everything — the canonical scene graph

### `useViewer` — `packages/viewer/src/store/use-viewer.ts` (exported from `@aruct/viewer`)

- **Holds:** `selection` (buildingId, levelId, zoneId, selectedIds), `hoveredId`, `cameraMode`, `renderShading`, `sceneTheme`, `renderContext`, `sectionViewPlaneId`, `exportScene` callback
- **Persisted:** yes (theme, shading, camera prefs)
- **Used by:** viewer systems, renderers, editor selection manager

### `useEditor` — `packages/editor/src/store/use-editor.tsx` (exported from `@aruct/editor`)

- **Holds:** `viewMode` (2d/3d/split), `phase` (site/structure/furnish), `mode` (select/edit/delete/build/material-paint), `activeTool`, `activeSidebarPanel`, `snappingMode`, `continuationMode`, active moving/painting node state, capture mode
- **Persisted:** yes (viewMode, snappingMode, sidebar panel)
- **Used by:** all editor UI, tools, panels

### Notable Editor Sub-stores (all in `packages/editor/src/store/`)

| Store | File | Purpose |
|---|---|---|
| `useInteractionScope` | `use-interaction-scope.ts` | Active interaction state machine (the "spine") |
| `useFloorplanDraftPreview` | `use-floorplan-draft-preview.ts` | Wall/slab draft preview during placement |
| `usePlacementPreview` | `use-placement-preview.ts` | 3D placement ghost |
| `useMeasurementDraft` | `use-measurement-draft.ts` | Measurement line being drawn |
| `useFloorplanMarquee` | `use-floorplan-marquee.ts` | 2D marquee selection rect |
| `useAlignmentGuides` | `use-alignment-guides.ts` | Snap alignment guide lines |
| `useCommandRegistry` | `use-command-registry.ts` | Command palette entries |
| `useDrawingView` | `use-drawing-view.ts` | 2D floorplan viewport (pan/zoom) |

### Collaboration — `apps/editor/lib/collaboration/`

- `collab-store.ts` — Zustand store for collab session state
- `yjs-scene-bridge.ts` — Syncs `useScene` to/from a shared Yjs doc
- `use-collab-session.ts` — Hook to join/leave a collab session

---

## 7. Core Packages

### `@aruct/core` — `packages/core/src/`

**Node types** (`packages/core/src/schema/nodes/` — one file each):

`box-vent`, `building`, `cabinet`, `ceiling`, `chimney`, `column`, `construction-dimension`, `cupola`, `curtain-wall`, `door`, `dormer`, `downspout`, `drawing-sheet`, `duct-fitting`, `duct-segment`, `duct-terminal`, `elevator`, `eyebrow-vent`, `fence`, `guide`, `gutter`, `hvac-equipment`, `item`, `level`, `lineset`, `liquid-line`, `measurement`, `mesh`, `pdf-underlay`, `pipe-fitting`, `pipe-segment`, `pipe-trap`, `point-cloud`, `railing`, `ridge-vent`, `roof`, `roof-segment`, `roof-segment-shape`, `roof-segment-walls`, `scan`, `section`, `shelf`, `site`, `skylight`, `slab`, `solar-panel`, `spawn`, `stair`, `stair-segment`, `structural-grid`, `surface-hole-metadata`, `terrain`, `turbine-vent`, `wall`, `window`, `zone`

**Key modules:**

| Module | File | Purpose |
|---|---|---|
| Scene graph store | `registry/scene-api.ts` | `useScene` Zustand store — the authoritative node map |
| Node registry | `registry/registry.ts` | `nodeRegistry` singleton — maps kind→definition |
| Relations resolver | `registry/relations-resolver.ts` | Computes parent/child/contained-by relations |
| Event bus | `events/bus.ts` | `emitter` typed event bus — node CRUD and grid events |
| Scene registry | `hooks/scene-registry/scene-registry.ts` | `sceneRegistry` + `useRegistry` — nodeId→Object3D map |
| Spatial grid | `hooks/spatial-grid/spatial-grid.ts` | Floor/wall/ceiling placement support grid |
| Space detection | `lib/space-detection.ts` | Detects enclosed zones from wall topology |
| Material library | `material-library.ts` | Material presets and surface roles |

### `@aruct/viewer` — `packages/viewer/src/`

**Main component:** `packages/viewer/src/components/viewer/index.tsx` — `<Viewer>` — R3F canvas with all systems mounted

**Systems** (`packages/viewer/src/systems/` — one dir each, typically a `*-system.tsx` file):

`ceiling`, `column`, `curtain-wall`, `door` (+ animation), `elevator`, `fence`, `floor-elevation`, `geometry`, `guide`, `interactive` (control widget), `item`, `item-light`, `level`, `mep/duct`, `mep/pipe`, `railing`, `roof`, `scan`, `section`, `slab`, `stair`, `terrain`, `wall` (+ cutout), `window` (+ animation), `zone`

**Renderers** (`packages/viewer/src/components/renderers/`):

- `scene-renderer.tsx` — top-level scene render, delegates per node type
- `node-renderer.tsx` — renders a single node by dispatching to its registered renderer
- `parametric-node-renderer.tsx` — for registry-driven parametric node kinds

**Key stores/hooks:**

| File | Purpose |
|---|---|
| `store/use-viewer.ts` | `useViewer` — selection, camera, shading, theme |
| `store/use-item-light-pool.ts` | Light pooling for item GLBs |
| `hooks/use-asset-url.ts` | Resolves asset URLs with CDN prefix |
| `lib/materials.ts` | Material presets, `RenderShading`, `ColorPreset` types |
| `lib/scene-themes.ts` | Theme IDs and colour mappings |

### `@aruct/editor` — `packages/editor/src/`

**Main component:** `packages/editor/src/components/editor/index.tsx` — `<Editor>` — composes `<Viewer>` + floorplan canvas + sidebar + toolbar

**Tools** (`packages/editor/src/components/tools/`):

| Tool file | Purpose |
|---|---|
| `tool-manager.tsx` | Mounts the active tool component based on `useEditor.activeTool` |
| `tools/elevator/elevator-tool.tsx` | Elevator placement |
| `tools/item/move-tool.tsx` | Item move in 3D |
| `tools/registry/move-registry-node-tool.tsx` | Move any registry-driven node |
| `tools/roof/roof-tool.tsx` | Roof segment drawing |
| `tools/select/box-select-tool.tsx` | 3D box select |
| `tools/select/plane-box-select-tool.tsx` | 2D plane box select |
| `tools/stair/stair-tool.tsx` | Stair segment drawing |
| `tools/zone/zone-tool.tsx` | Zone polygon drawing |
| `lib/floorplan/selection-tool.ts` | 2D floorplan click/marquee selection |

**Floorplan 2D layers** (`packages/editor/src/components/editor-2d/`):

Each layer is an SVG overlay on the floorplan canvas: geometry renderer, dimension renderer, draft layer, marquee, measurements, placement preview, snap beacons, wall move ghosts, PDF underlay, etc.

---

## 8. External Services

| Service | SDK/Client | Where configured | Purpose |
|---|---|---|---|
| **Neon Postgres** | `@neondatabase/serverless` + `drizzle-orm` | `apps/editor/lib/db/client.ts` | Primary database (scenes, users, billing) |
| **Firebase Auth** | `firebase` (client), `firebase-admin` (server) | `apps/editor/lib/firebase/client.ts`, `apps/editor/lib/firebase/admin.ts` | User authentication |
| **Stripe** | `stripe` | `apps/editor/lib/stripe.ts` | Payments (US/global) |
| **Razorpay** | `razorpay` | `apps/editor/lib/razorpay.ts` | Payments (India) |
| **AWS S3** | `@aws-sdk/client-s3` | `apps/editor/lib/storage.ts` | File storage (GLB, textures, thumbnails) |
| **Yjs** | `yjs` | `apps/editor/lib/collaboration/yjs-scene-bridge.ts` | Real-time collaborative editing |
| **Tripo3D** | REST client | `apps/editor/lib/tripo-client.ts` | AI 3D model generation |
| **Polyhaven** | HTTP proxy | `app/api/proxy/polyhaven/route.ts`, `lib/free-sources/poly-haven.ts` | Free 3D asset search |
| **PolyPizza** | HTTP | `lib/free-sources/poly-pizza.ts` | Free 3D asset search |
| **pdfjs-dist** | `pdfjs-dist` | `lib/render/offline-render.ts` + import dialog | PDF underlay rendering |
| **web-ifc** | `web-ifc` | `packages/ifc-converter/` | IFC file parsing |
| **MCP server** | `@aruct/mcp` | `app/api/mcp/route.ts` | AI agent scene manipulation via HTTP transport |

### Required environment variables

```
DATABASE_URL                         # Neon Postgres connection string
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RAZORPAY_KEY_ID                      # Optional — Razorpay only
RAZORPAY_KEY_SECRET                  # Optional
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

---

## 9. Build / Deploy

### Local development

```bash
bun dev          # Runs turbo dev — builds packages, starts apps/editor on :3002
bun kill         # Kills port 3002
bun restart      # kill + clean cache + dev
```

### Build pipeline (Turbo)

1. `packages/core` → `packages/viewer` → `packages/editor` → `packages/mcp` (each `tsc` build)
2. `apps/editor` prebuild hook: `node scripts/run-migration.mjs` (applies DB migrations)
3. `apps/editor` build: `next build`

Task config: `turbo.json` — `build` depends on `^build` (upstream packages first).

### Vercel deployment — `apps/editor/vercel.json`

```json
{
  "buildCommand": "cd ../.. && npx -y bun@1.3.13 run build --filter=editor",
  "installCommand": "cd ../.. && npx -y bun@1.3.13 install --frozen-lockfile",
  "outputDirectory": ".next"
}
```

Project: `aruct-editor` (`prj_EYrbOg5ChtlACzRQ2i9mkWIAYCyU`)

### DB migration

- Runs automatically on every deploy via `prebuild`
- Uses raw SQL `CREATE TABLE IF NOT EXISTS` — idempotent
- To add a table: append SQL to `apps/editor/scripts/run-migration.mjs` AND add Drizzle schema to `apps/editor/lib/db/schema.ts`
- Drizzle migration files in `apps/editor/lib/db/migrations/` are for reference/documentation only; the migration script is the source of truth

---

## 10. Common Patterns

### Adding a new page

1. Create `apps/editor/app/<route>/page.tsx` (server component) + `<route>/<name>-client.tsx` (client component)
2. If protected: the existing middleware auto-protects `/scenes`, `/scene`, `/account`, `/admin` prefixes. For other routes, add the prefix to `PROTECTED` in `apps/editor/middleware.ts`
3. Wrap in `<AppShell>` (authenticated pages) or `<AdminShell>` (admin pages)
4. Add nav link to `apps/editor/components/app-sidebar.tsx` if it should appear in sidebar

### Adding a new API route

1. Create `apps/editor/app/api/<path>/route.ts`
2. Call `getSession()` (returns `null` if unauthed) or `requireSession()` (throws) from `apps/editor/lib/auth-server.ts`
3. Use `db` from `apps/editor/lib/db/client.ts` with schema from `apps/editor/lib/db/schema.ts`
4. For admin routes: check `user.role === 'admin'`

### Adding a new node type

1. Create schema file: `packages/core/src/schema/nodes/<kind>.ts` — define Zod schema extending `baseNodeSchema`
2. Export from `packages/core/src/schema/nodes/index.ts` and `packages/core/src/schema/index.ts`
3. Add renderer in `packages/viewer/src/systems/<kind>/<kind>-system.tsx` (for parametric geometry) or a dedicated renderer
4. Register in `packages/viewer/src/components/viewer/registered-systems.tsx`
5. Optionally add a 2D floorplan renderer layer in `packages/editor/src/components/editor-2d/`
6. Add the event type to `packages/core/src/events/bus.ts`
7. Read `wiki/architecture/node-schemas.md` + `wiki/architecture/renderers.md` + `wiki/architecture/systems.md` before writing code

### Adding a new editor tool

1. Create component in `packages/editor/src/components/tools/<name>/<name>-tool.tsx`
2. Use `useInteractionScope` from `packages/editor/src/store/use-interaction-scope.ts` for interaction state management
3. Register the tool in `packages/editor/src/components/tools/tool-manager.tsx`
4. Add tool button to the appropriate toolbar or sidebar tab
5. If the tool has 2D and 3D variants: both must be implemented (2D in `editor-2d/`, 3D in `editor/`) — behavioral parity is required
6. Read `wiki/architecture/tools.md` + `wiki/architecture/interaction-scope.md` before writing code

### Adding a new DB table

1. Add Drizzle schema to `apps/editor/lib/db/schema.ts`
2. Append `CREATE TABLE IF NOT EXISTS` SQL to `apps/editor/scripts/run-migration.mjs`
3. Run `bun run db:migrate` from `apps/editor/` to apply locally
4. The next deploy will auto-apply via prebuild

---

*Index generated: 2026-10-23*
