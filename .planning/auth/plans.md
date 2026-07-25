# Subscription Plans — Aruct Editor

## Plan Overview

```
Free ──────→ Pro ──────→ Team
$0/mo       $29/mo      $79/mo per seat
```

---

## Plan 1: Free

**Target:** Individuals trying the tool, students, hobbyists  
**Price:** $0 forever  
**Conversion goal:** Upsell to Pro when they hit scene limit or need export

### Included
- Up to **5 scenes** (hard limit enforced server-side)
- Full 3D editor: walls, floors, levels, doors, windows
- Floorplan 2D view
- Real-time 3D preview
- Scene management (list, rename, delete)
- **JSON export** only
- Watermark on exported renders/thumbnails
- Community Discord support
- 1 GB scene storage

### Not Included
- GLB / IFC export
- MCP server access (AI tools)
- Scene sharing with collaborators
- Custom thumbnails (uses auto-generated)
- Team workspaces
- SSO

### Enforcement
```typescript
// Feature gate checks
canCreateScene(user) => user.sceneCount < 5
canExportGLB(user)   => false
canUseMCP(user)      => false
```

---

## Plan 2: Pro

**Target:** Architecture professionals, freelancers, solo designers  
**Price:** $29/month (or $290/year — 2 months free)  
**Conversion goal:** Upsell to Team when they need to share with clients/team

### Included
- **Unlimited scenes**
- Everything in Free
- **GLB export** (Draco-compressed, ready for web/game engines)
- **No watermark** on exports
- Scene **sharing via link** (viewer-only, no sign-in required for recipient)
- Custom scene thumbnails (hero-framed snapshot)
- **MCP server access** — AI agents can read/write scenes via Claude/Cursor
- 10 GB scene storage
- Priority email support (48h response)
- Early access to beta features

### Not Included
- IFC export (industry standard BIM format)
- Real-time collaboration (concurrent editing)
- Team workspaces and member management
- SSO / SAML
- Audit logs
- SLA

### Enforcement
```typescript
canCreateScene(user) => true  // unlimited
canExportGLB(user)   => user.plan === 'pro' || user.plan === 'team'
canShareScene(user)  => user.plan === 'pro' || user.plan === 'team'
canUseMCP(user)      => user.plan === 'pro' || user.plan === 'team'
```

---

## Plan 3: Team

**Target:** Architecture studios, firms, engineering teams, real estate developers  
**Price:** $79/month per seat (billed per active member)  
**Min seats:** 2  
**Volume pricing:** 10+ seats → contact for discount

### Included
- **Everything in Pro**, per seat
- **IFC export** (IFC 2x3, compatible with Revit, ArchiCAD, BIM 360)
- **Team workspace** — shared scene library, org-level access
- **Real-time collaboration** — multiple users editing same scene (Liveblocks/Yjs)
- **Collaborator roles on scenes:** owner / editor / viewer
- **SSO / SAML** (Okta, Azure AD, Google Workspace)
- **Admin dashboard** — manage members, roles, usage
- **Audit log** — who changed what scene and when
- **Custom domain** for sharing links (`designs.yourcompany.com`)
- 100 GB shared team storage
- Dedicated Slack channel support
- **SLA:** 99.9% uptime, 4h response for P1 issues

### Future (roadmap)
- White-label viewer embed for client portals
- Approval workflows (draft → review → approved)
- Branching scenes (like git branches)

### Enforcement
```typescript
canExportIFC(user)        => user.plan === 'team'
canUseSSO(org)            => org.plan === 'team'
canViewAuditLog(user)     => user.orgRole === 'team_admin'
canInviteMembers(user)    => user.orgRole === 'team_admin'
canCollaborateRealtime(u) => user.plan === 'team'
```

---

## Feature Matrix

| Feature | Free | Pro | Team |
|---------|:----:|:---:|:----:|
| **Scenes** | 5 | Unlimited | Unlimited |
| **Storage** | 1 GB | 10 GB | 100 GB (shared) |
| **3D editor** | ✅ | ✅ | ✅ |
| **Floorplan 2D** | ✅ | ✅ | ✅ |
| **JSON export** | ✅ | ✅ | ✅ |
| **GLB export** | ❌ | ✅ | ✅ |
| **IFC export** | ❌ | ❌ | ✅ |
| **No watermark** | ❌ | ✅ | ✅ |
| **Scene sharing** | ❌ | ✅ (view-only) | ✅ (role-based) |
| **MCP server** | ❌ | ✅ | ✅ |
| **Real-time collab** | ❌ | ❌ | ✅ |
| **Team workspace** | ❌ | ❌ | ✅ |
| **SSO / SAML** | ❌ | ❌ | ✅ |
| **Admin dashboard** | ❌ | ❌ | ✅ |
| **Audit logs** | ❌ | ❌ | ✅ |
| **Custom domain** | ❌ | ❌ | ✅ |
| **Support** | Community | Email 48h | Dedicated Slack + SLA |
| **Price** | $0 | $29/mo | $79/seat/mo |

---

## Pricing Rationale

- **Free** is genuinely useful (not crippled) to drive organic growth and word-of-mouth
- **$29 Pro** is a no-brainer for anyone using this professionally — under an hour of billable time
- **$79 Team** is justified by IFC export alone (Revit licenses cost thousands); collab + SSO make it a clear enterprise buy

## Stripe Products to Create

```
product: "Aruct Editor Pro"
  price: $29/month (recurring)
  price: $290/year (recurring)

product: "Aruct Editor Team"
  price: $79/month per seat (recurring, metered or per-quantity)
  price: $790/year per seat
```

## Trial Policy

- Free plan has no trial timer — it's permanently free
- Pro: 14-day free trial (no credit card required at signup, card required to continue)
- Team: 14-day trial, or contact sales for POC
