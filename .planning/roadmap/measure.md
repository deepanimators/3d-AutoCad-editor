# Aruct Measure: Market Research & Implementation Roadmap

> Quantity takeoff & BOM

## Executive Summary

The construction quantity takeoff and estimating software market is a USD 2.1 billion segment growing at ~10% CAGR, with the BIM-integrated sub-segment growing even faster at 13.5% CAGR. The market is bifurcated between legacy desktop tools (PlanSwift, Bluebeam, On-Screen Takeoff) with large installed bases and declining growth, and cloud-native tools (STACK, ProEst, Autodesk Takeoff) with fast growth but still anchored to 2D PDF workflows. Even the most advanced BIM-integrated tools (Autodesk Takeoff, RIB CostX) require an import/export step: the designer works in one tool, exports an IFC or PDF, and the estimator measures in another. Quantities are stale the moment any design change is made.

Aruct Measure occupies a structurally unique position: quantities derived directly from the live 3D scene graph, recomputed in real-time as the designer edits the model, with no import step and no staleness. This is not a marginal feature improvement — it is a fundamentally different workflow. No competitor can replicate this without rebuilding their product as a design tool. The entry barrier Aruct creates is architectural.

The recommended approach is a three-phase rollout over 18 months. Phase 1 (months 1–6) delivers the core quantity engine and BOM panel as an MVP — enough to charge for and validate the value proposition with early adopters. Phase 2 (months 7–12) adds cost database integration, revision tracking, and key integrations (Procore, QuickBooks) to achieve competitive parity with STACK and PlanSwift. Phase 3 (months 13–18+) builds the differentiation moat: AI cost advisors, embodied carbon, supplier marketplace, and 5D BIM, features that are only possible when the measurement system lives inside the design tool. The MVP can be delivered by 2–3 engineers in 6 months, building on the existing scene graph, PDF underlay, and Yjs sync infrastructure already in the codebase.

---

## Market Overview

### Market Size and Growth

| Segment | 2025 Value | 2034 Projection | CAGR |
|---|---|---|---|
| BIM-Based Quantity Takeoff Software | USD 1.84B | USD 5.78B | 13.5% |
| Broader Construction Takeoff Software | USD 2.1B | USD 4.9B | 9.8% |
| Overall AEC Software | USD 11.3B | USD 19.79B | 8.6% |

**Regional Split:**
- North America: ~37% share (~USD 680M), dominant due to BIM mandate adoption and large installed bases
- Europe: ~27.5% (~USD 506M), driven by ISO 19650 requirements and UK government BIM mandates
- Asia Pacific: fastest-growing at 15.6% CAGR, led by Glodon (China), Singapore BIM mandates, and Australian infrastructure spend

### Key Growth Drivers

1. **Government BIM mandates** — UK, Singapore, Germany, and US federal projects increasingly require BIM-compliant deliverables, pushing contractors toward model-based workflows.
2. **Shift from 2D PDF to model-based estimating** — The 2D PDF workflow is reaching end-of-life for commercial projects; IFC-based quantity extraction is becoming the professional standard.
3. **Labor cost pressure** — Manual quantity takeoff for a mid-size commercial project takes 8–25 hours. AI-assisted and model-based tools reduce this to minutes. The economic case for automation is compelling and getting stronger as estimator wages rise.
4. **Cloud adoption** — Distributed estimating teams (bid coordinators, specialty trade estimators, QS consultants) need simultaneous access. Desktop tools cannot serve this workflow.
5. **Sustainable construction** — Embodied carbon tracking per material is becoming owner-required and increasingly regulatory. This requires material-level quantity granularity that PDF-based tools cannot provide.

### Market Dynamics

The market is consolidating at the top (Autodesk acquiring ProEst; ConstructConnect acquiring PlanSwift and On-Screen Takeoff; Nemetschek acquiring Bluebeam and RIB) while fragmenting in the AI-native tier (Kreo, Togal.AI, Sparkel, aginera). The consolidation creates a window: incumbent products are stagnating post-acquisition while users are actively evaluating alternatives. STACK in particular has drawn significant user complaints about 40–50% annual renewal price increases, creating churn that a well-priced alternative can capture.

---

## Competitor Analysis

### PlanSwift (ConstructConnect)

**Platform:** Windows desktop only — no Mac, no browser, no mobile

**Pricing:** ~$1,749–$2,000/user/year, annual subscription. No free tier.

**Strengths:**
- 18+ trade-specific assemblies (concrete, framing, drywall, roofing, flooring, sitework) in a single neutral interface
- Assembly-based measurement simultaneously calculates both material cost AND labor hours — unique in this price range
- "Takeoff Boost" AI layer: automated takeoff and auto-count for repetitive elements
- Live bidirectional Excel link (two-way sync, not just export)
- Large installed base: most SME general contractors and specialty contractors know PlanSwift
- Plugin ecosystem for trade-specific extensions

**Weaknesses:**
- Windows desktop only — no remote access, no collaboration, no mobile use
- No BIM or IFC support of any kind
- Post-acquisition stagnation (acquired by ConstructConnect 2015; update cadence has noticeably slowed)
- Single-user per seat — no simultaneous editing
- No included cost database — user must supply rates or purchase separately
- No revision tracking or delta comparison

**Key differentiators:**
- Only mainstream tool where measuring simultaneously computes both material cost and labor hours
- 18+ trade coverage in a single product without being trade-locked

---

### Bluebeam Revu (Bluebeam, Inc. — Nemetschek Group)

**Platform:** Windows desktop (primary) + Bluebeam Cloud (web/mobile, reduced feature set)

**Pricing:** $260–$590/user/year (Basics, Core, Complete, Ultimate tiers)

**Strengths:**
- Ubiquitous in AEC — near-universal installation across GC and design firms creates network effects
- Studio Sessions: real-time multi-user PDF markup collaboration, best-in-class for document review
- Lowest price point of any professional tool in this category
- Drawing management and document version control built in
- Mobile app for field use

**Weaknesses:**
- NOT a purpose-built takeoff tool — no cost database, no assemblies, no labor calculation
- Pricing logic must be built and maintained in external spreadsheets
- No BIM, IFC, or 3D model support of any kind
- Quantities exist in PDF space only — no structured BOM, no model linkage
- Takeoff is a secondary feature; product core competency is PDF review
- Desktop version Windows-only; Cloud version has significantly reduced features

**Key differentiators:**
- Network effect: because everyone has Bluebeam, Studio collaboration is frictionless
- Price/value for teams that need PDF review first and measurement as a secondary workflow

---

### STACK Construction Technologies

**Platform:** Web-based, any browser, any OS — the leading cloud-native mid-market option

**Pricing:** Free tier (limited projects); Pro $2,988–$3,588/user/year (volume discounts to $2,199/seat at 3+ seats)

**Strengths:**
- Strongest cloud collaboration of any mid-market tool — multiple estimators simultaneously on same project
- Symbol recognition auto-identifies repeated symbols across all sheets
- Freemium model reduces acquisition friction; unlimited viewer seats for subs/clients
- No installation required; instant onboarding
- Pre-built assembly cost libraries on Pro tier
- Bid leveling and subcontractor management

**Weaknesses:**
- No 3D or BIM support — purely 2D PDF workflow
- Highest price in the mid-market segment, with reported 40–50% renewal hikes causing significant churn
- No IFC support
- Assembly setup is manual and time-consuming for first project
- Quantities are stale the moment the underlying design changes

**Key differentiators:**
- Cloud collaboration model is the standard for modern distributed estimating teams
- Unlimited viewer seats is a genuine procurement differentiator

---

### RIB CostX (RIB Software SE — Nemetschek Group)

**Platform:** Desktop (Windows) with network server for multi-user; limited cloud options

**Pricing:** Quote-based. Quantify tier ~$2,599/year; Core and Complete higher; network licenses additional.

**Strengths:**
- Strongest IFC and BIM takeoff of any QS-focused tool outside the Autodesk ecosystem
- Live spreadsheet link closest to a proper database-backed workbook, not just Excel export
- Revision/comparison tool is best-in-class: estimators only re-measure changed scope, not the full model
- Carbon estimating module for embodied carbon per material — increasingly required
- Trusted BOQ output format used by quantity surveyors in UK, Australia, and Asia
- Three package tiers allow entry at measurement-only level (Quantify)

**Weaknesses:**
- Fundamentally a desktop product; cloud collaboration requires server infrastructure and IT overhead
- No real-time cloud sync; collaboration is session-based network sharing
- Steep learning curve for full QS workflow
- Performance degrades with very large IFC models
- Not well-suited to US-centric assembly-based estimating workflows
- Implementation consulting often required, adding to total cost

**Key differentiators:**
- IFC/BIM takeoff quality is genuinely superior to cloud tools at this price point
- Revision tooling is the market benchmark

---

### Autodesk Takeoff / Forma Takeoff (Autodesk Construction Cloud)

**Platform:** Web-based, part of Autodesk Construction Cloud (ACC)

**Pricing:** $1,290/user/year for Takeoff alone. Full ACC bundles $2,000–$10,000+/user/year. Estimating requires separate ProEst license (~$5,000+/year additional).

**Strengths:**
- Only major tool combining 2D PDF takeoff and 3D BIM model extraction in one cloud UI
- IFC and Revit (.RVT) support is native and reliable
- Enterprise-grade collaboration and audit trail
- Auto-Count AI symbol recognition on 2D drawings
- Native document versioning via ACC Docs
- 40% reduction in takeoff time documented in case studies
- Natural extension for organizations already invested in the Autodesk ecosystem

**Weaknesses:**
- Quantities only — no cost database, no assemblies, no pricing; requires separate ProEst license
- Poor value for 2D-only workflows or non-Autodesk shops
- $1,290/year for takeoff, then additional cost for estimating — total cost is high
- No integration with QuickBooks, Sage, or standard SME accounting
- Large-GC bias: SMEs cannot justify total ACC platform cost
- Ecosystem lock-in: poor value if you are not already on Revit and ACC

**Key differentiators:**
- The only cloud tool with both 2D and 3D/IFC takeoff in a single unified interface
- Enterprise collaboration and audit trail are mature and trusted by large GCs

---

### ProEst (Autodesk)

**Platform:** Web-based, cloud-native

**Pricing:** $5,000/year flat (unlimited users). Some packages $299–$500+/user/month.

**Strengths:**
- Flat annual pricing with unlimited users — better economics at scale than per-seat tools
- RSMeans cost database built in (no add-on required, unlike most competitors)
- Built-in CRM for tracking clients, bid history, and win rates
- Open API with native integrations for Procore, Sage 300, Sage Intacct, QuickBooks, Buildertrend
- Professional proposal generation and bid analytics

**Weaknesses:**
- No native 3D, BIM, or IFC support
- $5,000/year minimum is expensive for small firms
- Takeoff module is functional but secondary to the estimating workflow
- Now Autodesk-owned: roadmap may increasingly bias toward ACC ecosystem lock-in

**Key differentiators:**
- RSMeans built in is a genuine differentiator; most tools charge ~$1,500–$3,000/year for RSMeans separately
- Unlimited-user flat pricing is the right model for growing teams

---

### Sage Estimating

**Platform:** Desktop/server (Windows); not cloud-native

**Pricing:** Standard $5,000–$8,000/year (single user); Advanced $10,000–$20,000+/year. Quote-based.

**Strengths:**
- RSMeans database with regional adjustments — deepest cost data in the market
- Assembly workflow efficient for high-volume commercial repetitive work
- 30+ years of cost database refinement
- Deep ERP integration for Sage 300/Sage Intacct users

**Weaknesses:**
- No native takeoff — requires separate On Center (eTakeoff) license at additional cost
- No BIM or IFC support
- Server-based, no cloud-native collaboration
- Extremely high first-year TCO: $25,000–$45,000 for two estimators including implementation
- Rigid reporting with limited customization outside Sage templates
- Poor fit for firms not already using Sage accounting

**Key differentiators:**
- Cost database depth and ERP integration for large commercial firms already on Sage

---

### Trimble Quantify / Trimble Estimation

**Platform:** Desktop (Windows); some cloud connectivity

**Pricing:** $999/user (single) to $1,499/user (multiuser). eTeam: custom quote.

**Strengths:**
- Automatic fittings calculation speeds MEP/HVAC estimating significantly
- Direct connectivity between takeoff and estimate — no re-entry
- Tight integration with Trimble MEP/HVAC design ecosystem

**Weaknesses:**
- MEP/HVAC focused — not general-purpose for GC estimating
- Desktop-centric with limited cloud collaboration
- No BIM/IFC support
- Limited market visibility compared to major competitors

**Key differentiators:**
- MEP/HVAC automatic fittings and fitting calculation — unique to specialty trade work

---

### Buildxact

**Platform:** Web-based (cloud-native), mobile app available

**Pricing:** Foundation $199/month, Pro $399/month, Master $599/month — all unlimited users, annual billing.

**Strengths:**
- Live real-time dealer pricing integration including Home Depot Pro catalog
- Residential-focused templates and assemblies tuned for home building and remodeling
- Unlimited users on all tiers — economics favor growing teams
- AI estimating assistant "Blu" for natural language estimate generation
- Full project management in same tool (scheduling, invoicing, client portal)
- Forbes Best Construction Estimating Software 2024

**Weaknesses:**
- No BIM, IFC, or 3D support — 2D plans only
- Limited to residential and light commercial; assemblies biased toward home construction
- Minimal integrations outside Home Depot and basic accounting
- Less powerful measurement tools than STACK or PlanSwift
- Not suitable for complex commercial or industrial projects

**Key differentiators:**
- Live retail pricing integration (Home Depot Pro real-time catalog) is genuinely unique
- Flat unlimited-user pricing at the lowest absolute price point in the market

---

### ConEst (ConstructConnect)

**Platform:** Desktop (Windows); some cloud features

**Pricing:** Quote-based; some sources cite ~$299/month flat rate.

**Strengths:**
- Purpose-built for electrical contractors with NEC-compliant cost databases
- NEC-based wire/conduit inference: auto-calculates conduit runs, fittings, and wire quantities from device counts
- IntelliBid delta tracking for managing mid-bid addenda
- ConstructConnect bid board integration (825,000+ active projects)

**Weaknesses:**
- Electrical-only — cannot be used for architectural or general construction work
- Desktop application with limited remote access
- No BIM or IFC support
- Quote-based pricing, not self-serve

**Key differentiators:**
- NEC-based automatic inference of conduit and fitting quantities from device counts — unique in the electrical trade

---

### On Center Software / On-Screen Takeoff (ConstructConnect)

**Platform:** Desktop (Windows) — 30-year-old product

**Pricing:** Quote-based; ~$299/month flat or per-seat.

**Strengths:**
- Takeoff Boost AI: automatically separates gypsum board from ACT ceilings; takes off both sides of walls for painting trades
- Multi-condition takeoff: measure same area under multiple conditions simultaneously
- 30-year market presence with large installed base in commercial specialty trades
- ConstructConnect ecosystem (project intelligence, bid board)
- Auto-count for objects, annotations, and callouts

**Weaknesses:**
- Windows desktop only — no remote access, no mobile, no web
- Dated UI; update cadence slow post-acquisition
- No BIM or IFC support
- Requires Quick Bid add-on for estimating; takeoff only in base
- User complaints about stagnant development
- Not self-serve pricing

**Key differentiators:**
- Multi-condition takeoff is the most sophisticated measurement model in the 2D-desktop tier
- Takeoff Boost AI condition separation is genuinely useful for painting and drywall trades

---

## Feature Comparison Matrix

| Feature | PlanSwift | Bluebeam Revu | STACK | CostX | Autodesk Takeoff | Aruct (Proposed) |
|---|---|---|---|---|---|---|
| 2D PDF takeoff | ✓ | ✓ | ✓ | ✓ | ✓ | Phase 2 (overlay) |
| 3D BIM takeoff | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ (native, Phase 1) |
| IFC import | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ (Phase 1) |
| Live scene graph integration | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (unique) |
| Real-time quantity updates on model edit | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (unique) |
| Cloud-native collaboration | ✗ | Partial | ✓ | ✗ | ✓ | ✓ |
| Area / linear / count measurements | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Assembly / trade templates | ✓ (18+) | ✗ | ✓ | ✓ | ✗ | Phase 2 |
| Simultaneous labor + material cost | ✓ | ✗ | Partial | ✓ | ✗ | Phase 2 |
| Cost database (built-in) | ✗ | ✗ | Partial | ✓ | ✗ | Phase 2 (manual); Phase 3 (RSMeans) |
| RSMeans integration | Add-on | ✗ | ✗ | ✓ | Via ProEst | Phase 3 (add-on) |
| BOQ / formal BOM export | ✓ | ✗ | ✓ | ✓ | CSV only | ✓ Phase 1 |
| Excel export | ✓ (bidirectional) | ✓ (Quantity Link) | ✓ | ✓ | ✓ | ✓ Phase 1 |
| JSON / API export | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 1 |
| Revision / delta tracking | ✗ | ✗ | ✗ | ✓ (best-in-class) | ✓ (partial) | Phase 2 |
| Room-by-room breakdown | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ Phase 1 |
| Phase / zone grouping | ✗ | ✗ | ✗ | ✓ | ✓ | Phase 1 |
| BOM-to-3D highlight linkage | ✗ | ✗ | ✗ | ✗ | Partial | ✓ Phase 1 |
| AI auto-count / symbol recognition | ✓ (Boost) | ✗ | ✓ (limited) | ✗ | ✓ (Auto-Count) | Phase 2 |
| Natural language BOM query | ✗ | ✗ | ✗ | ✗ | ✗ | Phase 3 (MCP) |
| Embodied carbon tracking | ✗ | ✗ | ✗ | ✓ | ✗ | Phase 3 |
| Live supplier pricing | ✗ | ✗ | ✗ | ✗ | ✗ | Phase 3 |
| Procore integration | ✗ | ✓ | ✓ | ✗ | ✓ | Phase 2 |
| QuickBooks integration | ✓ | ✗ | ✓ | ✗ | ✗ | Phase 2 |
| MCP server exposure | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Phase 1 |
| Free tier | ✗ | ✗ | ✓ (limited) | ✗ | ✗ | ✓ (read-only) |
| Mac / cross-platform | ✗ | Partial | ✓ | ✗ | ✓ | ✓ |

---

## Recommended Feature Set for Aruct Measure

### Phase 1: MVP (Months 1–6)

**Goal:** Deliver a usable quantity takeoff and BOM from the live Aruct scene that can be exported. Earn first paid users and validate the core value proposition: quantities that are always in sync with the model.

**Quantity Engine (Core)**

Automatic extraction of areas, volumes, and counts from scene graph nodes with no user action required:
- Wall surface area (net of openings) and material volume
- Floor/slab area and volume by material
- Roof area (projected and actual slope area)
- Door and window counts and areas
- Room/space areas derived from enclosed floor regions
- Structural element volumes (columns, beams)

Quantities recalculate on every scene edit via the scene store event system. Each node schema maps to a deterministic quantity formula. Nodes that do not define a formula are excluded from the BOM — the system is additive, not disruptive.

**Scope Control**

- Selection-based takeoff: compute BOM for selected nodes only
- Tag/layer/material-based filtering
- Room/zone grouping: group quantities by enclosed space (auto-detected from geometry or user-defined)
- Phase grouping: assign elements to named phases, filter BOM by phase

**Bill of Materials Output**

Live BOM panel in the editor UI showing quantities grouped by element type and material. Line items include: quantity value, unit (m², m³, m, count), element type, material name, and location/room. Subtotals by material, by room, and by phase. No cost database in MVP — quantity and unit only. The BOM panel is injectable (lives in `packages/editor`) for future embedder use.

**Element-to-3D Linkage**

Hover a BOM line item → corresponding nodes highlight in the 3D view. Hover a node in 3D → see its individual quantity contribution in a tooltip. This bidirectional linkage is the immediate visual proof that the BOM is live and accurate.

**Export**
- CSV export: flat table, one row per line item
- Excel export: multi-sheet workbook (Summary, By Room, By Material, By Phase) via SheetJS
- JSON export: structured BOM for API consumers and MCP integration

**IFC Import (Quantity Side)**

Import an IFC file, extract quantities from IFC property sets (`IfcElementQuantity`) and from geometry. Map IFC element types to Aruct quantity formulas. Display imported-model quantities in the same BOM panel as native scene quantities. IFC parsing via `web-ifc` (IfcOpenShell WebAssembly port) in a Web Worker to keep the main thread responsive.

**Basic UI**
- Measure panel: collapsible side panel with live BOM table and filter controls
- Quick summary card: total GFA, total wall area, total volume at project level
- Export menu integration in the editor toolbar

**MCP Exposure**

Expose `measure://bom` and `measure://rooms` as MCP resources in `packages/mcp` from day one. This enables LLM agents to query project quantities immediately, differentiating Aruct even at MVP stage.

---

### Phase 2: Growth (Months 7–12)

**Goal:** Match the feature set of STACK and PlanSwift so the product is defensible in competitive evaluations. Add cost database support to convert the BOM from a quantity document into a priced estimate.

**Cost Database Integration**

- Built-in material rate library: user-defined unit prices per material, stored in the project document (Yjs-synced)
- Rate import from CSV/Excel: bring-your-own pricing from existing cost libraries
- RSMeans API integration (licensed add-on): auto-populate standard labor and material rates by ZIP code
- Supplier pricing plugin interface: suppliers publish price feeds, users subscribe per material category
- Total cost column: Quantity × Unit Rate = Line Cost with currency formatting
- Rate library shared at org level: set once, use across projects

**Revision / Delta Tracking**

- Named snapshots: save BOM state at design checkpoints with timestamp and description
- Delta report: compare two snapshots — show added, removed, and changed quantities by line item
- Visual diff: highlight changed elements in the 3D view based on delta
- Excel delta export: change tracking table with percentage variance column
- Up to unlimited snapshots (Team tier); 5 snapshots on Pro tier

**Estimating Templates**

- Save BOM grouping structure and rate assignments as a named template
- Apply template to new project: quantities auto-fill from scene, rates pre-populated
- Org-level template library: share across team members

**Room Schedule**

- Automatic space detection from closed room geometry
- Room schedule: area, perimeter, ceiling height, finish quantities per room
- Export as Excel sheet compatible with interior finish specifications

**2D Plan Overlay with Manual Measurement**

- Upload PDF or DWG plan, overlay in 3D view on the existing PDF underlay system
- Manual measurement mode: draw polygons, lines, and count clicks on the 2D overlay
- Manual measurements stored as `MeasurementNode` in the scene graph, contributing to BOM
- Allows hybrid 2D+3D workflows for elements not yet modeled in 3D

**AI Auto-Count**

- Symbol recognition on 2D overlays: identify repeated symbols (doors, windows, fixtures) and count automatically
- Configurable confidence threshold; manual review before committing counts to BOM

**Collaboration**

- Shared BOM via Yjs sync (already in the stack — BOM is computed from the synced scene graph, so collaboration is automatic for computed quantities)
- Rate library changes sync in real-time across users
- Comment on BOM line items: annotate specific quantities with estimating notes
- Assign line items to team members responsible for pricing that section
- Lock BOM for review state (read-only while under QS review)

**Integrations**
- Procore: push quantities to Procore budget line items via Procore API
- QuickBooks: push material costs to QuickBooks job costing
- Zapier webhook: BOM change events trigger downstream automation

---

### Phase 3: Leadership (Months 13–18+)

**Goal:** Build the features that no competitor can replicate because they depend on deep editor integration. Establish Aruct Measure as the definitive 3D-native takeoff tool with no comparable alternative.

**AI Cost Advisor (Design-Phase Feedback Loop)**

- Real-time cost delta in HUD as user places elements: "Adding this wall will increase material cost by $3,200"
- Material alternative suggestions: "Changing exterior cladding from concrete to CLT reduces cost by 18%"
- Budget guardrails: set a budget ceiling; AI warns when edits push project cost over limit
- Natural language BOM query via MCP: LLM agents answer questions like "What is the total cost of all exterior cladding?" using live scene data

**Embodied Carbon Calculator**

- Map each material to an embodied carbon factor (ECF) from a built-in database with custom overrides
- Total embodied carbon per project, per material, per room — displayed alongside cost
- Carbon budget tracking against RIBA 2030 Climate Challenge targets
- Export carbon report alongside BOM for owner or planning authority submission

**5D BIM (Time + Cost)**

- Phase timeline: assign quantities to construction phases with target dates
- Cash flow projection: model when materials will be purchased/installed by phase
- Gantt-linked BOM: filter BOM by phase date range for procurement planning

**Supplier Integration Marketplace**

- Plugin API: suppliers publish real-time price catalogs conforming to `PricingPlugin` interface
- User connects preferred suppliers per material category per project or at org level
- Procurement list: convert BOM to supplier-ready order list with SKUs, quantities, and live prices
- Quote request: send BOM to multiple suppliers, receive quotes back in-app
- Side-by-side supplier quote comparison

**Advanced IFC / BIM Sync**

- Bidirectional IFC sync: push Aruct quantities back into IFC property sets for QS-compliant deliverables
- Live watch mode: if IFC file updates (from Revit or ArchiCAD), quantities re-extract automatically
- IFC property mapping UI: user defines which IFC properties map to which Aruct quantity formulas

**PDF Report Builder**

- PDF report generator: cover page, project summary, detailed BOM by trade, room schedule, carbon summary
- Branded templates with org logo, color scheme, and signature block
- Client-facing vs. internal report variants
- Revision history included in formatted report

**Full API and MCP Integration**

- REST API: expose BOM data with full CRUD for external estimating systems (RSMeans, Sage, Viewpoint)
- Extended MCP resources: `measure://bom`, `measure://rooms`, `measure://delta`, `measure://snapshot/{id}`, `measure://carbon`
- MCP tools: `measure_compute_bom`, `measure_export_excel`, `measure_create_snapshot`, `measure_get_delta`, `measure_query_carbon`
- TypeScript SDK: client library for building custom integrations and embedder workflows

---

## Technical Architecture

### Core Quantity Engine

**Location:** `packages/core` — pure TypeScript computation system with zero rendering dependencies. Must not import Three.js or any viewer/editor concepts.

**Directory structure:**

```
packages/core/src/quantity/
├── QuantityEngine.ts          # Orchestrator: subscribes to scene events, triggers recomputation
├── BOMStore.ts                # Zustand store: materialized view of current BOM
├── QuantityTypes.ts           # TypeScript types: QuantityRecord, BOMLine, BOMGroup, Snapshot
├── DeltaComputer.ts           # Snapshot comparison: produces DeltaReport
├── NodeComputers/
│   ├── WallQuantityComputer.ts
│   ├── FloorQuantityComputer.ts
│   ├── RoofQuantityComputer.ts
│   ├── RoomQuantityComputer.ts
│   ├── DoorWindowQuantityComputer.ts
│   └── MeasurementNodeQuantityComputer.ts   # for manual 2D measurements
└── ExportAdapters/
    ├── CSVAdapter.ts
    ├── JSONAdapter.ts
    └── IFCPropertySetWriter.ts              # Phase 3
```

**Event flow:** `sceneStore.nodeChanged` → `QuantityEngine.recompute(affectedNodes)` → `BOMStore.update()` → UI re-renders BOM panel.

**Key design decisions:**

- Quantities are computed values, not stored state. The scene graph is the source of truth. The BOM is a materialized view — always derivable from the scene.
- Incremental recomputation: only nodes that changed are recomputed. A 10,000-node scene does not fully recompute on every edit.
- Each node schema gains an optional `quantityComputer` export. Nodes without one are excluded from the BOM. The quantity system is additive and does not require schema migration for existing nodes.
- Deterministic quantity ID (`nodeId + quantityType`) enables straightforward delta comparison between snapshots.
- Snapshots are serialized BOM states stored in the Yjs project document (not recomputed from scene at read time).

**IFC Integration:**

Parse IFC via `web-ifc` (IfcOpenShell's WebAssembly port) in a Web Worker. Extract from both `IfcElementQuantity` property sets and from geometry (computed area, volume). Map IFC element GUIDs to Aruct node IDs when the model was originally imported from IFC, enabling bidirectional sync in Phase 3.

**Rate Library Schema:**

```typescript
interface RateRecord {
  materialId: string;
  unitRate: number;
  currency: string;
  source: 'manual' | 'rsm_means' | 'supplier' | 'import';
  lastUpdated: number; // Unix timestamp
  ttl?: number;        // for cached RSMeans rates
}
```

Stored in the Yjs project document so it syncs automatically across collaborators.

**Excel Export:**

SheetJS (`xlsx`) in `packages/editor` or `apps/editor`. Multi-sheet workbook: Summary, By Room, By Material, By Phase, Delta (when comparing snapshots). Target: <3 seconds for a 5,000-line BOM.

**Performance targets:**

| Operation | Target |
|---|---|
| BOM computation (10,000 node scene) | <500ms |
| IFC import quantity extraction (50MB) | <10s (Web Worker) |
| Excel export generation | <3s |
| Incremental recompute (single node edit) | <50ms |
| Quantity accuracy vs. manual remeasure | Within 2% for standard geometry |

---

## Integration with Aruct Editor

### `packages/core` Changes

- `src/quantity/` directory: new subsystem (described above)
- Each node schema in `src/schemas/` gains an optional `quantities` export
- `src/events/` gains `QuantityChanged` and `SnapshotCreated` event types
- `MeasurementNode` schema: new node type for manual 2D measurements (polygon, line, count-point)
- `BOMStore` is a new Zustand store exported from `packages/core` alongside `sceneStore`

### `packages/viewer` Changes

The viewer needs one new rendering capability: a "measure highlight" state on nodes, visually distinguishing nodes when a BOM line item is hovered. This is an extension of the existing selection/hover state system.

New state: `measureHighlighted: Set<NodeId>` passed as a prop to `<Viewer>`. The viewer renders highlighted nodes with a distinct color (e.g., amber overlay, distinct from the blue selection highlight). A `useMeasureHighlight(nodeIds)` hook is exposed so the Measure panel in `apps/editor` can drive highlights declaratively.

**Viewer isolation rule maintained:** the viewer has no knowledge of BOM or quantities. It only knows about node highlight states passed via props. The BOM logic lives entirely in `packages/core` and `packages/editor`.

### `packages/editor` Changes

- `MeasurePanel`: new injectable panel (similar pattern to existing outliner/comments panels). Renders the live BOM table with filter controls, grouping selectors, and export actions. Lives in `packages/editor` for embedder reuse.
- `RateLibraryPanel`: material rate editor panel.
- `BOMDiffPanel`: snapshot selector and delta view component.
- `ExportMenu`: Measure-specific export actions (CSV, Excel, JSON) added to the existing export menu.

### `apps/editor` Changes

- `MeasureTool`: registered in the editor tool system. Activates manual measurement mode when PDF overlay is active. Lives in `apps/editor/src/tools/`.
- Keyboard shortcut: `M` to open Measure panel (aligned with common industry shortcut).
- PDF underlay extended with measurement polygon interaction: MeasureTool creates `MeasurementNode` objects from 2D clicks on the overlay plane.

### `packages/mcp` Changes

New MCP resources and tools:

```
Resources:
  measure://bom                    — full current BOM as structured JSON
  measure://rooms                  — room schedule
  measure://delta                  — most recent delta (if snapshots exist)
  measure://snapshot/{id}          — historical snapshot by ID

Tools:
  measure_compute_bom              — trigger recomputation and return BOM
  measure_export_excel             — generate and return Excel file
  measure_create_snapshot          — save named snapshot, return id
  measure_get_delta                — compare two snapshots, return DeltaReport
  measure_query_carbon             — return embodied carbon report (Phase 3)
```

Project document schema in `packages/mcp` gains a `quantitySnapshots` collection.

### Plugin System (Phase 3)

Supplier pricing plugins implement `PricingPlugin`:

```typescript
interface PricingPlugin {
  getRate(spec: MaterialSpec): Promise<PriceQuote>;
  getSupportedMaterials(): MaterialSpec[];
  getSupplierMeta(): SupplierMeta;
}
```

Plugins are registered via the plugin marketplace, activated per-org. The rate library resolves rates by checking active pricing plugins before falling back to manual rates, following a priority chain: `supplier plugin > rsm_means > manual > default`.

### PDF Underlay (Existing)

The existing PDF underlay system (already in the codebase, per commit `df81acc1`) is extended with a "measure mode" interaction layer. When `MeasureTool` is active, clicks on the underlay plane create `MeasurementNode` objects rather than placing scene elements. These nodes contribute to the BOM like any other node and sync via Yjs.

---

## Pricing Strategy

### Competitor Pricing Benchmarks

| Tool | Price | Model |
|---|---|---|
| Bluebeam Revu | $260–$590/user/year | Per seat |
| PlanSwift | $1,749–$2,000/user/year | Per seat |
| Autodesk Takeoff | $1,290/user/year (+ $5,000/year for estimating) | Per seat |
| STACK | $2,988–$3,588/user/year | Per seat |
| ProEst | $5,000/year flat | Unlimited users |
| Buildxact | $199–$599/month flat | Unlimited users |
| RIB CostX | ~$2,599+/year | Per seat + server |
| Sage Estimating | $5,000–$20,000+/year | Per seat |

### Recommended Aruct Pricing

**Core principle:** Aruct Measure is not sold standalone. It is a module within the Aruct platform. This is a structural pricing advantage — no competitor bundles their measurement tool with the design tool. Aruct charges for the full design + takeoff workflow at a price that undercuts competitors for takeoff alone.

**Aruct Free**

Measure panel visible and auto-computes quantities in read-only mode. Users see the BOM form as they design — no export, no cost rates, no snapshots. Creates awareness and conversion pull without giving away the full product. Positions Aruct as the tool where you can see your quantities forming in real time, even before you upgrade.

**Aruct Pro — $49/user/month ($490/user/year)**

Full Phase 1 MVP Measure module included:
- All quantity types, live BOM panel, element-to-3D highlight linkage
- CSV and Excel export
- JSON export + MCP resource access
- IFC import quantities
- Room-by-room breakdown and phase grouping
- Manual rate entry (basic rate library)
- Up to 5 named BOM snapshots

Rationale: $490/user/year is 3.4× cheaper than Autodesk Takeoff ($1,290) and 6× cheaper than STACK ($2,988), while including the full 3D design tool plus live BIM-integrated takeoff — functionality that requires both an Autodesk Takeoff license AND a Revit license to replicate in the competitor stack.

**Aruct Team — $99/user/month ($990/user/year), minimum 3 seats**

Full competitive parity (Phase 1 + Phase 2 features):
- Unlimited BOM snapshots and delta reports
- Cost database: CSV import, manual rate library, supplier plugin connections
- Phase grouping and Gantt view
- Collaboration: BOM comments, assignments, review lock state
- Estimating templates (org-level library)
- Procore and QuickBooks integration
- AI auto-count on 2D overlays
- API access (REST endpoints for BOM data)
- 2D plan overlay with manual measurement mode

At 3 seats, Team is $2,970/year versus STACK at $8,964–$10,764/year for 3 seats. The economic case is a 66%–72% saving for equivalent or superior functionality. This is the primary STACK switcher pricing argument.

**Aruct Enterprise — Custom pricing**

Phase 3 leadership features for large GCs, QS firms, and design-build practices:
- RSMeans integration (licensed add-on, pass-through ~$1,200/org/year)
- Supplier marketplace and real-time pricing
- Embodied carbon calculator and carbon budget tracking
- 5D phase timeline and cash flow projection
- PDF report builder with org branding
- Bidirectional IFC sync
- Full MCP server access and TypeScript SDK
- SSO/SAML, audit logs, SLA, dedicated onboarding

**Add-On: RSMeans Database** — $1,200/org/year (pass-through licensing plus margin). Positioned as an add-on rather than tier-included to avoid the licensing cost compressing margins on smaller accounts. Attach target: 25% of Enterprise accounts.

**Key Strategic Insights**

- STACK's 40–50% renewal hikes are creating documented churn. Price aggressively on the Team tier to capture switchers with a clear "66% cheaper, does more" message.
- Autodesk Takeoff requires Takeoff ($1,290/user/year) + ProEst ($5,000+/year) for a priced estimate. Aruct Team at $990/user/year delivers both for a single team, without Autodesk ecosystem lock-in.
- Buildxact's unlimited-user flat pricing is consistently cited as a reason for adoption. Match this model at Team tier.
- The free tier with live (read-only) BOM is a conversion mechanism: users who see quantities updating as they design are primed to upgrade to export and price those quantities.

---

## Success Metrics

### Adoption Metrics

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|---|---|---|---|
| Users opening Measure panel (% of Pro MAU) | 20% | 40% | 60% |
| Users exporting BOM at least once/month | 10% of Pro MAU | 25% of Pro MAU | 40% of Pro MAU |
| Users with active rate library | — | 15% of Team MAU | 35% of Team MAU |
| Projects with BOM snapshots | — | 20% of Team projects | 45% of Team projects |

### Conversion Metrics

| Metric | Target |
|---|---|
| Free → Pro conversions attributed to Measure | 15% of all Free→Pro conversions |
| Measure cited as primary upgrade reason | >20% of Pro upgrade surveys |
| Team tier accounts using Measure monthly | >80% |
| Enterprise deals citing Measure as key requirement | >50% of closed deals |

### Quality Metrics

| Metric | Target |
|---|---|
| Quantity accuracy vs. manual remeasure (standard geometry) | Within 2% |
| BOM computation time (10,000 node scene) | <500ms |
| IFC quantity extraction (50MB file) | <10s |
| Excel export generation | <3s |
| User-reported quantity errors per 1,000 active users/month | <5 |

### Revenue Metrics

| Metric | Target |
|---|---|
| Measure-attributed incremental ARR | $500K end of Phase 1; $3M end of Phase 2 |
| Average revenue per Measure-active user vs. non-Measure | 1.4× (validates bundle premium) |
| RSMeans add-on attach rate at Enterprise | 25% |

### Competitive Metrics

| Metric | Target |
|---|---|
| Win rate vs. STACK in head-to-head evaluations | >40% |
| Win rate vs. PlanSwift | >50% |
| Accounts self-reporting "switched from PlanSwift/STACK" | 10% of new Measure accounts by Phase 2 |
| Measure NPS | >45 |

---

## Implementation Timeline

### Phase 1: MVP — Months 1–6

**Team:** 2–3 engineers. Builds on existing scene graph, Yjs sync, and PDF underlay infrastructure.

| Milestone | Month | Deliverable |
|---|---|---|
| Quantity type definitions | 1 | `QuantityTypes.ts`, quantity formulas for Wall, Floor, Roof, Room, Door, Window |
| Core quantity engine | 1–2 | `QuantityEngine.ts`, `BOMStore.ts`, event subscriptions, incremental recompute |
| BOM panel UI | 2–3 | Measure panel in `packages/editor`, live BOM table, grouping controls |
| BOM-to-3D highlight | 3 | `measureHighlighted` state in viewer, hover linkage |
| CSV + JSON export | 3 | Export adapters, export menu integration |
| Excel export | 4 | SheetJS multi-sheet workbook |
| IFC import quantities | 4–5 | web-ifc Web Worker, property set extraction, element mapping |
| MCP resources | 5 | `measure://bom`, `measure://rooms` resources in `packages/mcp` |
| QA + performance | 5–6 | Accuracy validation, <500ms target, user testing with 3 beta customers |
| Phase 1 launch | 6 | GA on Pro tier, free tier read-only BOM |

**Exit criteria:** 10 Pro accounts actively using Measure monthly; BOM accuracy within 2% on 5 tested project types; compute time <500ms on reference scene.

### Phase 2: Growth — Months 7–12

| Milestone | Month | Deliverable |
|---|---|---|
| Rate library (manual + CSV import) | 7–8 | Rate schema, rate editor UI, cost column in BOM |
| BOM snapshot + delta | 8–9 | Snapshot storage in Yjs, `DeltaComputer.ts`, delta UI |
| Room schedule export | 9 | Room schedule sheet in Excel export |
| 2D overlay measurement | 9–10 | `MeasureTool`, `MeasurementNode` schema, overlay interaction |
| AI auto-count | 10–11 | Symbol recognition on 2D overlays |
| Collaboration features | 11 | BOM comments, assignments, review lock |
| Procore integration | 11–12 | Budget line item push via Procore API |
| QuickBooks integration | 12 | Job costing push |
| Phase 2 launch | 12 | Team tier feature set complete |

**Exit criteria:** 40% of Pro MAU using Measure; 3 documented STACK or PlanSwift switchers; win rate >40% in competitive evaluations.

### Phase 3: Leadership — Months 13–18+

| Milestone | Month | Deliverable |
|---|---|---|
| Cost advisor HUD | 13–14 | Real-time cost delta display during model editing |
| RSMeans integration | 14–15 | Licensed API integration, org-level add-on |
| Embodied carbon | 15–16 | ECF database, carbon column in BOM, carbon report export |
| 5D phase timeline | 16–17 | Phase date assignments, cash flow projection |
| Supplier marketplace plugin API | 17–18 | `PricingPlugin` interface, marketplace registration, quote comparison |
| PDF report builder | 18 | Branded PDF report with cover, BOM, room schedule, carbon summary |
| Bidirectional IFC sync | 18 | IFC property set writer, live watch mode |
| MCP tools (extended) | 18 | Full MCP tool set, TypeScript SDK |

**Exit criteria:** Enterprise accounts representing >$1M ARR using Phase 3 features; NPS >45; Measure cited in >50% of Enterprise closed deals.
