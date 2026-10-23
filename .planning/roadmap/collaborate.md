# Aruct Collaborate: Market Research & Implementation Roadmap

> Design review & markup

## Executive Summary

The AEC software market has a clear, unoccupied position: a web-native, 3D-aware design review tool aimed at architecture studios and small-to-mid-size firms that cannot afford enterprise platforms but outgrew email threads and PDF markups. The construction collaboration software sub-market is valued at $1.5 billion in 2025 and projected to grow to $3.2–4.8 billion by 2033–2034 at a CAGR of 9.2–12.5%. Cloud-based deployment is the fastest-growing segment within it, at 12.1% CAGR. The tools that dominate today — Autodesk Construction Cloud, Bluebeam Revu, Procore — were built for contractors and large enterprises, not for the architects who are actually designing buildings. Their pricing, complexity, and contractor-centric workflows leave the design-phase review market substantially underserved.

Aruct is positioned to enter this gap from a distinct angle: it already owns the 3D scene (packages/core, packages/viewer), it already has a plugin system, and it already has an MCP server. Aruct Collaborate is not a separate product — it is a collaboration and issue-tracking layer built directly on top of the existing scene graph, exposed through a browser-based review portal that clients can open without installing anything. The competitive advantage is the combination of 3D model awareness, real-time multiplayer, and structured issue tracking at a price point ($19–69/editor/month) accessible to studios that cannot contemplate Procore's $15K+ entry price or ACC's opaque enterprise contracts.

The recommended approach is phased: Phase 1 delivers the core review loop — share a 3D scene, collect structured client feedback, track it as issues, export a record. Phase 2 adds real-time multiplayer, 2D/3D linked views, approval workflows, and BCF interoperability to reach competitive parity with Trimble Connect and Revizto. Phase 3 differentiates with AI-assisted issue categorization, visual 3D scene diffing, WebXR review, and an offline review pack. The north star metric is issues resolved per active project per month — the number that proves the product is embedded in actual project workflows.

---

## Market Overview

**AEC Software Market (broad):** $10.23–11.04 billion in 2024–2025, projected to reach $19.79–20.4 billion by 2032–2035 at a CAGR of 6.8–12%. BIM software alone accounts for approximately $6.2 billion of combined revenue across application categories.

**Construction Collaboration Software (target sub-market):** $1.5 billion in 2025, projected to reach $3.2–4.8 billion by 2033–2034 at a 9.2–12.5% CAGR. Cloud-based deployment growing at 12.1% CAGR from 2026–2034 — this is the fastest-growing segment and the one Aruct Collaborate targets directly.

**Regional breakdown (construction collaboration, 2025 estimates):**

| Region | 2025 Est. | 2033 Proj. | CAGR |
|---|---|---|---|
| North America | $2.8B | $4.2B | 6.2% |
| Asia Pacific | $1.4B | $2.5B | 8.0% |
| Europe | $1.2B | $2.0B | 7.0% |
| Latin America | $0.45B | $0.8B | 7.5% |
| Middle East & Africa | $0.35B | $0.6B | 7.2% |

**Key market drivers:**
- BIM adoption mandated on public projects in the UK, EU, Singapore, and increasingly the US — creating demand for cloud-based model review tools that can serve as Common Data Environments (CDEs)
- Distributed AEC teams post-pandemic — design and construction teams now routinely span time zones and continents, requiring asynchronous and synchronous collaboration tooling
- Regulatory pressure for digital handover documentation and audit trails under ISO 19650
- Increasing project complexity requiring multi-discipline coordination across structural, MEP, and architectural teams
- Client expectations shifting toward real-time transparency into design progress
- AI integration into clash detection, issue prioritization, and predictive risk — early adopters are building AI into their coordination workflows

**The unfilled position:** No single tool combines 3D model awareness, real-time multiplayer annotation, client-friendly no-install access, structured issue tracking tied to model elements, and design-phase orientation at a price accessible to architecture studios. The combination that exists (ACC, Revizto) starts at $350–690/user/year and requires Revit ecosystem adoption. The affordable tools (Trimble Connect at $12.99/user/month) have weak UX and shallow issue management. The design collaboration tools architects actually use (Figma, Miro) are geometrically blind — they treat buildings as flat images.

---

## Competitor Analysis

### Autodesk Construction Cloud (ACC / BIM 360)

**Platform:** Web, Windows desktop, iOS, Android

**Pricing:** Opaque — requires reseller negotiation. BIM Collaborate: ~$690/user/year; BIM Collaborate Pro: ~$990/user/year; Build: ~$60/user/month. Enterprise contracts negotiated separately.

**Strengths:**
- Deepest integration with Revit/AutoCAD ecosystem — no round-tripping required
- True model-based issue tracking: issues anchored to 3D elements, not just viewpoints
- ISO 19650 compliant Common Data Environment — satisfies regulatory requirements
- End-to-end coverage: design through construction handover in one platform
- 400+ third-party integrations via Autodesk Platform Services
- Native cloud clash detection (Navisworks integration)
- Role-based permissions at project/folder/document granularity

**Weaknesses:**
- Assembled through acquisitions — modules feel disconnected and inconsistent
- No published pricing; requires reseller negotiation; consistently cited as expensive
- Steep learning curve; onboarding typically requires third-party consultants
- No lightweight client portal — clients need full ACC licenses
- Slow product iteration due to legacy platform architecture
- Field tools designed for office users, not site workers
- 3D browser markup less capable than desktop Navisworks

**Key differentiators:**
- Only tool that truly integrates Revit worksharing with cloud coordination (BIM Collaborate Pro)
- Largest footprint across enterprise contractors and public-sector projects globally
- Navisworks-class clash detection accessible via browser

---

### Bluebeam Revu

**Platform:** Windows (primary), Web (launched 2024), iOS, Android

**Pricing:**

| Tier | Annual Per User |
|---|---|
| Basics | $260 |
| Core | $330 |
| Complete | $440 |
| Max | $590 |

**Strengths:**
- Industry-standard for 2D PDF markup — the reference tool for construction document review
- Bluebeam Studio: real-time multi-user simultaneous markup with full attribution per user
- Overlay comparison (visual diff) for 2D drawing revisions is unmatched
- Fastest adoption curve — non-technical users productive within hours
- Audit trail with author/date/time on every markup
- Custom tool sets for discipline-specific markup (architecture, structural, MEP)
- Official Procore integration (September 2025)

**Weaknesses:**
- Zero 3D model support — treats buildings as flat PDFs only
- No structured issue tracking or project management
- Mac support discontinued; Windows desktop remains primary
- No client portal concept — clients need Bluebeam licenses
- Not designed for design-phase review — better suited for construction documents
- No native RFI workflow without an external tool

**Key differentiators:**
- Overlay comparison for 2D drawing revisions: unique visual diff capability for sheet-based workflows
- Studio Sessions: real-time simultaneous markup is the closest thing to Figma-style co-editing in 2D document review

---

### Procore

**Platform:** Web, iOS, Android (mobile-first)

**Pricing:** ACV-based (Annual Construction Volume), not per-seat. Estimated $15K–30K/year for small GCs; $30K–80K/year for mid-size firms. No published per-user rate.

**Strengths:**
- "Unlimited users" model — no per-seat friction, enables entire supply chain participation
- Best-in-class RFI and submittal workflow management in the industry
- Largest integration marketplace in construction software (400+ integrations)
- ACV-based pricing aligns cost to business scale rather than headcount
- Comprehensive lifecycle coverage: design through construction and closeout
- Mobile-first design with strong field adoption

**Weaknesses:**
- Markup tools basic — adequate for flagging, not detailed design review
- No native 3D model viewer
- Complex setup: permissions, templates, and workflows require structured implementation
- ACV pricing opaque and reportedly escalating (10–14% annual increases)
- Overkill for small firms or design-phase review workflows
- Not designed for architect-to-client feedback cycles

**Key differentiators:**
- Unlimited-user ACV pricing model: no friction adding subcontractors, owners, or inspectors
- RFI and submittal workflow management is the industry benchmark

---

### Fieldwire (by Hilti)

**Platform:** Web, iOS, Android (mobile-first); no Windows desktop

**Pricing:**

| Tier | Monthly Per User (annual billing) |
|---|---|
| Free | $0 (5 users, 3 projects, 100 sheets) |
| Pro | $39 |
| Business | $64 |
| Business Plus | $89 |
| Enterprise | Custom |

**Strengths:**
- Strongest offline capability in the market — download plans, work without connectivity, sync on reconnect
- Field-first design — fastest time-to-value for punch lists and site documentation
- Free tier (5 users, 3 projects, 100 sheets) lowers adoption barrier significantly
- Mobile plan viewing experience rated best-in-class for field workers
- Task management and punch list workflows well-suited to construction phase

**Weaknesses:**
- Markup depth far below Bluebeam — not suitable for detailed design review
- No 3D BIM model support
- Dashboard and analytics lighter than dedicated platforms
- RFIs and submittals locked behind Business Plus tier ($89/user/month)
- No Windows desktop application
- Advanced automation capabilities absent

**Key differentiators:**
- Offline-first PWA: the only major tool that makes plan viewing genuinely offline-capable
- Free tier with real utility drives grassroots field adoption

---

### Navisworks (Autodesk)

**Platform:** Windows desktop only

**Pricing:** ~$96.63/month subscription entry price (Navisworks Manage). Annual subscription via Autodesk.

**Strengths:**
- Industry-leading clash detection — the reference tool for BIM coordination
- 4D simulation linking model elements to project schedules (TimeLiner)
- Handles the largest, most complex federated models in the industry
- Supports 30+ import formats (Revit, AutoCAD, MicroStation, IFC, DWG, and more)
- Quantification module for model-based takeoff
- Saved viewpoints with annotations and BCF export

**Weaknesses:**
- Desktop-only — no browser version, no real-time collaboration
- Not designed for client-facing review — steep learning curve
- Large models can process slowly on older hardware
- No real-time multi-user collaboration — share-file workflow, not live
- No platform-level issue tracking (BCF export only, not a workflow platform)
- No mobile access

**Key differentiators:**
- 4D construction sequence simulation: unique capability for visualizing construction scheduling against model geometry
- Clash detection remains the industry standard despite many competitors attempting to replicate it

---

### Trimble Connect

**Platform:** Web, Windows, iOS, Android, Chromebook, Linux

**Pricing:**

| Tier | Monthly Per User |
|---|---|
| Freemium | $0 (limited) |
| Business | $12.99 |
| Business Premium | $23.95 |

**Strengths:**
- Neutral and software-agnostic — best choice for mixed-vendor teams not locked to Revit
- Lowest price point among 3D model coordination tools
- Browser-based — clients and consultants join without licensing burden
- BCF-native — standard format enabling interoperability with any BCF-supporting tool
- Cloud-native with document management and auto-revision tracking
- REST API for custom integrations
- Trimble ecosystem integration (Tekla Structures, SketchUp, Trimble Field)

**Weaknesses:**
- View-only in browser — no authoring or editing
- Clash detection secondary to Navisworks in capability and workflow depth
- Occasional file format compatibility issues reported
- Requires internet connectivity for all operations
- Less mature integration marketplace versus Autodesk or Procore

**Key differentiators:**
- Price point ($12.99/user/month) in the 3D coordination space with no viable competitor at the same tier
- Tekla + SketchUp integration: critical for structural and conceptual design teams outside the Revit ecosystem

---

### Revizto

**Platform:** Windows, Mac, iOS, Android

**Pricing:** ~$350/month subscription (tiered by users; range $100–500/month). Annual subscription model.

**Strengths:**
- Best-in-class issue tracker for 3D model-linked issues — issues anchored to exact 3D locations
- Combines clash detection, issue management, and model review in one platform
- Full Mac and mobile support (addressing Bluebeam's Windows-only limitation)
- VR walkthrough integration: unique at this price tier
- Integrates Navisworks clash groups into its coordination workflow
- Real-time notifications and multi-user coordination
- 2D + 3D unified review environment

**Weaknesses:**
- Pricing ($350+/month) excludes smaller studios
- Less known than ACC or Procore for field workflows
- Primarily coordination-phase focused, less design-phase oriented
- No dedicated client portal with simplified UX
- Limited project management features versus Procore

**Key differentiators:**
- Issue tracking anchored to precise 3D geometry: the most mature implementation in this price tier
- VR walkthrough + issue review: ahead of competitors in immersive coordination support

---

### Figma (Design Review Proxy)

**Platform:** Web (primary), desktop Electron app, iOS/Android (view only)

**Pricing:** Free (limited); Starter $15/editor/month; Professional $45/editor/month; Organization/Enterprise tiers above.

**Strengths:**
- The UX benchmark for real-time collaboration — multiplayer done correctly (cursors, presence, co-editing)
- Frictionless guest access: no install, browser-only for reviewers
- Comment threading with resolution tracking
- Version history with named saves
- Presentation mode for client reviews
- Unlimited guest viewers on Free tier

**Weaknesses (for AEC use):**
- Treats buildings as flat images — no 3D geometry awareness whatsoever
- No IFC/DWG/RVT model support
- Comments live on canvas, disconnected from model metadata
- No issue status management (open/in-progress/resolved/won't fix)
- No role-based permission depth required for AEC workflows
- No audit trail suitable for construction or regulatory purposes
- Sensitive design IP spread across consumer cloud infrastructure

**Key differentiators:**
- Collaboration UX is the reference point for the entire industry — any new tool is compared against Figma's multiplayer experience
- Guest access model (editors pay, reviewers free) is the correct mental model for design review tools

---

### Miro

**Platform:** Web, desktop Electron app, iOS, Android

**Pricing:** Free (limited); Starter $8/user/month; Business $16/user/month; Enterprise custom.

**Strengths:**
- Best workshop facilitation: timers, voting, ice-breakers for design charrettes and client workshops
- Template library for various review and ideation formats
- Strong for early-stage ideation, brief mapping, and stakeholder alignment
- Real-time multiplayer with cursor tracking and live reactions
- Guest access for client participation

**Weaknesses (for AEC use):**
- Same fundamental limitation as Figma: no 3D or BIM awareness
- Not designed for structured issue tracking (no open/closed states, severity, assignee)
- No document version control
- No audit trail
- Comments not anchored to geometric elements
- Not a replacement for any construction phase tool

**Key differentiators:**
- Workshop facilitation features (voting, timers, templates) are genuinely unique — no AEC tool matches Miro for collaborative design session facilitation
- At $8–16/user/month, it is the entry price anchor architects use when evaluating "collaboration tools"

---

## Feature Comparison Matrix

| Feature | Autodesk Build/ACC | Bluebeam Revu | Procore | Fieldwire | Trimble Connect | Revizto | Aruct (Proposed) |
|---------|--------|--------|--------|--------|--------|--------|-----------------|
| Browser-based, no install | Partial | Partial (2024) | Yes | Yes | Yes | No (desktop) | Yes |
| 3D model viewing | Yes | No | No | No | Yes | Yes | Yes |
| IFC import | Yes | No | No | No | Yes | Yes | Yes |
| DWG import | Yes | PDF only | PDF only | PDF only | Yes | Yes | Yes (Phase 2) |
| 2D PDF markup | Yes | Yes (best-in-class) | Basic | Basic | No | Basic | Yes (Phase 2) |
| Comment on 3D elements | Yes | No | No | No | Partial | Yes | Yes |
| Issue status tracking | Yes | No | Yes | Yes | Partial | Yes | Yes |
| Assignee + due date on issues | Yes | No | Yes | Yes | Partial | Yes | Yes |
| Issue priority + category | Yes | No | Yes | Partial | No | Yes | Yes |
| Real-time multiplayer | Partial | Yes (Studio) | No | No | No | Partial | Yes (Phase 2) |
| Live cursor presence | No | No | No | No | No | No | Yes (Phase 2) |
| Guest access (no license) | No | No | No | Partial | Partial | No | Yes |
| Client portal (simplified UX) | No | No | No | No | No | No | Yes (Phase 2) |
| Version history | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Visual 3D diff between versions | No | 2D overlay only | No | No | No | No | Yes (Phase 3) |
| BCF export/import | Yes | No | No | No | Yes | Yes | Yes (Phase 2) |
| Approval workflow | Yes | No | Yes | No | No | Partial | Yes (Phase 2) |
| Offline access | No | Partial | No | Yes (best) | No | No | Yes (Phase 3) |
| Audit trail | Yes | Yes | Yes | Partial | Partial | Yes | Yes |
| Email notifications | Yes | Partial | Yes | Yes | Partial | Yes | Yes |
| Slack/Teams integration | Yes | No | Yes | No | No | No | Yes (Phase 2) |
| Webhook API | Yes | No | Yes | Partial | Yes | No | Yes (Phase 2) |
| BCF REST API | Yes | No | No | No | Partial | No | Yes (Phase 2) |
| VR/WebXR review | No | No | No | No | No | Yes | Yes (Phase 3) |
| AI issue categorization | Partial | No | No | No | No | No | Yes (Phase 3) |
| MCP server integration | No | No | No | No | No | No | Yes |
| Price entry (editors) | ~$57/user/mo | ~$22/user/mo | ACV ~$15K+/yr | Free–$89/user/mo | $12.99/user/mo | ~$350/mo flat | $19/user/mo (proposed) |
| Free guest reviewers | No | No | No | Limited | Partial | No | Yes |

---

## Recommended Feature Set for Aruct Collaborate

### Phase 1: MVP (Months 1–6)

**Goal:** A team can invite a client to review a 3D Aruct scene, the client leaves structured comments anchored to specific elements, the architect tracks those as issues, and a resolution record is generated — all without the client installing anything or holding an Aruct license.

**Scene Sharing and Access**
- Share a scene via link with configurable permissions: view-only, comment, full edit
- Guest access: clients join via link without an Aruct account; they enter a display name to participate
- Role system: Owner, Editor, Reviewer, Guest
- Optional password protection on share links
- Optional expiry dates on guest links
- Per-link access log (who opened it, when)

**3D Viewing in Browser**
- Load Aruct `.aruct` scene format directly via the existing packages/viewer renderer
- IFC import for reviewing external models (not just Aruct-native scenes)
- Camera orbit, pan, zoom, section planes, element isolation (hide/show)
- Click any element to inspect properties: material, type, dimensions from the scene graph
- Named saved viewpoints ("Entrance Lobby — Client Concern #3") that can be bookmarked and shared directly

**Comment and Annotation System**
- Click any 3D element or surface point to drop a comment; comment is anchored to element ID plus a saved viewpoint (camera position, selection state, section planes)
- Threaded replies on each comment
- @mention team members in comments, triggering email notifications
- Comment author, timestamp, and element reference always visible in context
- Markdown formatting in comments (bold, bullets, code, links)
- Emoji reactions on comments for lightweight acknowledgment

**Issue Tracker**
- Any comment can be promoted to an Issue with: title, description, element reference, status (Open / In Progress / Resolved / Won't Fix), assignee (any project member), due date, priority (Critical / High / Medium / Low), and category tag (Design / Structural / MEP / Compliance / Client Feedback)
- Issue list view with filter and sort by status, assignee, priority, date created, and date updated
- Issue count badge displayed on the shared scene link for reviewers
- Issue activity log: every status change recorded with actor and timestamp

**Version History**
- Auto-snapshot the scene on every publish action
- Named versions ("Scheme A — 2026-10-15")
- Restore any previous version
- Change log: who changed what and when
- "Compare to version N" mode: element-level diff with color-coded highlighting in the 3D viewer (added = green, removed = red, modified = yellow)

**Notifications**
- Email notifications for: new comment, @mention, issue assigned to you, issue resolved, new version published, share link first accessed
- In-app notification bell with unread count
- Per-project notification preferences: opt out of specific event types

**Audit Trail**
- Immutable log of all: version publishes, comment creation and edits, issue status changes, permission changes, share link accesses, member additions and removals
- Full user attribution and timestamp on every entry
- Exportable as CSV or PDF for project records and regulatory compliance

**Export and Reporting**
- Export issue list as CSV or PDF
- Export annotated viewpoints as a PDF report: viewpoint screenshot + comment text + issue metadata
- Generate a read-only static HTML report of all resolved issues (no login required to view) for formal project records

---

### Phase 2: Growth (Months 7–12)

**Goal:** Reach competitive parity with Trimble Connect and Revizto. Unlock the use cases that currently require separate tools — real-time design sessions, 2D document review, formal approval, and BCF interoperability.

**Real-Time Multiplayer**
- Live cursor presence for all active viewers: colored cursors with display names
- Real-time comment creation visible to all connected users without refresh
- "Follow me" presenter mode: presenter drives the camera, all connected clients follow in sync
- Reaction overlays (thumbs up, question mark, flag) for quick in-session non-verbal feedback
- Active user avatars shown in the toolbar with names and current camera positions

**2D/3D Linked Review**
- Upload 2D PDF sheets alongside the 3D scene as a linked document set
- Click any 3D element to jump to its location on the corresponding 2D sheet (and vice versa)
- Annotate directly on 2D PDF sheets: lines, rectangles, clouds, text annotations consistent with construction document review practice
- Issues can reference both a 3D element and a 2D sheet location simultaneously

**Approval Workflow**
- "Request Approval" action on any named scene version
- Define an approval chain: list approvers in sequence or parallel
- Each approver reviews the version, reads all comments, and approves or rejects with mandatory notes
- Approved versions receive a tamper-evident digital approval record with user identity and timestamp
- Optional e-signature integration (DocuSign, HelloSign) for formal contract submittals
- Submitter notified immediately on approval or rejection with approver notes

**BCF Export and Import**
- Export any filtered issue set as a BCF 2.1 `.bcfzip` file, compatible with ACC, Navisworks, Revizto, Solibri, ArchiCAD
- Import BCF files from other tools into the Aruct issue tracker; link viewpoints to Aruct scene elements where GUIDs match
- BCF round-trip: consultant exports BCF from Navisworks, architect imports to Aruct, resolution exported back as BCF
- Viewpoint data stored using the BCF 2.1 viewpoint schema from day one to ensure round-trip fidelity

**Integrations**
- Slack: post to a channel on new issue created, issue resolved, and new version published
- Microsoft Teams: same event set as Slack
- Zapier/Make: outbound webhooks on any issue or version event for custom automation
- Email-to-issue: reply to any notification email to add a comment to the corresponding issue
- Google Drive / Dropbox: attach reference files (specifications, consultant drawings) to issues

**Client Portal**
- Custom-branded review portal per project: project logo, accent color, client-facing project name
- Clients see only their assigned projects, not the team's full workspace
- Simplified client UI: view + comment + vote + approve; no editing tools, no project settings
- Activity feed per project: chronological stream of recent updates, new versions, and resolved items
- Mobile-optimized portal layout for clients reviewing on phones and tablets

**Advanced Roles and Permissions**
- Per-project role templates (e.g., "Client Reviewer" preset with comment-only access)
- Domain allowlist: restrict project access to specific email domains (e.g., only @clientco.com)
- SSO support via Google Workspace and Microsoft Entra (OIDC)
- Folder-level permissions for multi-phase or multi-building projects

**DWG and Extended Format Import**
- Import DWG files as reference geometry layers in the 3D scene
- Import PDF sheets as 2D underlay reference alongside 3D scene
- Supports teams whose consultants deliver in DWG or PDF rather than IFC

---

### Phase 3: Leadership (Months 13–18+)

**Goal:** Create genuine differentiation that no competitor offers. Build the features that make switching away from Aruct Collaborate painful.

**AI-Assisted Review**
- AI issue categorization: auto-tag incoming comments by type (structural concern, aesthetic feedback, code compliance query, coordination conflict) using the issue content and element context
- AI session summary: before a client design meeting, generate a one-page summary of all open comments and their current status
- AI clash pre-screening: flag potential geometric conflicts without requiring a full Navisworks coordination workflow — useful for early-stage design coordination
- AI-generated meeting notes from a live review session: summarize what was discussed, what was resolved, and what requires follow-up
- Smart issue deduplication: flag new comments that closely match an existing open issue

**Visual Diff on 3D Scenes**
- Side-by-side or overlay comparison mode between any two named versions
- Color-coded diff: added elements (green), removed elements (red), modified elements (yellow) applied as material overlays in the Three.js renderer
- Filter diff by element category (walls, roofs, structure, MEP)
- Jump-to-change list: ordered list of all changed elements with one-click navigation
- Shareable diff link: "Here is what changed since your last review" — client opens directly to the diff view

**Immersive Review (WebXR)**
- WebXR support in the browser: join a review session in a VR headset via the Meta Quest browser, no separate app required
- 3D spatial comments: issue pins float in 3D space at their exact anchored location, visible in both desktop and VR
- Synchronized navigation in VR: presenter walks through the model, connected clients follow in their respective views
- Accessible via the same share link — no separate VR license or setup

**Offline Review Pack**
- "Download Review Pack": generates a frozen scene snapshot with all open issues as an offline-capable Progressive Web App
- Works on tablet or phone with no internet connectivity — suitable for field site visits, client laptops without reliable wifi
- Annotations made offline sync back to the project when connectivity is restored
- Review Pack expires after configurable time (default 30 days) to prevent stale versions circulating

**Plugin-Powered Review Extensions**
- `CollaboratePlugin` API exposed to the Aruct plugin marketplace:
  - `onIssueCreated(handler)` — plugins receive all new issues for processing
  - `createIssue(params)` — plugins create issues programmatically
  - `addIssueCategory(category)` — plugins extend the category taxonomy
  - `registerReportExporter(name, fn)` — plugins add custom export formats
- Example platform plugin: "Structural Analysis to Issues" — runs a structural check, creates Aruct issues for any violations with element references
- Example platform plugin: "Accessibility Checker" — flags elements against accessibility standards, attaches regulatory references to each issue

**Enterprise Features**
- Advanced audit trail with SOC 2 Type II-ready export format
- Data residency controls: choose EU, US, or APAC storage region per organization
- Custom data retention policies with automated purge schedules
- SCIM provisioning for automated user lifecycle management via enterprise IdP
- On-premise / self-hosted deployment option for regulated clients (government, healthcare, defense)
- Dedicated customer success manager and SLA guarantee for Enterprise tier

---

## Technical Architecture

### Core Architecture Philosophy

Aruct Collaborate is a real-time CRDT-based collaboration layer on top of the existing Aruct scene graph, not a separate application. The project already has Yjs as a dependency (noted in recent commits). The architecture extends the existing packages — core for data, viewer for rendering, editor for UI — with a synchronization layer, a permission model, and an issue tracking service.

### Scene Sharing and Sync

**Recommended stack: Yjs (CRDT) + Hocuspocus WebSocket server**

Yjs provides conflict-free collaborative editing on the scene document with offline-first semantics (changes merge automatically on reconnect) and an awareness protocol for real-time cursor presence. Hocuspocus (the Tiptap Yjs server) handles authentication, persistence, webhooks, and conflict resolution, with PostgreSQL (via Neon — consistent with existing auth/subscription plan) and Redis as storage backends.

Scene version snapshots: serialize the Yjs document to binary at each "publish" event, store in object storage (Cloudflare R2 or AWS S3), record metadata in Postgres.

```
Client Browser <-> WebSocket (Hocuspocus) <-> Yjs Doc (scene state)
                                          |
                                    Postgres (Neon) — issue tracker, members, versions
                                    R2/S3 — scene snapshot binaries
```

### 3D Rendering in Browser

The existing Three.js renderer in packages/viewer is used directly. For Collaborate's review mode:
- Strip editor tools, keep the viewer-only rendering path — use packages/viewer as a read-only embed component injected with the shared scene
- Viewer accepts a `collaborationMode: 'review' | 'edit'` prop — review mode hides all editing tools, shows issue overlay and awareness layer

For IFC import and display:
- Phase 1: **IFC.js / web-ifc-three** — parses IFC in WebAssembly, converts to Three.js geometry client-side. Integrates cleanly with the existing Three.js stack.
- Phase 2 evaluation: **Xeokit SDK** — purpose-built for large BIM models in browser. Handles model sizes that exceed IFC.js limits. Uses a binary XKT format for performance. Evaluate when model size becomes a measurable bottleneck.

For 2D PDF viewing (Phase 1 basic, Phase 2 markup): the project already uses `pdfjs-dist`. Extend this for Phase 1 view-only PDF references. For Phase 2 full markup depth, evaluate **Apryse WebViewer** (industry-standard licensed SDK for web PDF annotation).

### Issue Tracker Data Model

Postgres schema (core tables):

```sql
projects           (id, name, owner_id, created_at)
scene_versions     (id, project_id, yjs_snapshot_key, created_by, created_at, label)
issues             (id, project_id, scene_version_id, element_id, viewpoint_json,
                    title, description, status, priority, category,
                    assignee_id, due_date, created_by, created_at, updated_at)
comments           (id, issue_id, author_id, body_markdown, created_at)
issue_events       (id, issue_id, actor_id, event_type, old_value, new_value, created_at)
share_links        (id, project_id, token, role, password_hash, expires_at, created_at)
project_members    (project_id, user_id, role, invited_at, accepted_at)
```

`viewpoint_json` captures camera position/target/up vectors, selected element IDs, hidden element IDs, and section plane state using the BCF 2.1 viewpoint schema — ensures round-trip fidelity with BCF import/export from day one.

### Real-Time Notifications

- **In-app**: Push from Hocuspocus (or a secondary notification service on the same WebSocket connection) when a new issue, comment, or assignment event occurs. Delivered to all connected project members without polling.
- **Email**: Transactional email via Resend or SendGrid. Queue-based (BullMQ + Redis) for reliability. Debounce digest: max one email per user per 15 minutes per project to prevent spam.
- **Webhooks (Phase 2)**: Project-level webhook endpoints POST event JSON to configured URLs on any issue event, enabling Slack, Teams, Zapier, and custom automation.

### BCF Integration

Implement BCF 2.1 schema using the buildingSMART open specification:
- Issue → BCF Topic; Comment → BCF Comment; Viewpoint → BCF Viewpoint
- Export: generate `.bcfzip` from any filtered issue set
- Import: parse `.bcfzip`, create issues, link viewpoints to Aruct scene elements where GUIDs match
- Phase 2: implement the BCF REST API v3.0 specification for compatibility with ACC, Navisworks, and Revizto as API clients

### Authentication and Multi-Tenancy

Leverage the existing Firebase Auth setup and Neon Postgres (per project memory):
- Firebase Auth: user identity (Google, email/password, SSO via OIDC)
- Neon Postgres with row-level security (RLS): tenant isolation for all collaboration data
- Guest access: signed JWT generated from share link token, containing project_id, share_link_id, and role. Guest comments attributed to "Guest (display name)" in audit trail.

### Version Diffing (Phase 3)

The Aruct scene graph in packages/core is a tree of nodes with stable IDs. Diff algorithm:
1. Deserialize both scene versions from Yjs snapshots
2. Walk both trees simultaneously, matching nodes by stable UUID
3. Classify each node: added, removed, or modified (same ID, different properties)
4. Serialize as a JSON patch document stored alongside the comparison record
5. Apply color overlays in Three.js renderer based on classification

Computationally feasible client-side for typical architecture scenes (thousands to tens of thousands of elements). For very large IFC models, compute server-side and stream the patch.

---

## Integration with Aruct Editor

### packages/core — Scene Graph

- Add `CollaborationMetadata` to the scene graph: stores share link ID, active reviewer count, current version label, open issue count badge
- Extend node schema to include a stable `elementId` (UUID, assigned on creation, immutable across scene edits) — required for issue anchoring to survive model changes
- Emit events on the existing event bus: `scene:published`, `issue:created`, `issue:resolved`, `review:sessionJoined` — Collaborate listens; editor UI reflects state without polling

### packages/viewer — 3D Canvas

- Add `ReviewOverlay` system: renders issue pins as 3D billboard sprites at element positions, color-coded by status (red = open, yellow = in progress, green = resolved)
- Clicking an issue pin opens the issue detail panel, injected via the viewer's children prop from apps/editor (preserving viewer isolation as specified in `wiki/architecture/viewer-isolation.md`)
- Add `AwarenessLayer` system: renders other users' camera positions as colored directional arrows with name labels, driven by Yjs awareness data
- Viewer accepts `collaborationMode: 'review' | 'edit'` prop; review mode hides all edit tools and shows the overlay systems

### apps/editor — Editor UI

- New `CollaboratePanel` in the sidebar: shows issue list, active reviewer avatars, version history with one-click publish
- "Publish for Review" toolbar action: creates a named scene version, generates or updates the share link, copies the link to clipboard, shows a toast confirmation
- "Request Approval" action: triggers the approval workflow on the current named version
- Keyboard shortcut: `I` while an element is selected creates a new issue anchored to that element
- Status bar indicator: shows live collaborator count when in a shared Yjs session
- Notification toast system (already present per recent commits) extended to surface real-time Collaborate events (new comment, issue assigned, approval requested)

### packages/mcp — MCP Server

Extend the MCP server with a `collaborate://` resource namespace:
- `collaborate://project/{id}/issues` — structured list of all issues for AI querying
- `collaborate://project/{id}/versions` — version history with labels and timestamps
- `collaborate://issue/{id}` — full issue detail with comments, viewpoint, and activity log

Add MCP tools for AI agents:
- `create_issue(project_id, element_id, viewpoint, title, description, priority)`
- `update_issue_status(issue_id, status, comment)`
- `get_project_review_summary(project_id)` — returns a structured summary of open/resolved issues by category

This enables Claude (via MCP) to: summarize open issues before a design meeting, create issues from automated analysis, generate design review reports, and flag compliance concerns as structured issues in the project tracker.

### Plugin System

Expose `CollaboratePlugin` API in the existing plugin framework:
- `onIssueCreated(handler)` — plugins receive new issues for processing
- `createIssue(params)` — plugins create issues programmatically from their own analysis
- `addIssueCategory(category)` — plugins extend the category taxonomy
- `registerReportExporter(name, exportFn)` — plugins add custom export formats to the report menu

---

## Pricing Strategy

### Competitor Pricing Reference

| Tool | Model | Entry Price | Mid-Market |
|---|---|---|---|
| ACC (BIM Collaborate) | Per seat, annual | ~$57/user/mo | ~$82/user/mo |
| Bluebeam Revu | Per seat, annual | ~$22/user/mo (Basics) | ~$37/user/mo (Complete) |
| Procore | ACV-based | ~$15K+/yr | ~$30–80K/yr |
| Fieldwire | Per seat, monthly | Free / $39/user/mo | $64/user/mo |
| Trimble Connect | Per seat, monthly | $12.99/user/mo | $23.95/user/mo |
| Revizto | Monthly subscription | ~$350/mo flat | Custom |
| Figma (reference) | Per editor, monthly | $15/editor/mo | $45/editor/mo |

### Recommended Pricing Model

**Philosophy:** Architects and team members who create, edit, and manage reviews pay. Clients and external reviewers are always free. This removes the friction of clients needing to pay and administrators needing to purchase seats for everyone they work with. Modeled on Figma's "editors pay, viewers free" structure, which is the right mental model for design review tools.

| Plan | Price | Who It's For | Key Inclusions |
|---|---|---|---|
| **Free** | $0 | Solo architects, early exploration | 1 project, 3 scene versions, 5 issues, 1 editor, unlimited guest reviewers |
| **Pro** | $19/editor/month (annual) | Individual architects, small studios | Unlimited projects, 50 versions, unlimited issues, 3 editors, unlimited reviewers, PDF export, email notifications, version history |
| **Team** | $39/editor/month (annual) | Architecture firms, project teams | Pro + real-time multiplayer, approval workflows, BCF export, Slack/Teams integration, custom client portal branding, Google SSO, 10 editors |
| **Business** | $69/editor/month (annual) | Mid-size firms, design-build | Team + 2D/PDF markup, advanced audit trail, API access, webhooks, AI issue categorization, unlimited editors |
| **Enterprise** | Custom | Large firms, public agencies | Business + data residency, SCIM, on-premise option, SLA, dedicated CSM |

**Guest/Reviewer seats:** Always free. Reviewers can view, comment, and approve. They cannot create scenes, import models, or access project settings.

**Storage guardrails:** Free: 500MB; Pro: 5GB; Team: 50GB; Business and Enterprise: unlimited.

### Positioning Rationale

- **vs. Bluebeam ($22–37/user/mo, 2D only):** Cheaper at Pro, includes 3D, web-native, no Windows-only constraint.
- **vs. Trimble Connect ($12.99/user/mo, weak UX):** Comparable entry price on Team tier with significantly better issue tracking, UX, and native Aruct integration.
- **vs. ACC (~$57–82/user/mo, enterprise complexity):** Radically simpler, substantially cheaper, no Revit requirement, no reseller negotiation.
- **vs. Figma/Miro (design-agnostic):** Architecturally aware. Buildings are 3D objects with material properties, structural systems, and element identities — not flat images. Win the studios using Figma for design review who feel the pain when clients can't navigate 3D context.

---

## Success Metrics

### Activation (Did users get value?)

| Metric | Definition | Target Month 3 | Target Month 12 |
|---|---|---|---|
| Share link created within 7 days of signup | % of new users who publish a scene for review | >40% | >60% |
| Client opens shared link | % of share links with at least 1 guest view | >50% | >65% |
| First comment within 48h of link creation | % of shared projects receiving reviewer feedback | >35% | >55% |
| Issue created in first session | % of active projects with at least 1 issue | >30% | >50% |

### Engagement (Are they using it regularly?)

| Metric | Definition | Target Month 6 |
|---|---|---|
| Weekly Active Projects | Projects with at least 1 event per week | Growing MoM |
| Issues created per project per month | Depth of use | >10 per active project |
| Guest reviewer return rate | % of guests who return to the same project | >40% |
| Comment-to-resolution time | Median time from issue open to resolved | <7 days |
| Version publish frequency | Average versions per project per month | >3 |

### Retention

| Metric | Definition | Target |
|---|---|---|
| 30-day retention (editors) | % of paying editors active in month 2 | >65% |
| 90-day retention | % still active in month 4 | >50% |
| Multi-project users | % of users with more than 1 active project | >60% by Month 6 |
| Project completion rate | % of projects reaching an "approved" version | >40% |

### Revenue

| Metric | Definition | Target Year 1 |
|---|---|---|
| MRR growth | Month-over-month MRR increase | >15% MoM for first 6 months |
| Free-to-Pro conversion | % of Free users upgrading within 90 days | >8% |
| Pro-to-Team conversion | % of Pro upgrading to Team | >20% |
| ARPU (blended) | MRR divided by paying editors | >$35/editor/month |
| Monthly churn | Paying editor churn per month | <3% |
| NRR | Net Revenue Retention from existing customers | >110% |

### Product Quality

| Metric | Target |
|---|---|
| Share link load time, 3D scene, P95 | <4 seconds |
| Comment-to-visible latency in multiplayer | <300ms |
| Mobile session completion rate | >70% |
| Uptime | >99.9% |
| Issue export success rate | >99.5% |

### North Star Metric

**Issues resolved per active project per month.** This is the single number that proves the product is embedded in actual project workflows. A high and growing number indicates: teams are using the feedback loop, design decisions are being made and documented with attribution, and Aruct Collaborate is part of the workflow rather than a peripheral tool.

### Market Position Metrics (Year 2+)

- Win rate vs. Bluebeam: % of competitive deals won when Bluebeam is the incumbent tool
- Guest-to-paid conversion: % of guest reviewers who later sign up as paying editors — the viral loop metric
- BCF import volume: indicates usage by teams replacing Navisworks/ACC coordination workflows
- Integration usage: % of Team+ accounts with at least one external integration (Slack, BCF, webhook) active — measures workflow stickiness

---

## Implementation Timeline

### Month 1–2: Foundation

- Extend packages/core node schema: add stable `elementId` UUID to all node types; add `CollaborationMetadata` node; emit collaboration events on the event bus
- Set up Hocuspocus WebSocket server on Neon Postgres and Cloudflare R2
- Implement share link system: token generation, role assignment, guest JWT issuance, Firebase Auth integration for guest identity
- Implement scene version snapshot: serialize Yjs doc to binary on publish, store in R2, record metadata in Postgres
- Build basic issue tracker backend: Postgres schema, CRUD API for issues, comments, and issue events

**Milestone:** An internal team member can publish a scene, generate a share link, open it in a browser with no login, and see the scene load.

### Month 3–4: Core Review Loop

- Implement comment system in packages/viewer: click element to anchor comment, render comment pins as billboard sprites, open comment thread panel
- Build issue promotion UI in apps/editor: promote any comment to an issue with title, status, assignee, priority, category, due date
- Build issue list view with filter and sort in the CollaboratePanel sidebar
- Implement email notifications: BullMQ + Resend/SendGrid, debounced digest
- Implement audit trail: immutable event log with CSV/PDF export
- Build PDF report export: viewpoint screenshots + comment metadata per issue

**Milestone:** A client can open a share link, drop a comment on a wall element, the architect sees it in the CollaboratePanel, promotes it to an issue, assigns it, and exports a PDF report of open issues.

### Month 5–6: Version History and Diff

- Implement named version history UI: version list, version comparison trigger
- Build 3D diff algorithm: walk scene trees by stable element ID, classify changes, apply color overlays in Three.js renderer
- Implement version restore
- IFC import integration using web-ifc-three
- MVP audit trail export and read-only HTML report generation

**Milestone:** Phase 1 complete. All features in the Phase 1 feature set are working end-to-end. Begin beta with 5–10 architecture studios.

### Month 7–9: Multiplayer and Approvals

- Implement Yjs awareness layer in packages/viewer: render other users' camera positions as colored arrows with name labels
- Real-time cursor presence: colored cursor overlays for all active users
- "Follow me" presenter mode: camera synchronization from presenter to followers
- Approval workflow backend: approval chain definition, approver notification, approval record with timestamp
- Begin 2D/3D linked view: PDF sheet upload, element-to-sheet cross-reference

**Milestone:** A live design review session works with multiple concurrent participants seeing each other's cursors and a presenter driving a walkthrough. Approval workflow creates a timestamped record.

### Month 10–12: BCF, Integrations, and Client Portal

- BCF 2.1 export/import implementation
- Slack and Microsoft Teams webhook integrations
- Zapier/Make outbound webhooks
- Email-to-issue reply parsing
- Client portal: custom branding, simplified client UI, domain allowlist
- SSO via Google Workspace and Microsoft Entra
- DWG import as reference geometry layer

**Milestone:** Phase 2 complete. A BCF-based round-trip with Navisworks works. A client portal with custom branding is live. Begin outbound sales targeting Bluebeam and Trimble Connect users.

### Month 13–15: AI and Advanced Diff

- AI issue categorization: integrate LLM classification on new comment creation
- AI session summary: generate pre-meeting briefing from open issue set
- Visual 3D diff UI: side-by-side comparison mode, jump-to-change list, shareable diff link
- AI clash pre-screening integration
- MCP resource namespace: `collaborate://` resources and AI agent tools

### Month 16–18: Immersive and Offline

- WebXR review session: Meta Quest browser support, spatial comment pins in VR
- Offline Review Pack: frozen scene + issues as offline-capable PWA, sync-on-reconnect
- Plugin CollaboratePlugin API: documented and available in plugin marketplace
- Enterprise features: data residency controls, SCIM provisioning, SOC 2 audit trail export, on-premise deployment documentation

**Milestone:** Phase 3 complete. All differentiation features available. Begin Enterprise tier sales with dedicated CSM capacity.

---

## Sources

- Verified Market Reports: Construction Collaboration Software Market, AEC Software Market
- Constructable: ACC Reviews, Pricing & Alternatives
- Follow Up CRM: Bluebeam vs Procore comparison
- Remote AE: BIM 360 vs Procore vs Bluebeam analysis
- SelectHub: Navisworks vs Trimble Connect feature comparison
- Gendo AI: Multiplayer Canvas for Architects — Figma vs Miro analysis for AEC
- Revizto: Bluebeam Alternatives overview
- RFP Wiki: Bluebeam Revu vs Fieldwire
- Snaptrude: Best BIM Collaboration Tools 2026
- Apryse: WebViewer BIM release notes
- Projul: Procore Pricing Analysis 2026
- BIMcollab: BCF Explained (buildingSMART open standard)
- buildingSMART BCF REST API specification (GitHub)
- Saasworthy: Trimble Connect Pricing
