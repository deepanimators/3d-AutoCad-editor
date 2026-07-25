# Phase 2: RBAC Enforcement

## Goal

Wire user identity into scenes and enforce resource-level permissions.

After this phase:
- Every scene has an `ownerId` tied to the authenticated user
- Users can only see and edit their own scenes
- Admins can access any scene
- Scene sharing gives viewer/editor access to specific users
- API routes enforce ownership before any write operation
- Feature gates enforce plan limits (scene count, export type)

---

## Scene Ownership — DB Changes

Add to `apps/editor/lib/db/schema.ts`:

```typescript
// Scene collaborator permissions (for Phase 3 sharing and Team plan)
export const sceneCollaborators = pgTable('scene_collaborators', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sceneId: text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: text('email'),                   // for inviting by email before signup
  role: text('role', { enum: ['editor', 'viewer'] }).notNull(),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at'),
}, (t) => ({
  // One entry per user per scene
  uniqueCollaborator: unique().on(t.sceneId, t.userId),
}))
```

Generate and run migration:
```bash
bun drizzle-kit generate && bun drizzle-kit migrate
```

---

## Permission Helpers

Create `apps/editor/lib/permissions.ts`:

```typescript
import type { User } from './auth'
import { db } from './db/client'
import { scenes, sceneCollaborators } from './db/schema'
import { eq, and } from 'drizzle-orm'

export type SceneRole = 'owner' | 'editor' | 'viewer' | null

// Resolve a user's role on a specific scene
export async function getSceneRole(userId: string, sceneId: string): Promise<SceneRole> {
  const [scene] = await db.select({ ownerId: scenes.ownerId }).from(scenes).where(eq(scenes.id, sceneId))
  if (!scene) return null
  if (scene.ownerId === userId) return 'owner'

  const [collab] = await db
    .select({ role: sceneCollaborators.role })
    .from(sceneCollaborators)
    .where(and(eq(sceneCollaborators.sceneId, sceneId), eq(sceneCollaborators.userId, userId)))

  return (collab?.role as 'editor' | 'viewer') ?? null
}

export function canRead(role: SceneRole): boolean {
  return role !== null
}

export function canWrite(role: SceneRole): boolean {
  return role === 'owner' || role === 'editor'
}

export function canDelete(role: SceneRole): boolean {
  return role === 'owner'
}

export function canShare(role: SceneRole): boolean {
  return role === 'owner'
}
```

---

## Feature Gates

Create `apps/editor/lib/feature-gates.ts`:

```typescript
import type { User } from './auth'

type Plan = 'free' | 'pro' | 'team'

function planAtLeast(user: { plan: Plan }, required: Plan): boolean {
  const order: Plan[] = ['free', 'pro', 'team']
  return order.indexOf(user.plan) >= order.indexOf(required)
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin'
}

export function canCreateScene(user: User, currentCount: number): boolean {
  if (isAdmin(user)) return true
  if (planAtLeast(user, 'pro')) return true
  return currentCount < 5  // Free: 5 scene limit
}

export function canExportGLB(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'pro')
}

export function canExportIFC(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'team')
}

export function canShareScene(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'pro')
}

export function canUseMCP(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'pro')
}

export function canUseSSO(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'team')
}

export function canCollaborateRealtime(user: User): boolean {
  return isAdmin(user) || planAtLeast(user, 'team')
}

export function getSceneLimit(user: User): number | null {
  if (isAdmin(user) || planAtLeast(user, 'pro')) return null  // unlimited
  return 5
}
```

---

## Updated API Routes

### `GET /api/scenes` — only return user's scenes

```typescript
export async function GET(request: NextRequest) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const scenes = await listScenes({
    ownerId: session.user.role === 'admin'
      ? undefined    // admins see all scenes
      : session.user.id,
  })
  return sceneApiJson(request, { scenes })
}
```

### `POST /api/scenes` — enforce plan limit, set ownerId

```typescript
export async function POST(request: NextRequest) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  // Check scene count limit
  const currentScenes = await listScenes({ ownerId: session.user.id })
  if (!canCreateScene(session.user, currentScenes.length)) {
    return sceneApiJson(
      request,
      { error: 'plan_limit_exceeded', limit: 5, current: currentScenes.length, upgrade: '/pricing' },
      { status: 402 },
    )
  }

  const parsed = createSceneSchema.safeParse(await request.json())
  if (!parsed.success) return sceneApiJson(request, { error: 'invalid_request' }, { status: 400 })

  const meta = await saveScene({
    ...parsed.data,
    ownerId: session.user.id,   // always set owner to current user
  })
  return sceneApiJson(request, meta, { status: 201 })
}
```

### `PUT/PATCH /api/scenes/[id]` — check write permission

```typescript
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const role = await getSceneRole(session.user.id, id)

  if (!canWrite(role)) {
    return sceneApiJson(request, { error: 'forbidden' }, { status: 403 })
  }

  // ... existing save logic
}
```

### `DELETE /api/scenes/[id]` — owner only

```typescript
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const role = await getSceneRole(session.user.id, id)

  if (!canDelete(role)) {
    return sceneApiJson(request, { error: 'forbidden' }, { status: 403 })
  }

  await deleteScene(id)
  return new NextResponse(null, { status: 204 })
}
```

---

## Scene Sharing API

New route `apps/editor/app/api/scenes/[id]/share/route.ts`:

```typescript
// POST — invite collaborator
// Body: { email: string, role: 'editor' | 'viewer' }
// Requires: owner of scene, Pro plan or above

// GET — list collaborators
// Requires: owner of scene

// DELETE — remove collaborator
// Requires: owner of scene
```

Public share link (viewer-only, no sign-in):
```
/scene/:id?shareToken=<signed-jwt>
```
The token encodes `{ sceneId, role: 'viewer', expiresAt }` — signed with `BETTER_AUTH_SECRET`.

---

## Frontend Plan Enforcement

Add to `apps/editor/app/page.tsx` and viewer toolbar:

```typescript
const { data: session } = useSession()

// Show upgrade prompt instead of save button
if (!canCreateScene(session.user, sceneCount)) {
  return <UpgradePrompt plan="pro" feature="more scenes" />
}

// Disable GLB export button
<ExportButton 
  disabled={!canExportGLB(session.user)}
  tooltip={!canExportGLB(session.user) ? 'Upgrade to Pro to export GLB' : undefined}
/>
```

---

## Admin Access

Platform admin bypasses all ownership checks. Set via:

```sql
UPDATE users SET role = 'admin' WHERE email = 'portmytech@gmail.com';
```

Admin dashboard (Phase 4) will expose a UI for this.

---

## API Token (MCP / Programmatic Access)

The existing `PASCAL_SCENE_API_TOKEN` flow stays but is now scoped:

- Token requests still pass `guardSceneApiRequest`
- But no session → no user → routes that require user fall through to 401
- MCP server gets a **per-user API token** (generated in account settings, Phase 3):

```
POST /api/auth/token
Authorization: Bearer <session cookie>
→ { token: "pk_...", expiresAt: null }
```

This token is stored hashed in `api_tokens` table. When used on API routes, it resolves to the owning user and their plan.

---

## Verify Success

- [ ] New scene → `ownerId` set to current user's id in DB
- [ ] `GET /api/scenes` returns only requesting user's scenes
- [ ] Accessing another user's scene via `GET /api/scenes/:id` → 403
- [ ] Free user with 5 scenes → `POST /api/scenes` → 402 with upgrade URL
- [ ] Pro user → no limit on scene creation
- [ ] Admin user → can read/write all scenes
- [ ] Scene share link gives viewer access to non-owner
