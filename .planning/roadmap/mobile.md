# Aruct Mobile: Market Research & Implementation Roadmap

> Design on the go

## Executive Summary

The AEC software market sits at $10.23 billion in 2024 and is growing at 8.6% CAGR toward $19.79 billion by 2032. Within that, the BIM software segment alone reached $7.95 billion in 2024 and is projected to hit $15.42 billion by 2030 at 11–15.6% CAGR. Mobile BIM adoption among contractors rose 52% in recent years, with field teams reporting a 12% productivity gain from mobile tools. 74% of U.S. contractors and ~70% of U.S. architects now use BIM in some form. The market is large, growing fast, and the mobile segment is accelerating even faster than the desktop segment.

Aruct Mobile's opportunity is not to become another field viewer or another sketching app. It is to close the loop that every existing competitor leaves open: capture real geometry on site, sketch a design intent over it, and sync that work bidirectionally to a parametric 3D scene graph. Morpholio Trace owns architectural sketching but is Apple-only and has no live sync to a 3D model. Matterport owns capture but delivers static virtual tours, not live project data. Fieldwire owns field coordination but has no design capability. BIMx owns BIM viewing but is hard-locked to Archicad and has no capture. No tool in the market closes the full loop — and that loop is precisely Aruct's core desktop proposition extended to the field.

The recommended approach is a phased native iOS build paired with a PWA baseline for Android and cross-platform access. Phase 1 (months 1–6) establishes the core capture→sketch→sync loop as an MVP, gated by five or more architects completing the full workflow in a beta. Phase 2 (months 7–12) reaches competitive parity with Morpholio Trace and Fieldwire, adds Android native, and enables real-time collaboration. Phase 3 (months 13–18+) widens the moat with AI-assisted scan-to-model, 3D AR sketching, and a mobile plugin API that mirrors the Aruct marketplace. The Yjs CRDT infrastructure already in the Aruct editor, the MCP plugin architecture, and the IFC/DWG import pipeline in the recent commits mean the integration cost is lower than it would be for any competitor building from scratch.

---

## Market Overview

### Market Size and Growth

| Segment | 2024 Value | 2030/2032 Projection | CAGR |
|---|---|---|---|
| BIM Software (broad) | $7.95 billion | $15.42 billion (2030) | 11–15.6% |
| BIM Software (pure software) | $4.17 billion | — | — |
| AEC Software (broader) | $10.23 billion | $19.79 billion (2032) | 8.6% |

### Geographic Distribution

- Europe leads BIM software spend at ~35% of global market
- North America accounts for ~30%
- Asia-Pacific is the fastest-growing region
- Near-universal BIM adoption expected in developed markets by 2030

### Mobile-Specific Dynamics

- Mobile BIM adoption among contractors rose 52% in recent years
- Field teams using mobile tools report 12% productivity gains
- 74% of U.S. contractors now use BIM in some form
- ~70% of U.S. architects and engineers use BIM tools
- iPhone Pro LiDAR available from iPhone 12 Pro onward (2020), enabling consumer-grade room scanning
- Apple RoomPlan API released in iOS 16 (2022) — direct on-device room geometry detection with wall, door, and window classification
- The LiDAR scanning and AR measurement sub-segment is the fastest-moving niche in mobile AEC

### Primary User Segments

**Field Architects / Design Architects**: Need to capture as-built conditions on site, sketch early design intent, and push geometry to desktop authoring tools. This is Aruct Mobile's primary target.

**Interior Designers**: Room scanning, mood boards, furniture placement in AR, client presentation. Secondary target with high overlap.

**BIM Managers / Coordinators**: Model review, BCF issue creation, clash coordination on site. High-value secondary audience reached in Phase 2.

**General Contractors / Site Supervisors**: Plan viewing, punch lists, RFIs, daily logs, photo documentation. Reachable via Team tier features.

**Remodelers / Specialty Contractors**: Rapid room dimensioning, estimating from scans, before/after documentation. Adjacent market; useful for differentiation but not primary focus.

---

## Competitor Analysis

### BIMx (Graphisoft)

**Platform:** iOS, Android, Windows, macOS, Web

**Pricing:** Free viewer (Graphisoft account required); Pro features require a paid Graphisoft/Archicad subscription — not sold as a standalone mobile product

**Strengths:**
- Hyper-model linkage: 3D navigation connected to exact 2D sheet set — unique in the market
- BCF-compliant issue creation natively integrated
- Offline-first: model downloaded to device, no connectivity required for navigation
- Works across all major platforms including Android and desktop
- Apple Vision Pro support added recently
- Interactive BIM data labels (tap any element to see properties)

**Weaknesses:**
- Hard lock to Archicad: useless outside Archicad projects
- No capture or scanning capability — view only, no LiDAR input
- No sketching or concept design tools whatsoever
- Collaboration is asynchronous (BCF export/import), not real-time
- No IFC import from non-Archicad tools
- UI feels dated compared to newer entrants

**Key differentiators:**
- Hyper-model (3D ↔ 2D sheet linkage) is genuinely unique and unmatched
- BCF issue workflow is the most native of any mobile viewer
- Deepest BIM data exposure on mobile (element properties, layers, spatial filtering)

---

### Morpholio Trace

**Platform:** iOS and iPadOS only — no Android, no Web, no desktop

**Pricing:**
- Free: up to 5 projects, basic pens/layers/scale
- Plus: ~$9.99/year (20 projects, stencils, PDF markup)
- Pro: ~$24.99/year or $7.99/month (unlimited projects, perspective/AR tools, Smart Fill)
- Education: 75% discount on annual Pro
- Business: custom via Vectorworks portal

**Strengths:**
- Purpose-built for architects — the only tool that truly feels made for design professionals in the field
- Instant Scale tool: set a real-world dimension and all drawing stays measurable
- LiDAR RoomPlan integration: scan a room, get a scaled floor plan underlay to sketch over
- Apple Pencil support including Pencil Pro (pressure, tilt, squeeze, barrel-roll)
- DXF vector export compatible with AutoCAD, Revit, Rhino, SketchUp, Archicad
- Used by Zaha Hadid Architects, SO-IL, Rogers Stirk Harbour + Partners
- Scale stencils (furniture, figures, landscape)
- Smart area calculation (Smart Hatch / Smart Fill)
- Vectorworks partnership for Business tier

**Weaknesses:**
- Apple-only: entire Android market excluded — a major addressable gap
- No live multi-user co-editing
- Purely 2D: no 3D modeling or 3D scene sync
- No project management or site coordination features
- No BIM model import (only image underlays from OBJ/STL snapshots)
- LiDAR capture is used only as an underlay — geometry does not sync anywhere

**Key differentiators:**
- Measured drawing with professional-grade CAD export at a consumer-friendly price
- LiDAR scan-to-underlay for on-site sketching over real geometry is the closest existing competitor behavior to Aruct's Phase 1 goal — but without the sync

---

### AutoCAD Mobile

**Platform:** iOS and Android

**Pricing:** $9.99/month or $99.99/year; free with AutoCAD or AutoCAD LT subscription; 30-day trial

**Strengths:**
- The definitive DWG tool on mobile — no competitor breaks the DWG chain as cleanly
- Full offline mode: edit without connectivity, sync on reconnect
- Cloud sync across Autodesk Drive, Docs, OneDrive, Box, Dropbox, Google Drive
- Layer management and geometry editing
- Android support

**Weaknesses:**
- 2D only: no 3D BIM viewing whatsoever
- No LiDAR or AR capture
- No sketching or design tools (editing existing drawings, not creating new ones)
- Purely DWG-centric: no IFC, no Revit native support
- UI is functional but not modern
- No real-time collaboration on mobile

**Key differentiators:**
- DWG file fidelity is unmatched — if your workflow is AutoCAD, nothing else comes close
- Autodesk ecosystem lock-in as both moat and limitation

---

### Planner 5D

**Platform:** iOS, Android, Web, desktop

**Pricing:**
- Free: unlimited projects, half the catalog
- Premium: $4.99/month (annually) or $19.99/month
- Professional: $33.33/month (annually) or $49.99/month

**Strengths:**
- Most accessible design experience: zero learning curve for clients and non-professionals
- 10,000+ furniture/fixture catalog
- AI Design Generator (layout suggestions from photo or text prompt)
- 4K renders and 360° walkthroughs at Pro tier
- Multi-platform including Android and Web
- Apple Pencil support and Apple Vision Pro support
- Budget widget built in

**Weaknesses:**
- Consumer-grade accuracy: not suitable for professional documentation
- No BIM interoperability: no IFC, no DWG round-trip
- No LiDAR scan input
- No site coordination or field management features
- Not usable for construction documentation

**Key differentiators:**
- AI layout generation ahead of competitors in its price tier
- Largest furniture catalog in the consumer/prosumer segment
- Best option for client-facing presentations that require zero AEC knowledge from the client

---

### Canvas Measure (formerly Structure Sensor)

**Platform:** iOS / iPadOS only — LiDAR device required

**Pricing:** Free base (2 scans/month); Scan-to-CAD professional conversion is a per-project paid service (pricing not publicly listed, contact for quote); conversion delivered in 1–2 days via human drafters

**Strengths:**
- iPhone/iPad Pro LiDAR capture with auto-detection of walls, doors, windows
- 2D floor plan extraction from scan
- Scan-to-CAD human review service delivers professional-grade output when raw LiDAR accuracy is insufficient
- On-device measurement and annotation before sync

**Weaknesses:**
- iOS/LiDAR only: excludes Android and non-Pro iPhones
- Service model for professional output means 1–2 day turnaround — not real-time
- No design or sketch tools
- No project management
- No real-time sync with any desktop authoring tool
- Limited to interior spaces

**Key differentiators:**
- Human-in-the-loop Scan-to-CAD service is unique — highest-quality as-built output available from any mobile app when professional drafting is applied
- Best standalone LiDAR scan accuracy in controlled conditions

---

### Houzz Pro

**Platform:** iOS and Android (mobile); Web (full desktop)

**Pricing:**
- Starter: $59/month
- Houzz Pro Plus: $299/month
- Houzz Pro Platinum: $3,000/year (~$250/month)

**Strengths:**
- Only tool combining LiDAR scan + AR design + full business CRM + invoicing in one product
- AR walkthrough: project 3D design into the real client space
- Full project management: tasks, schedules, daily logs
- CRM: lead management, client messaging, mobile document signing
- Estimates, proposals, invoices, online payments, change orders
- 65M homeowners on Houzz platform creates a lead generation flywheel for professionals

**Weaknesses:**
- Not architect/BIM-grade: designed for remodelers and interior designers, not AEC professionals
- No IFC/DWG import or export
- No BIM model viewing
- Expensive for small practices ($59/month minimum)
- LiDAR accuracy sufficient for remodeling estimation but not construction documentation
- No offline mode for plan documents — connectivity-dependent for most features

**Key differentiators:**
- Houzz marketplace distribution moat: 65M homeowners is a business development channel competitors cannot replicate
- All-in-one business platform (CRM + design + invoicing) — no other competitor combines these

---

### Matterport Capture

**Platform:** iOS (capture); Web (hosting and viewing); iOS/Android (viewing)

**Pricing:**
- Free: 1 active space
- Starter: $144/year — 5–20 active spaces, 3 users
- Professional: $696/year — 20–150 active spaces, 10 users
- Business: $3,552/year — 100–300 spaces, 50 users
- Enterprise: custom
- Add-ons: floor plans, point clouds, videos (+$50–150 each)

**Strengths:**
- Best-in-class for complete 3D virtual tour production
- IFC and RVT export connects to professional BIM workflows
- Procore and Autodesk (BIM 360, Forma) integrations — de facto choice for construction digital twins
- Point cloud export (E57, XYZ) for professional workflows
- Multiple capture hardware options (iPhone, dedicated Matterport camera, Leica BLK360, 360 cameras)
- Free Revit plugin

**Weaknesses:**
- Capture is slow and deliberate — not suited for quick on-site sketching or rapid field visits
- Expensive at scale: per-space model adds up quickly on large portfolios
- Real estate marketing origin means UX is not optimized for construction workflows
- No sketch or design tools
- iOS capture only (LiDAR path)
- No real-time collaboration on the capture side

**Key differentiators:**
- IFC and RVT export with Procore/Autodesk integrations is unmatched for professional as-built documentation
- Multiple hardware options including high-end Leica scanner integration

---

### Fieldwire

**Platform:** iOS, Android, Web

**Pricing:**
- Free: 5 users, 3 projects
- Pro: $39/user/month (billed annually)
- Business: $59/user/month
- Business Plus: $89/user/month

**Strengths:**
- Best field-side UX for task management pinned to plan locations
- Offline-first design is genuinely reliable — tested in dead-zone job sites
- IFC model viewer support
- Independent of Autodesk/Procore lock-in
- API-open for custom integrations
- Per-seat pricing is accessible for smaller crews

**Weaknesses:**
- No design or sketch tools
- No LiDAR/AR capture
- No BIM authoring — coordination and field use only
- Less rich than Procore/Autodesk Build for office-side workflows
- Per-seat pricing escalates with large crews

**Key differentiators:**
- Offline-first reliability is the most field-tested of any coordination tool
- API openness enables custom integrations that Autodesk Build locks down

---

### Roomle

**Platform:** Web, iOS, Android, Windows, Mac

**Pricing:**
- Basic Configurator: €850/month or €8,500/year
- Full Logic Configurator: €1,450/month or €14,500/year
- Enterprise: custom

**Strengths:**
- Rule-based configurator engine is best-in-class for modular/parametric product configuration
- Strong enterprise B2B play for furniture and fitout manufacturers
- Real-time pricing logic for every configuration permutation
- Bill of materials generation

**Weaknesses:**
- Not an AEC tool: designed for retail furniture, not construction
- No LiDAR capture
- No BIM export or IFC support
- No construction documentation or field coordination
- Mobile experience lags behind Planner 5D

**Key differentiators:**
- Rule-based configurator logic is unique — no other mobile tool does parametric product configuration with real-time pricing

---

## Feature Comparison Matrix

| Feature | BIMx (Graphisoft) | Morpholio Trace | AutoCAD Mobile | Planner 5D | Fieldwire | Matterport | Aruct Mobile (Proposed) |
|---|---|---|---|---|---|---|---|
| LiDAR room capture | ✗ | Partial (underlay only) | ✗ | ✗ | ✗ | ✓ (iOS) | ✓ Phase 1 (iOS) |
| AR measurement | ✗ | Partial | ✗ | ✗ | ✗ | ✗ | ✓ Phase 2 |
| Measured sketch/drawing | ✗ | ✓ | Partial | ✗ | ✗ | ✗ | ✓ Phase 1 |
| 3D model viewing | ✓ | ✗ | ✗ | ✓ | Partial (IFC) | ✓ | ✓ Phase 2 |
| BIM / IFC support | ✓ (Archicad only) | ✗ | ✗ | ✗ | ✓ (view) | ✓ | ✓ Phase 2 |
| Offline-first | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ Phase 1 |
| Real-time collaboration | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 2 |
| Sketch / concept design | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ Phase 1 |
| Site coordination / tasks | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ Phase 2 (BCF) |
| DXF / DWG export | ✗ | ✓ | ✓ | Partial | ✗ | ✓ | ✓ Phase 1 |
| IFC export | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ Phase 2 |
| Android support | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ (view) | PWA Phase 1 / Native Phase 2 |
| Bidirectional scene sync | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 1 |
| BCF issue workflow | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 2 |
| AI scan-to-model | ✗ | ✗ | ✗ | Partial (layout only) | ✗ | ✗ | ✓ Phase 3 |
| Point cloud export | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ Phase 3 |
| Plugin / extension API | ✗ | ✗ | ✗ | ✗ | API (server-side) | API (server-side) | ✓ Phase 3 |
| AR scene overlay | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 3 |

---

## Recommended Feature Set for Aruct Mobile

### Phase 1: MVP (Months 1–6)

**Goal**: Prove the core loop — capture real geometry on site, sketch a design intent over it, sync bidirectionally to an Aruct desktop project. Gate on five or more architects completing the full workflow in beta.

**Scene Sync Core**
- Read/write the Aruct project format (JSON scene graph via MCP server API)
- Open recent projects, view scene in 2D plan view on device
- Offline-first: full project cached locally, syncs on reconnect
- Conflict resolution: CRDT via Yjs for concurrent edits; last-write-wins for single-author non-collaborative edits; sync status indicator always visible

**LiDAR Capture (iOS)**
- iPhone Pro / iPad Pro LiDAR scan using Apple RoomPlan API (iOS 16+)
- Auto-detection of walls, doors, windows, floor boundary
- Captured room geometry pushed directly into Aruct scene as a new room node
- On-device dimension review and annotation before sync
- Graceful fallback for non-LiDAR devices: manual tape-measure dimension input with voice-to-number conversion

**Sketch Layer**
- Digital trace paper over captured floor plan or loaded PDF/image underlay
- Scale-aware drawing: set a known dimension, all drawing stays measurable and exportable
- Freehand and straight-line tools; eraser; color and weight picker
- Finger-first UX with Apple Pencil enhancement (no Pencil dependency)
- Sketch exports as SVG or PNG; syncable as overlay node to desktop editor

**Plan Viewer**
- Load PDF plans from Aruct project or local storage (iOS Files app)
- Markup and annotation: arrows, text, area highlights, revision clouds
- Photo pin: attach site photo to a location on the plan
- Offline: PDFs cached on device; changes sync on reconnect

**Project Shell**
- Project list with sync status indicator (synced / pending / conflict)
- Create new project (from LiDAR scan or blank canvas)
- Invite collaborators via link (join in viewer mode initially)
- Auth via Firebase Auth (matching the existing auth plan)

**Export**
- DXF/DWG export of captured floor plan geometry
- PDF export of annotated plan
- PNG/SVG export of sketch overlay

**Platform**: iOS native (Swift/SwiftUI) for LiDAR; PWA (Next.js/Vite) with offline capability for Android and cross-platform access to all non-LiDAR features

**Success Gate**: 100 architects (beta) complete scan→sketch→sync→desktop within one workflow session; average sync time under 10 seconds on WiFi; app crash rate below 0.1%.

---

### Phase 2: Growth (Months 7–12)

**Goal**: Reach feature parity with the best of Morpholio Trace and Fieldwire; bring Android to full parity; enable real-time collaboration.

**AR Measurement**
- ARKit/ARCore point-to-point measurement overlay
- Tap two surfaces to get distance; tap floor to get room height
- Works on all modern phones — no LiDAR required (depth estimation on non-LiDAR devices)
- Results storable as dimension annotations on the active plan

**Android Native App**
- Full-featured Android app using Jetpack Compose
- Shared TypeScript sync engine (same REST/WebSocket backend as iOS)
- AR measurement via ARCore (photogrammetry-based depth on non-LiDAR Android devices)
- All Phase 1 sketch and plan features at full parity

**Real-Time Collaboration**
- Live cursors: see collaborators' positions on plan view in real time
- Real-time sketch sharing via Yjs CRDT (same infrastructure as the Aruct editor)
- Comment threads anchored to plan locations (replaces BCF for Aruct-native projects)
- Presence indicators: who is on site, who is in the office

**3D Viewer**
- IFC model viewer on device using web-ifc (WebAssembly) in a WKWebView/WebView
- Load IFC exported from Aruct desktop; navigate 3D on site
- Element tap: show properties and associated Aruct node data
- Basic measurement in 3D view (point-to-point, height)

**BIM Issue Workflow**
- BCF-compatible issue creation: photo + location pin + description + assignee
- BCF export for handoff to Archicad, Revit, or any BCF-compatible tool
- Issue status tracking: open / in review / closed
- Issues visible as overlays on plan view and in 3D viewer

**Advanced Sketch**
- Scale stencils pulled from Aruct's node library (furniture, fixtures, structural elements)
- Layers panel: show/hide and reorder sketch layers
- Smart area calculation from closed polylines

**Sync Robustness**
- Background sync queue with retry logic (Background Sync API on PWA; URLSession background tasks on iOS/Android)
- Conflict UI: when auto-merge cannot resolve, show diff and let the user pick
- Delta compression via Yjs's built-in delta updates — only changed bytes transmitted, not full documents
- Cellular-friendly sync: HTTP long-poll or SSE transport option alongside WebSocket

---

### Phase 3: Leadership (Months 13–18+)

**Goal**: Create sustainable differentiation that no competitor can replicate without rebuilding their core architecture.

**AI-Powered Capture**
- Auto-label rooms from LiDAR scan using on-device ML (Core ML on iOS): living room, bedroom, bathroom, etc.
- Suggest Aruct room nodes to create from scan geometry — user reviews and accepts/rejects each
- Dimension anomaly detection: flag walls that are not square or parallel before sync
- Photo-to-sketch: extract rough linework from a site photo via vision model, drop as sketch underlay

**3D Sketch in AR**
- Sketch in 3D space over the physical site using ARKit / ARCore
- Place Aruct-library objects (walls, doors, windows, furniture) in AR with correct scale
- AR preview of the Aruct scene model in real-world context (scene graph anchored to the physical space via ARKit world anchors)

**LiDAR Point Cloud**
- Full point cloud capture and export (E57 / XYZ) for professional workflows
- Point cloud sync to Aruct project for desktop registration
- Competing with Matterport on LiDAR accuracy at a fraction of the per-space cost

**Voice-First Dimension Input**
- "Three meters forty" → auto-converted to dimension annotation
- Voice-driven site log: "Beam height at column C4 is two point eight" → logged to project

**Scan-to-Model AI**
- LiDAR scan → AI-generated Aruct scene graph proposal (rooms, walls, openings mapped to core node types)
- User reviews and accepts/rejects detected elements before committing to the scene
- Closes the loop between as-built capture and parametric model authoring

**Offline-First Plugin API**
- Allow Aruct marketplace plugins to register mobile UI panels via their manifest
- Mobile-specific MCP transport (HTTP long-poll or SSE) for cellular-friendly plugin operations
- Plugins that work via MCP tool calls automatically work on mobile without code changes

**Apple Vision Pro**
- Spatial computing view of Aruct scene for design review in immersive context
- Sketch in 3D space via Vision Pro hand tracking
- Long-term positioning for AR glasses when the hardware matures

---

## Technical Architecture

### Platform Decision

**iOS native (Swift/SwiftUI) for LiDAR-heavy features + PWA/WebView for cross-platform baseline.**

LiDAR and RoomPlan API are Apple-only and require native iOS for full capability. This cannot be replicated in a WebView. Apple Pencil precision and pressure data require native UIKit event handling. ARKit spatial anchoring for Phase 3 AR requires native. However, 60–80% of features — plan viewing, sketch, sync, 3D viewer — can be delivered in a WebView shell or PWA and should be, to reduce duplication. Android parity in Phase 2 is achieved via React Native or Flutter with native modules for ARCore, sharing the TypeScript sync core.

### Recommended Stack

**iOS native**
- SwiftUI + UIKit where event handling demands it
- RoomPlan API for LiDAR capture
- ARKit for measurement and AR features (Phase 2/3)
- Core ML for Phase 3 AI (on-device, no server round-trip for labeling)
- Metal for real-time LiDAR point cloud display during scanning
- WKWebView host for shared JS rendering (3D viewer, sketch canvas)

**Android (Phase 2)**
- Jetpack Compose with shared TypeScript sync core via React Native or Flutter
- ARCore for AR measurement (photogrammetry depth on non-LiDAR devices)

**Web / PWA**
- Next.js or Vite for progressive web app
- Offline via Service Worker and IndexedDB
- Immediate cross-platform access for Android and all non-LiDAR features without app store friction

**Shared TypeScript core**
- Sync engine, conflict resolution, project serialization
- Yjs CRDT document model (shared with the Aruct editor)
- MCP client for scene mutations

### Sync Architecture

The Aruct editor already uses Yjs (confirmed in `packages/core`). Extend the same Yjs document model to mobile:

- Each Aruct project = one Yjs document
- Yjs handles concurrent edits with mathematical convergence — no manual conflict code for most cases
- `y-websocket` provider for real-time sync when online
- IndexedDB via idb/Dexie for offline persistence on PWA
- SQLite via Core Data or MMKV for offline persistence on native iOS/Android
- Background sync queue for pushes when the app comes online

**Conflict resolution by data type:**

| Data Type | Strategy |
|---|---|
| Scene graph structure (add/move/delete nodes) | Yjs Y.Map + Y.Array — automatic CRDT |
| Sketch layers | Yjs Y.Array of stroke objects — automatic CRDT |
| Dimensions / annotations | Field-level merge; same field → timestamp wins with user notification |
| Issue status | Last-write-wins (single-owner, low-stakes) |
| LiDAR scan geometry | Push-only (single-author capture; no conflicts possible) |

### 3D Rendering on Mobile

- **IFC viewing**: web-ifc (WebAssembly) in a WKWebView — reuses Aruct's existing renderer approach, no native 3D library needed
- **AR capture preview**: Metal (iOS) for real-time LiDAR point cloud display during scanning
- **Scene preview**: Aruct `packages/viewer` (Three.js) runs in a WKWebView with reduced polygon budgets — target 30fps on iPhone 12+; disable SSAO, bloom, and expensive post-processing; use ASTC compressed textures

### LiDAR Integration Flow

```
Apple RoomPlan API (iOS 16+, LiDAR device required)
  → CapturedRoom object (walls, doors, windows, floors, objects with dimensions)
  → Convert to Aruct room node schema (packages/core node-schemas.md)
  → Push to Yjs document as new room nodes
  → y-websocket propagates to desktop editor in real time (or queues for offline sync)
```

For non-LiDAR devices: ARKit plane detection (all modern iPhones) for basic floor detection + manual dimension input.

### Offline Storage Budget

| Asset Type | Size Range |
|---|---|
| One Aruct project (scene graph + thumbnails) | 2–50 MB |
| PDF plan set | 20–200 MB per project |
| LiDAR scan point cloud | 50–500 MB |

Recommended on-device storage budget: 2 GB per app. LRU eviction for projects not accessed in 30 days (user-configurable). Large PDF sets use on-demand page streaming with prefetch of the current and adjacent pages.

### Security

- All sync over TLS; Yjs documents encrypted at rest in cloud storage
- Auth: Firebase Auth (matching the existing auth plan) — JWT tokens for WebSocket upgrade
- LiDAR scan data: stored only in the user's cloud storage; not sent to Aruct servers beyond the project sync delta
- Camera and microphone permissions: requested only at the point of use; no background camera access

---

## Integration with Aruct Editor

### Scene Graph Sync

Mobile reads and writes the same Aruct scene graph as the desktop editor. Integration points:

1. **Yjs shared document**: Aruct project opens as a Yjs document. Mobile joins as a Yjs client — gets the same CRDT document, can mutate it, and changes propagate to desktop in real time when both are online.

2. **MCP tools for mobile-native operations**: The MCP server in `packages/mcp` is the right sync backbone. Add:
   - `captureScan(roomPlanData)` — creates room nodes from LiDAR RoomPlan output
   - `pushSketchLayer(svgData, floorId)` — attaches sketch as an overlay node to the correct floor
   - `createIssue(location, photo, description)` — creates BCF-compatible issue linked to scene node
   - `syncOfflineChanges(deltaYjsUpdate)` — pushes queued offline mutations on reconnect

3. **Node schema compatibility**: LiDAR-detected rooms map to Aruct's room node schema (`packages/core/node-schemas.md`). RoomPlan's walls, doors, and windows map directly to Aruct's wall and opening node types — no translation layer needed at the domain level.

### Viewer Package

The `packages/viewer` Three.js viewer can run in a WKWebView on iOS with these constraints:
- Reduce polygon count for mobile GPU budgets
- Disable SSAO, bloom, and expensive post-processing passes
- Use ASTC compressed textures on iOS
- Target 30fps instead of 60fps
- Mobile-specific camera controls: pinch-to-zoom, pan, two-finger orbit

The viewer is already isolated from editor concerns per the architecture docs. Mobile can embed `<Viewer>` with read-only props and a mobile-optimized camera controller without touching editor internals — this is the correct use per the layer boundary rules in `wiki/architecture/viewer-isolation.md`.

### PDF / DWG / IFC Import

The existing IFC/DWG/PDF import pipeline in the editor (confirmed in recent commits) has corresponding mobile entry points:
- **PDF**: load from iOS Files app or Google Drive; render via PDF.js in WebView
- **DWG**: send to server for conversion (same server-side pipeline as desktop); download processed result
- **IFC**: stream-parse via web-ifc WASM in WebView; same approach as desktop

### Plugin System (Phase 3)

Phase 3 exposes the Aruct plugin marketplace to mobile. Mobile plugins register a `mobilePanel` component in their manifest. The MCP plugin API is transport-agnostic — plugins that work via MCP tool calls automatically work on mobile without code changes, as long as the mobile client implements the same MCP client interface. Add HTTP long-poll or SSE transport to `packages/mcp` for cellular-friendly operation.

---

## Pricing Strategy

### Competitor Pricing Reference

| Tool | Entry | Mid | High | Model |
|---|---|---|---|---|
| Morpholio Trace | Free | $7.99/mo (Pro) | $7.99/mo | Freemium, per-user |
| AutoCAD Mobile | $9.99/mo | — | Bundled w/ AutoCAD | Per-seat or bundled |
| Planner 5D | Free | $4.99/mo | $49.99/mo | Freemium, per-user |
| Canvas | Free (2 scans) | — | Per-project service | Freemium + per-use |
| Houzz Pro | $59/mo | $299/mo | $250/mo (Platinum) | Per-seat, all-in-one |
| Fieldwire | Free (5 users) | $39/user/mo | $89/user/mo | Per-seat, tiered |
| Matterport | $14/mo | $58/mo | $296/mo | Per-space hosted |

### Recommended Pricing

**Principle**: Aruct Mobile is a multiplier on Aruct Pro and Team subscriptions, not a standalone revenue line. Price to remove friction, not to extract rent. Industry standard is to include mobile with desktop subscription — Autodesk, Fieldwire, and Houzz Pro all do this.

**Aruct Free** (existing desktop tier)
- Mobile: view-only access to shared projects; PDF viewing; read-only sync
- No scan, no sketch, no export
- Goal: let clients and contractors view Aruct projects on site without requiring a paid seat — expands distribution

**Aruct Pro** (~$29–49/month, to be confirmed against auth/subscription plan)
- Mobile: full feature set — scan, sketch, offline, sync, export
- Up to 10 projects cached on device
- Competes with Morpholio Trace Pro ($7.99/month) and AutoCAD Mobile ($9.99/month) on features, at a price that reflects the added value of bidirectional scene sync

**Aruct Team** (~$79–149/user/month or per-org)
- Mobile: all Pro features plus real-time collaboration, BCF issues, unlimited cached projects, team admin console
- Competes with Fieldwire Pro ($39/user/month) and PlanGrid on field coordination, with the added value of integrated design capability

**Scan Credits** (add-on, Phase 3)
- AI Scan-to-Model: 5 credits/month included with Pro, 20 with Team
- Additional credits at $5 each
- Follows Canvas's service-credit model without the human bottleneck or 1–2 day delay

**Key decisions**:
- Do not charge separately for the mobile app — industry standard and removes a conversion obstacle
- Do not gate offline mode behind a higher tier — offline is a baseline requirement for field use, not a premium feature
- Android parity at the same price as iOS — no platform tax
- No per-space or per-scan pricing at the base level — Matterport's model creates anxiety for teams doing frequent captures

---

## Success Metrics

### Acquisition Metrics

| Metric | Target |
|---|---|
| % of Aruct Pro subscribers activating mobile within 6 months of launch | 60% |
| App Store rating | 4.5+ |
| Google Play rating | 4.5+ |
| Mobile installs from new users (not existing subscribers) | Track as leading indicator for mobile-led acquisition |

### Engagement Metrics

| Metric | Target |
|---|---|
| D7 retention rate | > 50% |
| D30 retention rate | > 35% |
| Scans per active user per month | Track; establish baseline in beta |
| Sketches synced to desktop projects | Track as core loop closure metric |
| Offline session frequency | > 20% of active sessions (validates field use) |
| Time from scan to first sync to desktop | < 2 minutes target (measures workflow integration) |

### Quality Metrics

| Metric | Target |
|---|---|
| App crash rate | < 0.1% of sessions |
| Sync conflict rate requiring manual resolution | < 2% of sync events |
| Sync failure rate (permanently failed background syncs) | < 0.5% |
| LiDAR scan accuracy vs. ground truth | < 1 inch error at 95th percentile for rooms under 6m |
| Sync latency on WiFi | < 10 seconds for typical project delta |

### Business Metrics

| Metric | Hypothesis |
|---|---|
| Mobile-attributed subscription upgrades | Users who install mobile upgrade from Free to Pro at higher rate than web-only users |
| Churn difference (mobile users vs. desktop-only) | Mobile users churn less — the field use case creates stickiness that desktop-only does not |
| NPS for mobile users vs. desktop-only | Mobile users should score higher (more complete workflow) |
| ARPU comparison (mobile-active vs. inactive cohorts) | Mobile-active users upgrade to Team tier more frequently |

### Phase Gates

**Phase 1 launch gate**: 100 beta architects complete the scan→sketch→sync→desktop workflow; average sync time < 10 seconds on WiFi; crash rate < 0.1%.

**Phase 2 launch gate**: Android install base reaches 30% of iOS install base; real-time collaboration used in > 20% of active Team workspaces.

**Phase 3 launch gate**: AI Scan-to-Model acceptance rate > 70% (users accepting AI-proposed room nodes without rejection); point cloud export used by > 10% of Pro subscribers.

---

## Implementation Timeline

### Month 1–2: Foundation

- Set up iOS Xcode project with SwiftUI shell and WKWebView host
- Establish MCP mobile transport (SSE alongside existing WebSocket)
- Add `captureScan` and `pushSketchLayer` MCP tools to `packages/mcp`
- Implement Yjs mobile client (y-websocket + IndexedDB via idb for PWA; Core Data for iOS)
- PWA scaffold with Service Worker and offline caching
- Firebase Auth integration on mobile (JWT handshake for WebSocket upgrade)

### Month 2–4: Core Features

- RoomPlan LiDAR integration: capture → CapturedRoom → Aruct room node schema conversion
- Sketch layer: scale-aware freehand and straight-line tools over PDF/image underlay
- Plan viewer: PDF load, markup, photo pin
- Project list with sync status indicator
- Offline-first sync with background queue and retry logic
- DXF export of captured floor plan; PDF export of annotated plan

### Month 4–6: Beta and Gate

- Internal dogfooding with 5+ architects on real projects
- Beta with 20–30 architects (TestFlight on iOS; PWA URL for Android)
- Performance profiling: sync latency, LiDAR accuracy benchmarks, crash rate
- Iterate to Phase 1 launch gate metrics
- App Store submission and PWA deployment

### Month 6–9: Phase 2 Start

- ARKit point-to-point AR measurement
- Android native app (Jetpack Compose + ARCore)
- Real-time collaboration: live cursors, Yjs real-time sketch sharing, presence indicators
- Scale stencils from Aruct node library in sketch layer

### Month 9–12: Phase 2 Completion

- IFC viewer on device (web-ifc WASM in WebView)
- BCF issue creation workflow
- Conflict UI for non-auto-resolvable sync conflicts
- Sync delta compression and cellular-friendly HTTP transport
- Phase 2 launch gate measurement

### Month 12–15: Phase 3 Start

- Core ML room labeling from LiDAR scan
- AI Scan-to-Model proposal UI (accept/reject per detected element)
- Voice-to-dimension annotation input
- Point cloud export (E57/XYZ)

### Month 15–18+: Phase 3 Completion

- 3D AR sketch using ARKit world anchors
- AR preview of Aruct scene model in real-world context
- Mobile plugin API (mobilePanel manifest registration)
- Apple Vision Pro viewer (spatial computing scene navigation)
- Phase 3 launch gate measurement and iteration

---

*Research sources: Technavio BIM Market Report, MarketsandMarkets BIM Report, Credence Research AEC Software Market, AECHub 2025 Research Report, Fortune Business Insights BIM Market, PropTech Jobs AEC Landscape 2025–2030, Graphisoft BIMx official pages, Houzz Pro mobile feature pages, Matterport pricing and BIM integration pages, Fieldwire blog, Morpholio Trace reviews and official pages, Canvas Measure / Twindo, Planner 5D, Roomle, AutoCAD Mobile, GTCSys offline-first sync strategies, advenno.com PWA 2026, buildingSMART IFC mandates 2025.*
