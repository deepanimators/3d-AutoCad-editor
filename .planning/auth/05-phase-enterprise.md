# Phase 4: Enterprise Features

## Goal

Unlock Team plan capabilities: org workspaces, SSO, real-time collaboration, audit logs, admin dashboard.

This phase is behind the Team plan gate — only build when Team plan is generating revenue.

---

## 4A: Team Workspaces (Organizations)

Better Auth has a built-in `organization` plugin. Enable it:

```typescript
// In lib/auth.ts
import { organization } from 'better-auth/plugins'

export const auth = betterAuth({
  // ... existing config
  plugins: [
    organization({
      membershipLimit: 500,
      allowUserToCreateOrganization: (user) => {
        return user.plan === 'team'  // only Team users can create orgs
      },
    }),
  ],
})
```

Better Auth creates:
```
organizations  — id, name, slug, logo, metadata, createdAt
members        — id, organizationId, userId, role, createdAt
invitations    — id, email, role, organizationId, inviterId, status, expiresAt
```

### Org Roles

| Role | Capabilities |
|------|-------------|
| `owner` | Full org control, billing, delete org |
| `admin` | Manage members, shared scenes, org settings |
| `member` | Access shared scenes per their scene role |

### Shared Scene Library

Add `orgId` to scenes table:
```typescript
scenes.orgId = text('org_id').references(() => organizations.id)
```

When a scene has `orgId` set, it's visible to all org members (with their respective scene role).

### Org Dashboard

`/org/[slug]/` — admin-only:
- Member list with roles
- Shared scenes
- Usage stats
- Invite members by email

---

## 4B: SSO / SAML

Better Auth's SSO plugin:

```bash
bun add @better-auth/sso
```

```typescript
import { ssoProvider } from '@better-auth/sso'

plugins: [
  ssoProvider({
    // Supports SAML 2.0 and OIDC
  }),
]
```

Flow for Team admin:
1. Go to `/org/[slug]/settings/sso`
2. Enter IdP metadata URL (Okta, Azure AD, Google Workspace)
3. Copy SP metadata URL to configure in IdP
4. Test SSO login

SSO is restricted to `team` plan orgs only:
```typescript
canConfigureSSO(user) => user.orgRole === 'owner' && user.plan === 'team'
```

---

## 4C: Real-Time Collaboration

Two good options:

### Option A: Liveblocks (SaaS, fast integration)

```bash
bun add @liveblocks/client @liveblocks/react
```

- Liveblocks manages CRDT conflict resolution
- Each scene gets a Liveblocks "room" keyed by `sceneId`
- Presence: see other users' cursors in floorplan and 3D view
- Awareness: who is currently editing which level
- Free tier: 25 MAU — enough for early Team customers

### Option B: Yjs + PartyKit (self-hosted CRDT)

```bash
bun add yjs @hocuspocus/provider
```

- PartyKit runs serverless Yjs rooms on Cloudflare Workers
- More control, no per-MAU pricing at scale
- More integration work (~3x effort vs Liveblocks)

**Recommendation:** Start with Liveblocks for speed to market. Migrate to Yjs if Liveblocks cost becomes significant at scale.

### Collab Gate

```typescript
// In viewer: only connect to Liveblocks if plan === 'team'
const isCollabEnabled = canCollaborateRealtime(session.user)

if (isCollabEnabled) {
  // <RoomProvider roomId={sceneId}>
}
```

---

## 4D: Audit Log

New table:

```typescript
export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id'),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),     // 'scene.create' | 'scene.delete' | 'member.invite' | ...
  resourceType: text('resource_type'),  // 'scene' | 'member' | 'org'
  resourceId: text('resource_id'),
  metadata: text('metadata'),           // JSON blob with before/after
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

Log writer:

```typescript
export async function logAction(params: {
  userId: string
  orgId?: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: unknown
  request?: Request
}) {
  await db.insert(auditLog).values({
    ...params,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    ipAddress: params.request?.headers.get('x-forwarded-for') ?? null,
  })
}
```

Add to all scene API routes:
```typescript
await logAction({ userId: session.user.id, action: 'scene.delete', resourceId: id })
```

Audit log viewer: `/org/[slug]/audit` — paginated table, filterable by user/action/date.

---

## 4E: Admin Dashboard (Platform Admin)

Route: `/admin` — behind `role === 'admin'` check.

```
/admin
  /admin/users         — list all users, search by email, see plan + status
  /admin/subscriptions — MRR, churn, active subscriptions
  /admin/scenes        — all scenes, storage usage
  /admin/orgs          — all organizations
  /admin/impersonate   — sign in as any user (for support)
```

Middleware:

```typescript
// In apps/editor/middleware.ts — add:
if (pathname.startsWith('/admin')) {
  const session = await getSessionFromCookie(request)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

### Impersonation

Better Auth supports admin impersonation:

```typescript
import { admin } from 'better-auth/plugins'

plugins: [
  admin({
    impersonationSessionDuration: 60 * 60,  // 1 hour max
  }),
]
```

All impersonated actions are logged in the audit log with both the admin's and target user's IDs.

---

## 4F: Custom Domain (Scene Sharing)

For Team plan — allow `designs.client.com` to serve shared scene viewer.

Implementation: Vercel Domains API + edge middleware that reads the custom domain config and loads the right org's shared scenes.

```typescript
// Per-org custom domain stored in organizations table:
customDomain: text('custom_domain').unique()
```

Configure in Vercel:
```bash
vercel domains add designs.client.com
```

Middleware reads `host` header → finds org by `customDomain` → shows org's public scenes.

---

## Phase 4 Order of Work

1. **4A Team Workspaces** — prerequisite for everything else
2. **4D Audit Log** — add alongside 4A (low effort, high compliance value)
3. **4E Admin Dashboard** — needed for support operations
4. **4B SSO** — needed to close enterprise deals
5. **4C Real-Time Collaboration** — highest complexity, do last
6. **4F Custom Domain** — nice-to-have, depends on customer demand

---

## Verify Success (4A + 4E minimum)

- [ ] Team user can create an organization
- [ ] Org admin can invite members by email
- [ ] Invited member accepts, sees shared scenes
- [ ] Removing member removes their scene access
- [ ] `/admin/users` loads list of all users with plan info
- [ ] Admin can impersonate a user and their session shows `isImpersonating: true`
- [ ] Audit log captures all scene create/delete/share events
- [ ] `/org/[slug]/audit` shows paginated audit events for org admin
