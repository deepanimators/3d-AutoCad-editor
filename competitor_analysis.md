# Competitive Analysis: Aruct vs. the Market

> **Scope**: Deep feature audit of Spline, SketchUp, Arkio, and Figma as design platform comparators — with a clear gap analysis against Aruct's current feature set.  
> **Date**: July 2026  
> **Source**: Live platform research + Aruct codebase audit

---

## Table of Contents

1. [Platform-by-Platform Breakdown](#1-platform-by-platform-breakdown)
   - [Spline](#11-spline)
   - [SketchUp](#12-sketchup)
   - [Arkio](#13-arkio)
   - [Figma (as a design-process model)](#14-figma-as-a-design-process-model)
2. [What Aruct Currently Offers](#2-what-aruct-currently-offers)
3. [Gap Analysis: Aruct vs. Each Competitor](#3-gap-analysis-aruct-vs-each-competitor)
4. [Cross-Platform Gap Summary (Priority Matrix)](#4-cross-platform-gap-summary-priority-matrix)
5. [Strategic Opportunities](#5-strategic-opportunities)

---

## 1. Platform-by-Platform Breakdown

---

### 1.1 Spline

**Tagline**: *"The all-in-one platform for 3D and design"*  
**Category**: Browser-based 3D creative/interactive design  
**Primary Audience**: Web designers, motion designers, front-end developers, creative agencies  
**Price**: Free tier + Pro ($16/mo) + Team plans  

#### What It Does

Spline targets the **web design and interactive experience market** — it is NOT an architectural or spatial planning tool. Its core bet is that 3D will become a standard layer in product/web design, just like 2D vectors were in Figma's era.

| Area | Detail |
|---|---|
| **Core Editor** | Browser-based 3D scene editor. Parametric objects, polygonal editing, NURBS-like splines, CSG booleans |
| **Interactivity** | Events system: hover, click, scroll, drag, key press triggers → state transitions, animations, physics |
| **Real-time Collaboration** | Live multiplayer cursors on the same scene — Figma-model for 3D |
| **AI Generation** | Text-to-3D (generates 4 mesh variants from a prompt). Image-to-3D (2D image → 3D mesh). Remix & variant generation. AI style transfer |
| **Web Export** | Native embed (iframe + `<spline-viewer>` Web Component), React/Next.js/Three.js/React Three Fiber code export, Vanilla JS |
| **Platform Targets** | Web, Apple (Swift/Xcode for iOS/visionOS), Android, Framer, Webflow, Wix, Shopify |
| **Material System** | Material layers, gradients, textures, procedural noise, glass/metal/subsurface |
| **Animation** | Timeline-based keyframe animation, spring physics, procedural motion |
| **Community** | Public "Community" library of remixable 3D scenes, similar to Figma Community |
| **Enterprise** | SSO, private workspaces, custom branding, advanced team controls |

#### Spline's Key Strengths

- **Web-first publishing** — the ability to embed live 3D directly into websites is a massive differentiator no architectural tool has matched
- **Developer SDK ecosystem** — React, Three.js, iOS Swift packages; developers ship Spline scenes as production assets
- **Beginner-accessible AI generation** — no 3D skill required; text prompt → production-ready mesh in seconds
- **Community + remixability** — viral loop: users discover, fork, and share scenes → free distribution
- **Physics + interactivity** — makes spatial design *feel alive*, useful for product visualization

#### Spline's Weaknesses

- No architectural primitives (walls, doors, windows, rooms, dimensions)
- No 2D floorplan view or drafting mode
- No BIM/IFC interoperability
- No construction documentation or annotation tools
- No sun/shadow analysis, energy, or site tools
- Not suitable for professional AEC deliverables

---

### 1.2 SketchUp

**Tagline**: *"From idea to reality"*  
**Category**: Professional 3D modelling for AEC/construction/urban planning  
**Primary Audience**: Architects, contractors, interior designers, urban planners, students  
**Price**: Free (Go), $119/yr (Pro web), $349/yr (Pro desktop+web), Enterprise custom  

#### What It Does

SketchUp is the **market leader in approachable architectural 3D modelling**, with ~33 years of history and an enormous extension/plugin ecosystem. It straddles being both simple enough for students and deep enough for licensed architects.

| Area | Detail |
|---|---|
| **Core Modelling** | Push-pull surface paradigm. Powerful inferencing engine. Groups and components (reusable blocks). Section planes |
| **2D Documentation** | LayOut (desktop only) — 2D drawing from 3D model, dimensioning, titleblocks, PDF export. Industry standard for construction sets |
| **Materials** | Material editor, texture import, basic PBR-style settings. V-Ray, Enscape, Lumion plugins for photorealistic render |
| **Extensions** | 3D Warehouse (millions of free 3D models), Extension Warehouse (1,000+ plugins). Curic, Medeek, Profile Builder etc. |
| **Collaboration** | Trimble Connect integration — cloud storage, version history, in-model commenting on geometry, real-time view tracking |
| **IFC/BIM** | Improved IFC 2x3/4 import/export. Attribute mapping to IFC classes. IFC-aware classification system |
| **Rendering** | No native renderer. Requires Enscape, V-Ray, Lumion, Twinmotion plugins (all paid) |
| **Sun/Shadow** | Native geo-location + date/time shadow casting. Shadow analysis across seasonal range |
| **Terrain** | Add Location (Google Earth topography import). Sandbox terrain sculpting tools |
| **AI** | No native AI generation; community extensions emerging |
| **Mobile/VR** | SketchUp Viewer app (iOS/Android/VR). Not a full editing environment on mobile |
| **Web** | SketchUp for Web (browser-based editor, limited vs desktop) + SketchUp Go (personal/free) |

#### SketchUp's Key Strengths

- **Most approachable push-pull modelling paradigm** — industry-taught at architecture schools globally
- **3D Warehouse** — the largest free repository of architectural components (furniture, doors, windows, MEP)
- **LayOut** — only tool that produces professional-quality construction documentation from the same model
- **Extension ecosystem** — 1,000+ plugins means near-infinite capability through extension
- **IFC interoperability** — serious BIM/coordination workflow support
- **Brand trust + global adoption** — architects know and trust SketchUp

#### SketchUp's Weaknesses

- **Fragmented UX**: web version is crippled vs. desktop; LayOut is desktop-only; real-time rendering requires third-party plugin
- **No native real-time collaboration** on geometry editing (Trimble Connect is file/version-level, not cursor-level)
- **No AI generation** — significant gap relative to Spline and emerging tools
- **Ageing UI/UX** — the desktop interface is cluttered and intimidating for new users
- **Rendering requires separate expensive plugins** ($500–$800/yr for Enscape/V-Ray)
- **No browser embed/publish** — you cannot share a live interactive 3D model on a webpage

---

### 1.3 Arkio

**Tagline**: *"VR and mixed reality design reviews for AEC"*  
**Category**: Spatial design review + VR/MR collaboration tool  
**Primary Audience**: AEC professionals doing immersive design reviews, project coordination  
**Price**: Free (Personal), $50/mo (Pro), $100/mo (Studio), Enterprise  

#### What It Does

Arkio is **not a primary authoring tool** — it is a **design review and rapid conceptual sketching layer** that sits on top of existing BIM software (Revit, SketchUp, Rhino, Archicad). Its superpower is letting teams step inside the building at 1:1 scale in VR/MR.

| Area | Detail |
|---|---|
| **Core Modelling** | Simple push-pull massing, snap-to-grid block modelling. Intentionally crude — it's for ideation not production |
| **VR/MR** | Meta Quest (1/2/3/Pro) full VR. Mixed reality (passthrough). PC VR (SteamVR). Hololens support planned |
| **Collaboration** | Up to 24 simultaneous participants across VR headsets + PC + Mac + iPad + iPhone |
| **Integrations** | Bi-directional plugins for Revit, SketchUp, Rhino, Archicad. Import models → review in VR → push geometry/annotations back to native tool |
| **Issue Tracking** | Capture issues via voice or text in VR. Export issues to external trackers |
| **AI Rendering** | AI-powered scene rendering (conceptual visualization quality) |
| **Presentation** | Walk-through mode, dimension annotations, scale model mode (tabletop view) |
| **Export** | GLB, OBJ export. Issues export to PDF/CSV |

#### Arkio's Key Strengths

- **Only tool with true VR-first collaborative design review** for the AEC market at this price point
- **Multi-device participation** — client on iPhone, architect in VR, PM on desktop, all in the same session
- **BIM plugin ecosystem** — native roundtrip with Revit and Rhino removes friction
- **24-person sessions** — suited for complex stakeholder reviews
- **Speed of spatial understanding** — nothing communicates scale to clients like standing inside the design

#### Arkio's Weaknesses

- **Not a production modelling tool** — geometry is crude blocks, not construction-ready
- **Hardware dependency** — full value requires VR headset ($300–$1000+)
- **No 2D floorplan view** — no drafting, no documentation output
- **No materials** — basic colour fills only, no PBR or texture support
- **No AI generation** — no text-to-3D or geometry generation
- **Limited geometry export** — what you sketch in Arkio doesn't translate to clean CAD

---

### 1.4 Figma (as a design-process model)

**Tagline**: *"Where teams design together"*  
**Category**: Collaborative UI/product design — the dominant **design process paradigm** reference  
**Primary Audience**: Product designers, UI/UX teams, developers  

> **Note**: Figma is not a direct 3D competitor, but the user included it as a **process reference** — specifically the "Verb + what you get + who it's for" copy model, and Figma's design *methodology* is the gold standard that all spatial tools aspire to in terms of collaboration and developer handoff.

#### Why Figma Matters as a Reference

| Figma Principle | Architectural Design Equivalent |
|---|---|
| Real-time multiplayer cursors | Live 3D scene co-editing |
| Design tokens + components | Reusable architectural components (door, window, wall) |
| Dev Mode — inspect, measure, export code | "Handoff" to structural/MEP engineers — export IFC, DXF, schedules |
| Branching + version history | Design options/alternatives with full history |
| Community templates | Public scene library |
| Comment threads on specific canvas elements | Annotation on specific walls, rooms, elements |
| Plugin API — third-party tools embed in sidebar | Aruct's plugin ecosystem |
| Prototype → interactive preview | Walk-through / VR preview from the same model |

#### What Figma Gets Right (Model to Learn From)

- **One tool for the whole team** — designer, developer, stakeholder all work in the same file
- **Transparent workflow** — no "black box"; everyone can see the design evolving
- **Deep third-party ecosystem** — the plugin API made Figma a platform, not just a product
- **Progressive complexity** — simple enough for anyone, deep enough for experts
- **Excellent free tier** — drove viral adoption before monetizing teams

---

## 2. What Aruct Currently Offers

Based on the live codebase audit (`landing-client.tsx`, `packages/`, `wiki/architecture/`):

| Feature | Status | Notes |
|---|---|---|
| **2D + 3D dual viewports** | ✅ Shipped | Floorplan + 3D perspective, synced |
| **PBR material system** | ✅ Shipped | Physically-based; Poly Haven integration |
| **Plugin ecosystem** | ✅ Shipped | Isolated, toggleable plugins via marketplace |
| **BOM reports** | ✅ Plugin | Auto bill of materials from scene |
| **Sun study** | ✅ Plugin | Solar path by date, time, geo-location |
| **Section cuts** | ✅ Plugin | Cross-section through walls/slabs |
| **Mesh editor** | ✅ Plugin | Low-poly organic modelling |
| **Terrain** | ✅ Plugin | Heightmap import + sculpt |
| **Energy analysis** | ✅ Plugin | Thermal load from geometry |
| **Cloud scenes** | ✅ Shipped | Save to account, invite teammates |
| **GLB / STL / OBJ / DXF export** | ✅ Shipped | 4 formats |
| **AI-assisted generation** | ✅ Partial | Text → geometry (mentioned in landing); Tripo AI plugin |
| **DCC bridge** | ✅ Shipped | Integration with external DCC tools |
| **IFC import/export** | ✅ Package | `packages/ifc-converter` exists in monorepo |
| **Org + team management** | ✅ Shipped | Multi-org, roles, invites |
| **Dark/light mode** | ✅ Shipped | |
| **Pricing tiers** | ✅ Shipped | Free local, Pro (cloud), Studio (team) |
| **MCP server** | ✅ Package | `packages/mcp` — scene storage adapters |
| **Real-time cursor collaboration** | ❓ Unclear | Cloud scenes invite teammates — but live cursor state is not surfaced in landing |
| **Public scene embed/share** | ❌ Missing | No iframe embed, no public URL viewer |
| **3D model library / warehouse** | ❌ Missing | No built-in model library |
| **Annotation / comment on elements** | ❌ Missing | No geometry-anchored comments |
| **Construction documentation** | ❌ Missing | No LayOut-equivalent 2D drawing from model |
| **Version history / branching** | ❌ Missing | |
| **Native VR/MR review** | ❌ Missing | No immersive walkthrough mode |
| **Mobile app** | ❌ Missing | |
| **Web embed SDK** | ❌ Missing | No `<aruct-viewer>` web component or React SDK |
| **Community / template library** | ❌ Missing | |
| **AI style transfer / image-to-3D** | ❌ Missing | |
| **Multiplayer voice/issue capture** | ❌ Missing | |

---

## 3. Gap Analysis: Aruct vs. Each Competitor

---

### 3.1 Gaps vs. Spline

| Spline Has | Aruct Gap | Severity |
|---|---|---|
| Public URL + iframe embed of live 3D | No embeddable output — users can't share scenes publicly on websites | 🔴 Critical |
| React / Three.js / Vanilla JS SDK | No developer SDK for embedding Aruct scenes in products | 🔴 Critical |
| AI text-to-3D (mesh generation, 4 variants) | AI exists but is architectural-only; no general 3D mesh generation | 🟠 High |
| Image-to-3D generation | Not present | 🟠 High |
| Community library of remixable scenes | No public scene community or discover feed | 🟠 High |
| Physics simulation + events | No interactivity layer; models are static scenes | 🟡 Medium |
| Real-time live multiplayer cursors (confirmed) | Unclear if cursors are live in real-time or async | 🟡 Medium |
| Apple Swift / iOS / visionOS SDK | No mobile or spatial computing output | 🟡 Medium |
| Style transfer / aesthetic AI | No visual style variation feature | 🟡 Medium |

**Key lesson from Spline**: The biggest moat Spline has built is making 3D scenes *publishable* — they become first-class web citizens. Aruct scenes exist only inside the Aruct editor. If users can't show their scenes to clients without screen-sharing, that's a fundamental shareability gap.

---

### 3.2 Gaps vs. SketchUp

| SketchUp Has | Aruct Gap | Severity |
|---|---|---|
| LayOut — 2D construction documentation | No 2D drawing-set output from the 3D model | 🔴 Critical |
| 3D Warehouse — millions of models | No model library; users must create everything | 🔴 Critical |
| 1,000+ extensions (ExtWH) | Plugin marketplace exists but scale is unknown | 🟠 High |
| IFC 2x3/4 roundtrip (import + export) | `ifc-converter` package exists but not surfaced in UI | 🟠 High |
| Native shadow analysis (geo-located) | Sun Study plugin exists — parity ✅ | — |
| Trimble Connect — file-level collab | Cloud scenes with invites — parity (roughly) | — |
| Construction-grade dimensions + annotations | No dimensioning tool beyond what exists in floorplan | 🟠 High |
| In-model commenting on geometry | No element-anchored comments | 🟠 High |
| V-Ray / Enscape render integration | PBR materials present; no high-end render output | 🟡 Medium |
| Section drawing with hatching/fills | Section cuts plugin exists; no documentation-quality output | 🟡 Medium |
| Mobile viewer app | No viewer app | 🟡 Medium |
| Component library (reusable groups) | Unclear if Aruct has reusable component blocks | 🟡 Medium |

**Key lesson from SketchUp**: The #1 thing SketchUp users pay for is **LayOut** — the ability to take their 3D model and produce professional 2D construction documents (floor plans, elevations, sections) with annotations, scales, titleblocks, and PDF export. Aruct has no equivalent. This is the gap that prevents Aruct from being a professional deliverable tool.

---

### 3.3 Gaps vs. Arkio

| Arkio Has | Aruct Gap | Severity |
|---|---|---|
| VR walkthrough — 1:1 scale immersive review | No immersive walkthrough or VR output | 🟠 High |
| 24-person simultaneous collaborative session | Unknown if Aruct sessions scale to multi-user | 🟠 High |
| Mixed reality (passthrough) mode | Not present | 🟡 Medium |
| Voice + text issue capture in session | No annotation/issue workflow | 🟡 Medium |
| Bi-directional Revit/Rhino/SketchUp plugins | DCC bridge exists — partial parity | 🟡 Medium |
| Client participation via iPhone/iPad | No mobile participation | 🟡 Medium |

**Key lesson from Arkio**: Arkio doesn't compete on modelling depth — it competes on **client presentation and immersive review**. Aruct has no "show the client" mode. Even a non-VR first-person walkthrough mode (mouse/keyboard fly-through of the 3D scene) would partially address this.

---

### 3.4 Gaps vs. Figma's Process Model

These are not feature gaps but **workflow & ecosystem gaps** that prevent Aruct from becoming a platform:

| Figma Pattern | Aruct Gap |
|---|---|
| Branching — work on design alternatives without overwriting main | No branch/fork of scenes |
| Version history — restore any point in time | Not surfaced in UI |
| Comment threads anchored to canvas elements | No geometry-level comments |
| Dev Mode — hand off model data to engineers in structured way | No "handoff" mode for structural/MEP engineers |
| Plugin API that's public and documented for 3rd parties | Plugin ecosystem exists; public authoring docs unclear |
| Community — share and discover templates publicly | No community layer |
| Notification system — @mention teammates in comments | No notification/mention system |
| Organization-level design token / theme system | Themes exist architecturally (wiki); not exposed to users |

---

## 4. Cross-Platform Gap Summary (Priority Matrix)

| Gap | Spline | SketchUp | Arkio | Figma-model | Priority |
|---|:---:|:---:|:---:|:---:|---|
| **Embeddable public scene viewer** (iframe/web component) | ✅ | ❌ | ❌ | ❌ | 🔴 P0 |
| **2D construction documentation** (plan/elevation/section output) | ❌ | ✅ | ❌ | ❌ | 🔴 P0 |
| **Model / component library** (furniture, doors, windows) | Community | 3D Warehouse | ❌ | ❌ | 🔴 P0 |
| **IFC import/export surfaced in UI** | ❌ | ✅ | Indirect | ❌ | 🟠 P1 |
| **Text-to-3D mesh generation** (AI, mesh level) | ✅ | ❌ | ❌ | ❌ | 🟠 P1 |
| **Geometry-anchored comments** | ❌ | ✅ | ✅ | ✅ | 🟠 P1 |
| **First-person walkthrough / presentation mode** | ❌ | Viewer | ✅ VR | Prototype | 🟠 P1 |
| **Version history / branching** | ❌ | Trimble Connect | ❌ | ✅ | 🟠 P1 |
| **Real-time multiplayer cursors** (confirmed, surfaced) | ✅ | ❌ | ✅ | ✅ | 🟠 P1 |
| **Dimensioning + annotation tools** | ❌ | ✅ | ✅ | ✅ | 🟠 P1 |
| **Mobile viewer / participation** | ❌ | ✅ App | ✅ iPhone | ❌ | 🟡 P2 |
| **Public community / scene discover** | ✅ | 3D Warehouse | ❌ | ✅ Community | 🟡 P2 |
| **Developer SDK** (React, JS embed) | ✅ | ❌ | ❌ | ❌ | 🟡 P2 |
| **Image-to-3D generation** | ✅ | ❌ | ❌ | ❌ | 🟡 P2 |
| **VR / MR headset review** | ❌ | Viewer only | ✅ | ❌ | 🟡 P2 |
| **Photorealistic render output** | ❌ | Plugin | AI render | ❌ | 🟡 P2 |
| **Plugin marketplace for 3rd parties** | ✅ | ✅ 1,000+ | ❌ | ✅ | 🟡 P2 |

---

## 5. Strategic Opportunities

### 🎯 Opportunity 1: "Figma for Architects" — The Collaboration Layer (P0)

**The gap**: Aruct has the modelling core. What it doesn't have is the *presentation and communication layer*. Architects don't just make buildings — they convince clients, coordinate with engineers, and document for contractors.

**Recommendation**:
- Ship **geometry-anchored comments** (click a wall → leave a comment, tag a teammate)
- Surface **version history** in the UI (already has cloud saves → make it visible)
- Build a **"Share scene" link** that opens a read-only first-person walkthrough view — no account required, no install

This single feature (shareable scene link) would make Aruct competitive with how Figma sharing changed 2D design.

---

### 🎯 Opportunity 2: Embeddable Viewer (P0)

**The gap**: Every Spline user can paste a `<spline-viewer>` tag and their 3D scene lives on their portfolio site. Every Aruct user can only show their work via screenshot.

**Recommendation**:
- Ship a `<aruct-viewer>` Web Component (powered by the existing `packages/viewer`)
- Expose it as an npm package and `<script>` CDN embed
- Add a "Publish" button in the editor → generates a public URL + embed code

This extends Aruct's reach to every web designer and architect who wants to present their models on a client website.

---

### 🎯 Opportunity 3: Model Library (P0)

**The gap**: 3D Warehouse is SketchUp's biggest retention mechanism. Users can furnish an entire building in minutes. Without a library, every Aruct user starts from scratch.

**Recommendation**:
- Integrate **Poly Haven** (free PBR HDRIs + models) — already referenced in materials
- Integrate **Sketchfab API** for downloadable GLB/OBJ content
- Build a **curated component library**: doors, windows, furniture, fixtures (start with 100 well-made architectural objects)
- Long-term: let users publish components to a **Community** tab → Figma/SketchUp network effect

---

### 🎯 Opportunity 4: Construction Documentation Output (P0 for AEC credibility)

**The gap**: Professional architects cannot use Aruct without construction documentation. LayOut is SketchUp's #1 retention driver. Without this, Aruct is a "conceptual" tool that gets abandoned when work gets serious.

**Recommendation**:
- Build a **"Documentation view"** that exports 2D drawings from the 3D model:
  - Floor plans at chosen levels (auto-generated from walls)
  - Elevations from North/South/East/West
  - Cross-sections (section cut plugin already exists → make it export to DXF/SVG/PDF)
  - Dimension auto-annotation from the existing measurement system
- Start with **DXF export of plan views** — the data already exists in the floorplan viewport

---

### 🎯 Opportunity 5: First-Person Walkthrough Mode (P1)

**The gap**: Arkio's entire value prop is "step inside your design". Aruct has a 3D viewport but no navigation mode for non-editors. A client presentation requires a dedicated fly-through / walk mode.

**Recommendation**:
- Add a **Presentation Mode**: first-person navigation (WASD + mouse look) in the existing 3D viewport
- Gate it as a free feature on shared scene links — clients experience the space without needing an account
- Longer term: WebXR support (browser-based VR via Meta Quest browser) without requiring Arkio's hardware ecosystem

---

### 🎯 Opportunity 6: IFC — Surface the Existing Package (P1)

**The gap**: `packages/ifc-converter` already exists in the monorepo. But IFC is not mentioned anywhere in the landing page or UI features. SketchUp charges architects for IFC roundtrip — Aruct can offer it and win BIM workflows.

**Recommendation**:
- Surface IFC import/export in the UI as a first-class feature
- Add to the features section of the landing page alongside GLB/DXF/STL/OBJ
- This immediately positions Aruct as BIM-compatible — a huge trust signal for AEC firms

---

### Summary: Where Aruct Should Focus

```
NOW (next 3 months):
  1. Shareable scene links (read-only public URL + first-person view)
  2. IFC — surface what already exists in the codebase
  3. Geometry-anchored comments

NEXT (3–6 months):
  4. Embeddable viewer SDK (Web Component + npm)
  5. Curated component library (50–100 architectural objects)
  6. Version history UI
  7. 2D documentation export (plans, elevations from 3D model)

LATER (6–12 months):
  8. Community / public scene discover
  9. Enhanced AI — image-to-3D, full-scene generation
 10. WebXR walkthrough (browser-based VR)
 11. Developer API — third-party plugin authoring portal
```


---

*Analysis based on: Spline AI feature page, Spline product web research, SketchUp 2024 release notes and Trimble documentation, Arkio feature docs and Meta App Lab listing, Figma design collaboration guidelines, and Aruct codebase audit (`apps/editor/`, `packages/`, `wiki/architecture/`).*

---

## 6. Positioning Map

The two most important axes in spatial design tools are **Collaboration Depth** (how well the tool supports teams vs. solo use) and **AEC Specificity** (how purpose-built it is for architecture/construction vs. general 3D).

```
                   AEC Specificity
                   (High = architecture-specific tools)

                            ▲
                            │
                            │       SketchUp
                     ARKIO  │      (Pro/LayOut)
                            │
                            │
    ────────────────────────┼────────────────────────▶
    Solo/Static             │               Real-time Collaboration
                            │
                       ARUCT│ ← (current)
                       (now)│
                            │            SPLINE
                            │
                            │
                            │  FIGMA (2D reference)
                            │
                            ▼
                   General 3D / Web Creative
```

**Where Aruct wants to be:**

```
                            ▲
                            │
                            │       SketchUp       ← ARUCT TARGET
                     ARKIO  │      (Pro/LayOut)    (AEC + collaboration)
                            │
                            │
    ────────────────────────┼─────────────────────────────────────▶
    Solo/Static             │               Real-time Collaboration
                            │
                            │
                            │            SPLINE
                            │
```

**The white space Aruct can own**: The top-right quadrant — AEC-specific with Figma-level real-time collaboration. SketchUp is AEC-specific but weak on live collaboration. Arkio is collaborative but not a full authoring tool. Aruct can be the first tool that combines both.

---

## 7. Aruct's Unique Angle — The Unfair Advantage

After reviewing all four competitors, Aruct has capabilities that **none of the others have in combination**:

| Unique Combination | Why it matters |
|---|---|
| **2D floorplan + 3D viewport in one tool** | SketchUp is 3D-only. Arkio is 3D-only. Spline is 3D-only. Aruct is the only tool where you draw in plan and model in 3D in the same session |
| **Plugin architecture (isolated, toggleable)** | Aruct's plugin model is more modular than SketchUp's extension model — plugins don't bloat the core editor |
| **MCP server (`packages/mcp`)** | No competitor has a native MCP (Model Context Protocol) integration. This gives Aruct a unique AI-agent integration story that others don't have yet |
| **IFC converter in the monorepo** | BIM-ready architecture already exists — just needs surfacing |
| **Browser-native (no install)** | SketchUp's web version is limited. Aruct is browser-first without the compromises |
| **Dual-mode AI** (spatial + generative) | AI that understands architectural context (rooms, walls, programmes) is a different class than Spline's generic mesh generation |

### The One-Sentence Positioning

> **Aruct is the first browser-native 3D architectural editor where the entire team — architect, engineer, client — works in the same space, from first sketch to final export.**

This is the gap none of the four competitors fills:
- Spline: team-friendly but not architectural
- SketchUp: architectural but not team-native (Trimble Connect is file-sharing, not co-editing)
- Arkio: team-friendly VR but not a primary authoring tool
- Figma: the team-native model but 2D only

---

## 8. Competitive Moat Framework

For Aruct to build a defensible position, it needs moats in three layers:

### Layer 1: Network Moat (hardest to replicate)
- **Component library** — every object a user uploads becomes available to others → grows with every user
- **Community scenes** — public scene feed creates discovery → users find Aruct through shared scenes
- **Plugin marketplace** — third-party developers build on Aruct → ecosystem grows independently

### Layer 2: Switching Cost Moat (moderate to replicate)
- **Cloud scene library** — all your work lives in Aruct; moving it means re-doing it
- **Team habits** — once a firm's architects, clients, and project managers are all commenting in Aruct, switching tools requires retraining everyone
- **IFC history** — full project history in one place including BIM roundtrip

### Layer 3: Technical Moat (easy to replicate but takes time)
- **MCP integration** — first mover in AI-agent scene manipulation
- **2D+3D sync** — the floorplan ↔ 3D sync is a subtle but hard-to-copy UX advantage
- **WebXR viewer** — browser-based VR with no app install (vs. Arkio's native apps)

---

## 9. Quick-Reference One-Pager

| | Spline | SketchUp | Arkio | **Aruct** |
|---|---|---|---|---|
| **Browser-native** | ✅ | Partial | ❌ | ✅ |
| **2D + 3D views** | ❌ | ❌ | ❌ | ✅ |
| **Architectural primitives** | ❌ | ✅ | Partial | ✅ |
| **AI generation** | ✅ text+image | ❌ | AI render | ✅ spatial AI |
| **Plugin system** | ✅ | ✅ 1,000+ | ❌ | ✅ |
| **Real-time collaboration** | ✅ | ❌ (file-level) | ✅ | ✅ |
| **IFC / BIM** | ❌ | ✅ | Indirect | ✅ (package) |
| **Sun / shadow** | ❌ | ✅ | ❌ | ✅ plugin |
| **Section cuts** | ❌ | ✅ | ❌ | ✅ plugin |
| **Energy analysis** | ❌ | Plugin | ❌ | ✅ plugin |
| **Terrain** | ❌ | ✅ | ❌ | ✅ plugin |
| **BOM / schedules** | ❌ | Plugin | ❌ | ✅ plugin |
| **Construction docs** | ❌ | ✅ LayOut | ❌ | ❌ **GAP** |
| **Model library** | Community | 3D Warehouse | ❌ | ❌ **GAP** |
| **Public embed/share** | ✅ | ❌ | ❌ | ❌ **GAP** |
| **VR walkthrough** | ❌ | Viewer only | ✅ | ❌ **GAP** |
| **MCP integration** | ❌ | ❌ | ❌ | ✅ **Unique** |
| **Free tier** | ✅ | ✅ (limited) | ✅ | ✅ |
| **Open format export** | GLB | SKP/OBJ/DXF | GLB/OBJ | GLB/STL/OBJ/DXF |
| **Pricing (Pro)** | $16/mo | ~$29/mo | $50/mo | TBD |

### Legend
- ✅ = Present and working
- Partial = Exists but limited
- ❌ = Not present
- **GAP** = Critical missing feature vs. market
- **Unique** = Aruct-only capability

---

## 10. Recommended Competitive Messaging

Based on gaps and strengths, here's how Aruct should position itself against each competitor when that comparison comes up:

### vs. SketchUp
> *"Everything SketchUp does, without the install, the price, and the 30-year-old UI. Plus AI, live collaboration, and the ability to show clients without emailing a file."*

### vs. Spline
> *"Spline is for making websites feel 3D. Aruct is for making buildings. Same browser-native elegance — built for architects, not motion designers."*

### vs. Arkio
> *"Arkio requires a VR headset and is built for reviewing existing designs. Aruct is where you create the design in the first place — and then share it with anyone, on any device, instantly."*

### vs. "I just use Revit/Rhino"
> *"Revit and Rhino are the right tools for production documentation. Aruct is where the design thinking happens — faster, lighter, and shareable before you've committed to geometry. Then export to your BIM tool of choice via IFC."*

---

*Document version 1.0 — July 2026. Maintained in the AC-Editor repository.*
