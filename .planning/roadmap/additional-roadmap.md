# Aruct Additional Roadmap Items

> Beyond the five core modules (Collaborate, Render, Mobile, Scheduler, Measure), these six capabilities extend Aruct into adjacent markets. Each is a potential standalone product and a reinforcing layer in the broader Aruct ecosystem.

---

## Aruct AI (Q2 2027)
### AI-native design generation

**Market Opportunity**
Generative design is the fastest-growing segment in AEC software, driven by owner demand for faster feasibility studies and the emergence of LLM-capable spatial reasoning models. The AI in architecture and construction market is projected to exceed $6 billion by 2030, with early tools fragmented across Midjourney-style image generators, AutoCAD macro assistants, and purpose-built tools from Autodesk and Graphisoft. None yet offer a closed loop from natural-language brief to live, editable 3D BIM geometry — that gap is the opportunity.

**Key Competitors**
Autodesk Forma (generative massing), Archistar (site feasibility AI), TestFit (unit mix optimization), Midjourney + ControlNet (image-only), Maket.ai (floor plan generation).

**Core MVP Features**
- Natural-language brief input ("two-bedroom apartment, north-facing living area, 85 sqm") → generated 3D layout in Aruct scene
- Voice command refinement ("move the kitchen to the east wall")
- Style/program constraints panel (building type, orientation, program areas)
- Multiple layout variants side-by-side with area takeoff comparison
- One-click "accept to scene" that converts generated geometry to editable Aruct nodes

**Technical Approach**
A fine-tuned spatial language model (likely Claude or GPT-4o with tool use) drives a constraint solver that emits Aruct `core` node schemas directly — bypassing image-to-geometry pipelines entirely. The model is trained on anonymized Aruct scene graphs paired with natural-language descriptions to ground spatial vocabulary. Generation runs server-side; streaming partial scene updates via the existing MCP server give users live visual feedback as rooms appear.

**Ecosystem Integration**
Generated layouts land directly in the Aruct scene graph as first-class nodes, inheriting all downstream workflows: Measure for instant area schedules, Scheduler for programme phasing, Render for instant visualization, Collaborate for client review. AI suggestions can be gated behind the editor's existing undo stack so every generated change is reversible.

---

## Aruct XR (Q3 2027)
### Augmented and virtual reality

**Market Opportunity**
The AEC VR/AR market is estimated at $2.3 billion in 2024 and growing at ~28% CAGR, driven by Meta Quest 3, Apple Vision Pro, and ARKit/ARCore maturity on mobile. The core value proposition — catching design errors in immersive scale before construction — is well understood by architects, but current tools require expensive workstations, dedicated VR operators, or proprietary headset apps. A browser-streamed or WebXR path removes that friction entirely.

**Key Competitors**
IrisVR (Prospect), Enscape VR mode, Autodesk Workshop XR, Unity Reflect, Trimble Connect VR, Arkio.

**Core MVP Features**
- WebXR walkthrough for Meta Quest 2/3 and Apple Vision Pro directly from an Aruct share link (no install)
- iPhone/Android AR: place the 3D model at real-world scale via ARKit/ARCore
- Teleport navigation, scale toggle (doll-house ↔ 1:1), and measurement tape in VR
- Multiplayer presence: two users in the same VR session with avatar indicators
- Snapshot capture from within XR sent as a Collaborate issue

**Technical Approach**
The existing `packages/viewer` Three.js renderer is already WebGL; adding WebXR entry point requires the `XRSession` API surface and a XR-compatible camera rig. AR on mobile uses `<model-viewer>` with USDZ/glTF export from the Aruct scene graph for native ARKit/ARCore hand-off. Server-side streaming (like NVIDIA CloudXR) is a Phase 2 option for high-fidelity headset rendering without GPU requirements on the device.

**Ecosystem Integration**
XR sessions are initiated from the Collaborate share link, so any reviewer can enter VR from a project URL. Issues raised in XR surface in the Collaborate issue tracker with a 3D camera position attached. Render-quality materials from Aruct Render can be streamed into XR for client presentations.

---

## Aruct Structural (Q4 2027)
### Structural analysis and coordination

**Market Opportunity**
Structural engineering coordination is one of the most expensive sources of RFIs and change orders in construction — clash detection between architectural and structural models alone costs the US construction industry an estimated $1.8 billion annually. The structural BIM software market is ~$1.1 billion and dominated by tools (ETABS, STAAD, Tekla) that are inaccessible to architects. A lightweight, architect-facing structural coordination layer — not a replacement for engineering software but a first-pass check and coordination hub — addresses a genuine gap.

**Key Competitors**
Autodesk Robot Structural Analysis, ETABS, Tekla Structural Designer, ClearCalcs (lite FEA), Speckle (coordination), Hypar (structural generation).

**Core MVP Features**
- Structural element layer (columns, beams, slabs, walls) as first-class Aruct node types
- Span and load-path visualization overlaid on the 3D scene
- FEA-lite checks: point loads, simple beam deflection, column buckling flag (not code-compliant, advisory only)
- Clash detection between architectural and structural models with issue export to Collaborate
- IFC structural model import and overlay
- Export to ETABS/SAP2000 via .e2k or IFC structural schema

**Technical Approach**
Structural geometry is stored as Aruct core nodes with structural property schemas (material, section, fixity). FEA-lite runs client-side via a WASM port of an open-source solver (OpenSees or similar) for speed; complex models fall back to a serverless compute endpoint. Clash detection reuses the spatial index already built for the Measure module, extended with tolerance-based proximity queries between structural and architectural node bounding volumes.

**Ecosystem Integration**
Structural nodes participate in the Measure area and volume schedules. Clashes are exported as Collaborate issues with 3D camera positions. Scheduler can flag structural milestones (slab pours, steel erection) as dependencies on architectural phases. Aruct MEP coordination builds directly on the clash detection infrastructure introduced here.

---

## Aruct MEP (Q1 2028)
### Mechanical, electrical, and plumbing coordination

**Market Opportunity**
MEP coordination is the single largest source of BIM value in commercial construction — studies consistently show 5–10x ROI on clash detection alone before steel goes up. The MEP BIM tools market is ~$900 million, concentrated in MagiCAD, Revit MEP, and Trimble's suite. None are accessible to small engineering consultants or architects who need to coordinate early-stage MEP intent before engineering begins. An early-stage, architect-facing MEP routing and coordination tool addresses the design development phase that current tools skip.

**Key Competitors**
Autodesk Revit MEP, MagiCAD, Trimble MEP, Plumbflow, ductSIM, Speckle (for export).

**Core MVP Features**
- Duct, pipe, and conduit routing in 3D with snap-to-structure and clearance rules
- Auto-routing: define endpoints, get a clash-free proposed route
- System color coding (supply air, return air, domestic cold, hot water, power, data)
- Clash detection against architectural and structural models (inherits from Aruct Structural)
- MEP schedule export (duct lengths, pipe sizes, load summary)
- IFC MEP export for handoff to engineering teams

**Technical Approach**
MEP elements are graph-structured nodes (segments, fittings, endpoints) stored in `packages/core` with typed system schemas. Auto-routing uses an A* pathfinder operating on the spatial voxel grid derived from the structural/architectural node bounding volumes, respecting clearance envelopes. Clash detection is a direct extension of the Aruct Structural clash engine. Rendering uses instanced Three.js geometry for large duct networks to maintain viewport performance.

**Ecosystem Integration**
MEP nodes feed into Measure for quantity takeoffs (duct area, pipe length, fitting count). Clashes surface as Collaborate issues. Scheduler can link MEP rough-in phases to architectural milestones. Aruct Structural clash detection infrastructure is a prerequisite — MEP is sequenced after Structural for this reason.

---

## Aruct Cost (Q2 2027)
### Live cost estimating

**Market Opportunity**
Construction cost estimating software is a $1.4 billion market growing at ~8% CAGR, but early-stage design-integrated cost tools remain rare. Most estimating happens in Excel or in standalone tools (Procore Estimating, Sage Estimating, Buildsoft) decoupled from the design model, meaning cost feedback is delayed and stale by the time it reaches the design team. Real-time, model-integrated cost estimates during design development — the "design to budget" workflow — is a clear unoccupied position that resonates strongly with owner-developer clients.

**Key Competitors**
Autodesk Assemble, Procore Estimating, CostX, Buildsoft, Destini Estimator, Togal.AI (AI takeoff).

**Core MVP Features**
- Element-level cost assignment: map Aruct node types to cost line items
- Real-time cost dashboard updating as the model changes
- Regional pricing database with manual override per line item
- Elemental cost breakdown (substructure, superstructure, envelope, fitout, MEP allowance)
- Cost-per-area benchmarking against building type averages
- Export to Excel (AIQS/RICS elemental format) and PDF cost plan

**Technical Approach**
A cost engine subscribes to the Aruct scene graph event bus and recomputes line items on every relevant node change. Pricing data is stored in a regional database (seeded from published cost guides — Rawlinsons, RSMeans, BCIS) with a versioned API so rates update independently of the app. The cost model maps node schemas (wall area, floor area, element type) to elemental unit rates; no quantity surveyor expertise is required to get a ballpark — the default mappings work out of the box.

**Ecosystem Integration**
Cost estimates draw quantities directly from the Measure module — no re-entry. Scheduler can attach cost to phases for cash-flow projection. Collaborate allows cost comments on design decisions ("this facade option is $180K over budget"). Aruct MEP and Structural quantities feed automatically into the MEP and structural line items once those modules are active.

---

## Aruct Specs (Q3 2027)
### Specification authoring

**Market Opportunity**
Construction specification writing is a $400 million niche market that is almost entirely manual — architects copy and edit Word documents from previous projects, introducing errors and omissions that become contract risk. The two dominant tools (SpecLink from BSD/Deltek, NBS Chorus) are expensive, UK/US-centric, and completely disconnected from BIM models. An AI-assisted, model-linked specification tool that knows what materials and systems are in the design — and drafts sections accordingly — is a natural extension of any BIM platform and has no capable competitor at the SME price point.

**Key Competitors**
NBS Chorus, SpecLink (BSD/Deltek), e-SPECS, MasterSpec (AIA), Specifier (AI startup), manual Word templates.

**Core MVP Features**
- Model-linked spec: Aruct node properties (material, finish, system type) auto-populate relevant specification sections
- MasterFormat and NatSpec (Australian) section templates included out of the box
- AI draft generation: select a section, get a draft clause set based on model properties and product library
- Product substitution tracker: flag when a specified product is replaced in the model
- Issue for review workflow: send draft sections to a consultant via Collaborate
- Export to Word (.docx) and PDF in practice-standard format

**Technical Approach**
Spec sections are stored as structured documents linked to Aruct node type tags — a `wall` node with `finish: painted GWB` triggers the relevant plasterboard and paint specification sections. AI drafting uses Claude (via the Anthropic API) with a system prompt that includes the project's material schedule and a retrieval-augmented library of specification clauses. The spec document store lives server-side (Postgres, similar to the MCP scene storage adapter) with per-section version history.

**Ecosystem Integration**
Material properties set in the Aruct scene graph flow into spec sections without re-entry. Collaborate distributes draft sections for consultant review using the existing issue and approval workflow. Aruct Cost references specified products for pricing; a product substitution in Specs triggers a cost delta notification. Aruct Structural and MEP product specifications (structural steel, ductwork) are auto-tagged when those modules are active.

---

## Summary Table

| Module | Timeline | Primary Market | Key Dependency |
|---|---|---|---|
| Aruct AI | Q2 2027 | Generative design | Core scene graph + MCP server |
| Aruct Cost | Q2 2027 | Cost management | Measure module (quantities) |
| Aruct XR | Q3 2027 | VR/AR review | Viewer Three.js renderer |
| Aruct Specs | Q3 2027 | Specification authoring | Collaborate (review workflow) |
| Aruct Structural | Q4 2027 | Structural coordination | Core node schemas |
| Aruct MEP | Q1 2028 | MEP coordination | Aruct Structural (clash engine) |

All six modules are additive to the base Aruct platform and designed to be sold as optional add-ons on top of the core editor subscription. Inter-module dependencies (Cost on Measure, MEP on Structural, Specs on Collaborate) inform sequencing but do not block independent early access releases.
