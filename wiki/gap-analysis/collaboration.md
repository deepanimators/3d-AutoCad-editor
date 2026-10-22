# Collaboration — Features and Gaps

## What Exists

### Real-Time Presence
- **`presence-bar.tsx`** — shows active collaborators in current scene
- **`collab-panel.tsx`** — collaboration panel for managing team access
- **`apps/editor/lib/collaboration/collab-store.ts`** — client-side presence state
- **`apps/editor/lib/collaboration/types.ts`** — collaboration type definitions
- **`api/collab/presence`** — presence endpoint (SSE or polling)

Current implementation: live presence (who is online) but **not** real-time co-editing. Two users editing the same scene simultaneously will last-write-win on save. This is presence-only, not operational transform or CRDT.

### Scene Collaborators
- `api/scenes/[id]/collaborators` — add/remove collaborators per scene
- Roles: `owner`, `editor`, `viewer`
- DB: `sceneCollaborators` table
- Invite by email (pending invite support)
- `getSceneRole()` checked on every API call (security enforced server-side)

### Sharing
- `api/scenes/[id]/share-link` — generate shareable link
- `canShareScene()` — Pro+ feature gate
- Share token validation: `lib/share-token.ts`
- Public scene flag (`isPublic` on scene row)
- Viewer-only share (no edit)

### Version History
- `api/scenes/[id]/history` — list versions
- `api/scenes/[id]/history/[eventId]/restore` — restore a version
- `version-history-panel.tsx` — UI panel
- DB: event log per scene (each save is a version)
- Gaps: no named versions; no branching; no diff view

### Organization Workspaces
- `api/orgs/` — CRUD for organizations
- `api/orgs/[slug]/members/` — member management
- Organization scenes: `api/orgs/[slug]/scenes/`
- Invite acceptance: `api/orgs/invite/accept/`
- Roles: owner, member (no editor/viewer distinction at org level)

---

## Gaps

### Real-Time Co-Editing (HIGH PRIORITY)
Current: presence only. Two editors → last-write-wins on save.

Needed: true multiplayer where changes from one user appear in another user's viewport in real time.

**Approaches:**
| Approach | Complexity | Latency | Notes |
|---|---|---|---|
| CRDT (e.g., Yjs) | High | Low | Industry standard for collaborative text/data. Yjs supports arbitrary JSON with `Y.Map`. |
| Operational Transform (OT) | Very High | Low | Used by Google Docs; hard to implement correctly |
| Server-side lock + optimistic UI | Medium | Medium | Lock nodes while another user edits; show ghost changes |
| Event sourcing (append-only ops) | Medium | Low | Scene changes as immutable events; merge by replaying |

**Recommended:** Yjs with `y-websocket` server. Scene graph as `Y.Doc` with `Y.Map` nodes. Each node mutation → Yjs update → broadcast to all clients.

**What changes:**
- `useScene` store becomes a Yjs-aware store
- Node mutations go through Yjs awareness
- `collab-store.ts` upgrades from presence to full CRDT
- Server needs WebSocket upgrade endpoint

### Cursor Sharing (MEDIUM)
Real-time cursor position from other users shown on the 2D floor plan and 3D viewport. Presence bar only shows names today.

### Comment / Markup System (HIGH PRIORITY)
No way to leave a comment on a specific element or location. Needed for design review workflows.

| Feature | Notes |
|---|---|
| Pin comment on a node (click node → add comment) | Pins appear in 3D view |
| Pin comment on 2D floorplan at coordinates | — |
| Thread / reply on a comment | — |
| Resolve / unresolve comments | — |
| Comment notification (email) | — |
| Comment export (PDF with comment overlay) | — |

### Version Branching (MEDIUM)
Current history is linear (every save is a version). No branching, no named snapshots.

| Feature | Notes |
|---|---|
| Named versions / milestones ("DD submission", "SD issue") | — |
| Branch from a version | Explore alternative designs |
| Merge branch back to main | — |
| Compare two versions (diff view) | Highlight changed nodes |

### Access Control Granularity (MEDIUM)
Current: `owner / editor / viewer` per scene. No per-node or per-level access control.

| Gap | Notes |
|---|---|
| Per-level access (structural engineer sees only structure level) | — |
| Per-node-type filter (MEP consultant sees only MEP nodes) | — |
| Read-only specific rooms/zones | — |
| Org-level role inheritance | — |
| Guest link expiry | — |

### Audit Log (DONE — partially)
`audit.ts` + `audit_log` table — logs admin actions. Gaps:
- Scene edit events not logged (only admin operations)
- No per-field diff in log
- No log export

### Notification System (MISSING)
No notifications for: scene shared with you, collaborator added, comment posted, version restored, invite accepted.

### Comparison Table — Aruct vs CadCraft

| Feature | CadCraft | Aruct |
|---|---|---|
| Real-time co-editing | ❌ (single-user) | ❌ (presence-only) |
| Presence (who is online) | ❌ | ✅ |
| Scene sharing (view link) | ❌ | ✅ Pro |
| Collaborator roles | ❌ | ✅ (owner/editor/viewer) |
| Version history | ❌ | ✅ |
| Organization workspaces | ❌ | ✅ |
| Comment / markup | ❌ | ❌ |
| Cloud storage | ❌ (local files) | ✅ |
| Email notifications | ❌ | ❌ |
| Audit log | ❌ | ✅ (admin only) |

---

## Recommended Next Steps

1. **Comment system** — pin comments on nodes and 2D canvas; threads; resolve/unresolve
2. **Real-time co-editing (Yjs)** — true multiplayer; prerequisite for many enterprise deals
3. **Named versions** — "DD", "CD", "Permit Set" milestones
4. **Version diff view** — visual highlight of what changed between versions
5. **Cursor sharing** — other users' cursors on 2D plan
6. **Email notifications** — invite, comment, share events
