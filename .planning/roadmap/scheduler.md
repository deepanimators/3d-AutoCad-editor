# Aruct Scheduler: Market Research & Implementation Roadmap

> Project scheduling & Gantt

## Executive Summary

The construction scheduling software market is at an inflection point. Every capable 4D BIM tool (Synchro, Navisworks) is desktop-only, costs $3,000-$5,000 per user annually, and requires months of specialist training. The mid-market — general contractors running $10M-$200M projects — has no viable web-native option that combines a real CPM engine with genuine 3D model visualization. Procore Scheduling reached general availability in February 2026 and still lacks a true forward/backward pass CPM engine. Microsoft Project Online retires September 30, 2026, displacing hundreds of thousands of construction teams to a task manager (Planner) that cannot compute critical path. These gaps are not incremental — they represent a structural market failure that Aruct is positioned to resolve.

Aruct Scheduler's defensible differentiation is straightforward: it is the only web-native tool that combines a real CPM scheduling engine with native 4D BIM visualization, built directly on top of an existing 3D scene graph. Competitors that offer 4D (Synchro, Navisworks) require desktop software, specialist licenses, and separate scheduling tools. Competitors that offer web-based scheduling (Procore, Planera, Monday.com) have no BIM integration. Aruct's Three.js canvas, Yjs real-time sync, and IFC import pipeline are already in the codebase — the 4D scheduler is a high-leverage extension of existing infrastructure, not a greenfield product.

The recommended approach is phased: ship the only web-native CPM + 4D visualization tool in six months (MVP), reach feature parity with P6 and MS Project at one-third the cost by Month 12, and deploy AI-driven schedule generation and forensic delay analysis in Months 13-24. Pricing should be structured as a premium add-on to Aruct Pro, targeting an all-in cost of $780-$1,080/month for a 10-person GC team — well below the $9,960+/year for two Synchro seats alone, and dramatically below the full P6 + Synchro stack at $7,000-$10,000 per user per year.

---

## Market Overview

The construction scheduling software market was valued at **$2.81 billion in 2025** and is projected to reach **$6.75 billion by 2034**, compounding at approximately 10.2% CAGR. The broader BIM software market — the technological enabler for 4D scheduling — was valued at **$9.70 billion in 2025** and is forecast at **$23.74 billion by 2033** (CAGR 11.8%).

The 4D BIM scheduling segment specifically accounts for approximately **32% of the global BIM market in 2025**, representing roughly **$1.79 billion**, and is growing faster than the overall market. This acceleration is driven by mandated BIM requirements from government clients (UK BIM Level 2, EU Directive 2014/24/EU, Singapore BIM Roadmap, Australian Digital Engineering Policy) and demonstrated project ROI: case studies from Synchro 4D and Navisworks TimeLiner consistently cite **20-40% schedule overrun reduction** when 4D BIM is deployed at preconstruction.

Cloud-based deployment now holds **58.4% market share** in construction scheduling, reflecting the industry's accelerating SaaS adoption following the COVID-era remote work shift. North America leads at **46.5% of global BIM revenue**, with Asia-Pacific growing fastest at **16% CAGR** driven by Singapore, Australia, and Hong Kong government mandates.

Key structural trends shaping the market:

- **Desktop incumbents are not moving fast enough to web.** Synchro's web layer (Synchro Control) handles progress updates but not schedule creation. Navisworks has no web version at all. This creates a sustainable first-mover advantage for a web-native entrant.
- **The MS Project Online retirement (September 30, 2026)** is the largest near-term demand event. Microsoft's stated replacement is Planner — a task manager with no CPM engine — leaving mid-market GCs actively shopping for alternatives in Q4 2026.
- **Procore's scheduling module immaturity** leaves 16,000+ Procore customers underserved. Procore Scheduling has no CPM engine, no electronic schedule export, and no DCMA-14 quality checks as of GA.
- **AI integration** is the next major differentiator. Planera has deployed an AI scheduling assistant (Manny). ALICE Technologies generates and simulates thousands of construction sequences automatically. Any new entrant must plan for AI-assisted schedule generation in its 18-month roadmap or risk appearing dated at launch.

---

## Competitor Analysis

### Oracle Primavera P6

**Platform:** Desktop (Windows) primary; web-based P6 EPPM for portfolio views; limited mobile.

**Pricing:** P6 Professional ~$2,150/user/year (subscription) or ~$3,520 one-time perpetual + $774/year maintenance. EPPM (cloud enterprise) $3,000-$5,000/user/year. Custom enterprise agreements are common on mega-projects.

**Strengths:**
- The undisputed industry standard for mega-projects and government contracts (USACE, DOE, DOD, DOT, FAA)
- Full CPM engine: forward/backward pass, six activity types, global change commands
- Handles 100,000+ activities per project without performance degradation
- ANSI/EIA-748 compliant Earned Value Management built in
- Monte Carlo risk simulation included
- Portfolio management across millions of activities
- Claim Digger forensic delay comparison tool
- Certified scheduler community (PMI-SP, AACEI PSP) creates an ecosystem of trained users

**Weaknesses:**
- Steep learning curve: 2-4 weeks structured training, $2,000-$8,000 per person for certification
- Dated UI that has not materially changed in a decade
- No built-in timesheets
- No native 4D BIM visualization (requires Synchro 4D or Navisworks as a separate product)
- Desktop-first; Primavera Cloud lags significantly behind P6 Professional in features
- No field-to-office workflow or daily log integration
- No native RFI or submittal management

**Key differentiators:**
- Contract requirement on most public-sector and government projects; not discretionary for many users
- Handles scale (100K+ activities) that no other tool matches
- ANSI EVM compliance is mandatory for many federal contractors

---

### Microsoft Project (Plan 1/3/5 + Desktop)

**Platform:** Desktop (Windows) + web (Plan 1, limited CPM). Mobile app available on iOS and Android.

**Pricing:** Plan 1 $10/user/month (web only, basic), Plan 3 $30/user/month (full CPM desktop), Plan 5 $55/user/month (portfolio). Desktop perpetual: $679.99-$1,129.99. **Project Online retires September 30, 2026.**

**Strengths:**
- Lowest entry cost for true CPM scheduling with familiar Microsoft 365 UX
- Integrates natively with Teams, Excel, SharePoint, Power BI
- MPP file format is universally accepted (Synchro, Navisworks, Asta, Procore all import it)
- Available as part of Microsoft 365 enterprise agreements
- All four CPM dependency types supported

**Weaknesses:**
- Practical activity limit ~10,000 before performance degrades severely
- Logic relationship stability issues with SS/SF/FF in some versions
- No construction-specific workflows (RFIs, submittals, daily logs)
- No 4D BIM visualization
- No forensic delay analysis tools
- Basic resource leveling requiring frequent manual intervention
- **Project Online retires September 30, 2026** — Microsoft's replacement (Planner) has no CPM engine, creating a large active switcher population

**Key differentiators:**
- Microsoft 365 ecosystem lock-in is both its strength and its limitation
- MPP format universality means P6, Synchro, and Navisworks users often produce an MS Project export for owner reporting, creating a widespread format dependency

---

### Synchro 4D (Bentley Systems)

**Platform:** Desktop (Windows) primary. Synchro Control is cloud-based for collaboration and progress tracking. Limited mobile.

**Pricing:** ~$4,980/year per Virtuoso subscription (includes 5 training credits). 4D Practitioner license approximately €4,375/year. Enterprise contracts negotiated separately. Some listings show $4,280/year.

**Strengths:**
- The only tool combining a full CPM engine with deep 4D BIM visualization in one application
- Can break design models into constructible components for phased sequencing
- Handles complex civil infrastructure (tunnels, bridges, highways) better than any other tool
- Imports IFC, Revit, DGN, DWG for models AND imports XER, MPP, Asta for schedules
- Bentley iTwin platform ecosystem for civil infrastructure clients
- Virtuoso subscription includes training credits reducing total cost of ownership

**Weaknesses:**
- Desktop-only for schedule creation and 4D editing; web access limited to Synchro Control (progress only)
- Steep learning curve comparable to P6 — not self-service
- UI is functional but not modern
- High cost makes it inaccessible for mid-market teams who only need 4D for presentations
- Not suitable for residential or small commercial projects
- No RFI/submittal integration
- Separate product from the CPM tools (P6, MS Project) most teams already use

**Key differentiators:**
- The only desktop 4D BIM tool with a genuine CPM engine (not just visualization overlay)
- Bentley ecosystem integration for civil infrastructure is unmatched
- Market leader for 4D BIM on mega-infrastructure projects globally

---

### Autodesk Navisworks (Manage/Simulate) — TimeLiner

**Platform:** Desktop (Windows) only. Navisworks Freedom is a viewer only, not editable. No web or mobile editing capability.

**Pricing:** Navisworks Manage $355/month or $2,835/year standalone. Included in AEC Collection at $335/month for the full Autodesk AEC suite.

**Strengths:**
- Unmatched model aggregation — opens 200+ file formats (IFC, Revit, DWG, DGN, Sketchup, etc.)
- De-facto standard for coordination and clash detection on commercial projects in the Autodesk ecosystem
- Lower cost than Synchro makes 4D BIM more accessible for Autodesk-centric teams
- Integrates natively with Revit and AutoCAD
- Large installed base and trained user community

**Weaknesses:**
- TimeLiner is a visualization tool, not a scheduling engine — it cannot define durations or dependencies
- Cannot perform CPM calculations; scheduling must be done externally (P6 or MS Project) and imported
- Cannot export a modified schedule back to XER or MPP from TimeLiner
- Desktop-only with no web or field access
- Clash detection and 4D are separate, disconnected workflows
- No field progress update capability
- No earned value or resource leveling

**Key differentiators:**
- Best multi-format model aggregation in the industry — genuinely opens any file
- Clash detection remains the primary use case; 4D is secondary and underutilized by most Navisworks users

---

### Procore Scheduling

**Platform:** Web-based. iOS and Android mobile apps with offline capability.

**Pricing:** Procore priced by Annual Construction Volume (ACV), not per seat; scheduling included in the platform contract. Independent estimates: $10,000-$80,000+/year depending on ACV. No standalone scheduling purchase.

**Strengths:**
- Fully embedded in Procore — the market-leading construction management platform with 16,000+ contractor customers
- Scheduling tied to drawings, RFIs, and submittals is a genuinely differentiated field workflow (when functional)
- Unlimited users included in Procore contract
- 500+ marketplace integrations
- Mobile-first field access
- Native imports P6 XER and MS Project MPP

**Weaknesses:**
- Does not perform forward/backward pass CPM calculations — critical path is a visual toggle, not computed
- No electronic schedule export (PDF only; no XER, MPP, or XML output)
- No data date support
- No DCMA-14 quality checks
- No audit trail on schedule changes
- RFI/submittal integration was non-functional at GA (February 2026)
- Advanced CPM, resource leveling, variance analysis, and forensics require importing from P6 or MS Project
- Cannot be used as a standalone scheduling tool

**Key differentiators:**
- The only scheduling tool where tasks connect directly to RFIs, submittals, and daily logs in the same platform
- ACV-based pricing creates pricing parity for large teams relative to per-seat tools

---

### Asta Powerproject (Elecosoft)

**Platform:** Desktop (Windows) primary. Asta Enterprise for server-based multi-user. Asta SiteProgress as mobile companion for field.

**Pricing:** $1,675-$2,500/user/year (single-user license). Asta Enterprise and additional modules (4D, SiteProgress, Vision) add cost. Approximately 50% of Primavera P6 cost for comparable CPM capability.

**Strengths:**
- Full CPM engine with all dependency types, unlimited baselines, scenario comparison
- Strongest 4D BIM integration of any traditional CPM tool outside Synchro
- Line of Balance (LoB) for repetitive/location-based work (housing estates, road sections, floors) — unique among mid-market tools
- Asta SiteProgress enables field mobile progress updates
- More affordable than P6 at similar CPM depth
- Strong in UK civil engineering market

**Weaknesses:**
- Desktop-first; multi-user requires Asta Enterprise (additional license)
- Web access limited
- Less global brand recognition (strong UK/Europe, weaker North America/APAC)
- Learning curve comparable to P6 (4-8 weeks for proficiency)
- 4D BIM viewer less sophisticated than Synchro's animation and simulation capabilities
- Limited broader integration ecosystem compared to Procore or Autodesk

**Key differentiators:**
- Line of Balance support is unique among mid-market tools and highly valued for repetitive construction
- Best value CPM tool for teams that need P6-level rigor at half the price, particularly in UK/EU markets

---

### Buildertrend

**Platform:** Web-based. iOS and Android mobile with offline support.

**Pricing:** Essential $339/month (annual), Advanced $499/month (annual), Complete $829/month (annual). Unlimited users and projects on all plans.

**Strengths:**
- Best client-facing scheduling experience — homeowners log in and see their build schedule in plain language
- Subcontractor portals reduce phone-call scheduling overhead significantly
- Unlimited users and projects across all plans
- Estimating-to-schedule workflow designed for residential production
- Strong warranty and selections management post-contract
- Photo uploads and daily logs integrated with scheduling

**Weaknesses:**
- Not true CPM — dependency calendar cascade, not forward/backward pass CPM
- No critical path visualization
- No baselines beyond snapshot comparison
- No resource leveling
- No earned value metrics
- No 4D BIM integration
- Primarily residential; light commercial use possible but the tool is not designed for it
- No forensic delay analysis

**Key differentiators:**
- Homeowner/client portal is genuinely best-in-class — no other scheduling tool prioritizes the client experience this way
- Production builder workflow (templates, selections, warranty) is not replicated in CPM tools

---

### Monday.com (Construction use)

**Platform:** Web-based. iOS and Android mobile.

**Pricing:** Basic $9/user/month, Standard $12/user/month, Pro $19/user/month, Enterprise custom. Free plan available for up to 2 users.

**Strengths:**
- Fastest onboarding — non-technical PMs reach basic proficiency in days
- Extreme flexibility via column customization and construction templates
- Strong automation engine for notifications and approvals
- 250+ integrations including Procore, Jira, Salesforce, Slack, Google Workspace
- Free plan for small teams
- Critical path highlighting (Pro tier)

**Weaknesses:**
- Not construction-specific — requires manual configuration to match construction workflows
- No CPM scheduling engine (critical path is visual, not computed)
- No resource leveling
- No cost-loaded scheduling
- No earned value metrics
- No BIM integration
- No RFI/submittal management
- Performance degrades on large boards
- Key features (critical path, baselines) locked behind Pro tier
- Not suitable for contract schedule submittals

**Key differentiators:**
- Cross-functional visibility appreciated by owners and design teams who do not need CPM rigor
- Fastest tool to evaluate during preconstruction bid work or owner-side project tracking

---

### Smartsheet (Construction use)

**Platform:** Web-based. iOS and Android mobile.

**Pricing:** Pro $9/user/month (max 10 users), Business $19/user/month, Enterprise custom. Resource management and analytics add-ons at additional cost. 30-day free trial. No free plan.

**Strengths:**
- Spreadsheet paradigm accelerates adoption for Excel-heavy teams
- Strong automation engine — conditional alerts, approval workflows, automated row updates
- Resource management and cost management modules more capable than Monday.com for project controls
- DocuSign and Power BI integration well-suited for corporate PMO workflows
- Procore integration available

**Weaknesses:**
- Not construction-specific
- No true CPM forward/backward pass engine
- Dependency types limited relative to CPM tools
- No BIM integration
- No earned value
- No RFI/submittal tools
- Manual adjustments frequently required when dependencies are enabled
- No free plan

**Key differentiators:**
- The corporate PMO alternative — preferred by owners and design firms over GC-centric tools
- Strongest spreadsheet-to-Gantt transition for teams currently managing schedules in Excel

---

### Planera

**Platform:** Web-native. Tablet-optimized.

**Pricing:** Volume-based with unlimited users. Specific pricing not publicly listed; enterprise sales motion.

**Strengths:**
- Modern web-native CPM tool — the closest current alternative to P6 for teams wanting contemporary UX
- AI scheduling assistant (Manny) for natural language schedule queries and generation
- Full CPM engine with DCMA-14 compliance checks
- XER/MPP/XML export (the gap Procore Scheduling has)
- Native Procore integration (bidirectional)
- Tablet-optimized for field use

**Weaknesses:**
- No 4D BIM visualization
- SmartPM scored it 60/100 for analytics capability, citing gaps in earned value and forensic analysis
- Limited brand recognition vs. P6, MS Project, or Procore
- Enterprise sales motion means slow onboarding for SMB teams

**Key differentiators:**
- The best current web-native P6 alternative and the most direct competitive overlap with Aruct Scheduler's Phase 1 target
- AI scheduling assistant is a genuine differentiator that Aruct must match or exceed in Phase 3

---

### SmartPM

**Platform:** Web-based.

**Pricing:** Essentials $12,000/year, Controls $25,000/year. Enterprise custom.

**Strengths:**
- 35+ CPM quality checks (DCMA-14 and beyond)
- Forensic delay analysis with automated retrospective critical path comparison
- Automated S-curves and schedule health scoring
- FedRAMP High authorized — required for federal projects
- Strong analytics layer for owners and project controls professionals

**Weaknesses:**
- Not a schedule creation tool — requires importing from P6 or MS Project
- High price point ($12K-$25K/year) limits adoption to large GCs and owner organizations
- No 4D BIM
- No field workflow
- Analytics-only positioning means it supplements, not replaces, scheduling tools

**Key differentiators:**
- The best-in-class analytics layer for schedule quality and delay forensics — Aruct Scheduler should aspire to match this capability in Phase 2-3
- FedRAMP High authorization is a requirement Aruct would need for federal market entry

---

## Feature Comparison Matrix

| Feature | Primavera P6 | Microsoft Project | Synchro 4D | Navisworks TimeLiner | Procore Scheduling | Asta Powerproject | Aruct (Proposed) |
|---------|-------------|-------------------|------------|---------------------|-------------------|------------------|-----------------|
| **Scheduling Engine** | | | | | | | |
| True CPM (forward/backward pass) | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ (Phase 1) |
| All 4 dependency types (FS/SS/FF/SF) | ✓ | ✓ | ✓ | N/A | Partial | ✓ | ✓ (Phase 1) |
| Lead/lag on dependencies | ✓ | ✓ | ✓ | N/A | ✗ | ✓ | ✓ (Phase 1) |
| WBS hierarchy | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ (Phase 1) |
| Milestones | ✓ | ✓ | ✓ | Partial | ✓ | ✓ | ✓ (Phase 1) |
| Unlimited baselines | ✓ | 11 max | ✓ | ✗ | Snapshot only | ✓ | 5 (Phase 2) |
| Resource leveling | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ (Phase 2) |
| Earned value (PV/EV/AC/SPI/CPI) | ✓ | ✓ | ✓ | ✗ | ✗ | Partial | ✓ (Phase 2) |
| Monte Carlo risk simulation | ✓ | ✗ | ✗ | ✗ | ✗ | Add-on | ✓ (Phase 3) |
| Line of Balance | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (Phase 3) |
| DCMA-14 quality checks | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Phase 2) |
| **4D BIM** | | | | | | | |
| IFC model viewer in-browser | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Phase 1) |
| Task-to-model element linking | ✗ | ✗ | ✓ (desktop) | ✓ (desktop) | ✗ | ✓ (desktop) | ✓ (Phase 1) |
| 4D animation playback | ✗ | ✗ | ✓ (desktop) | ✓ (desktop) | ✗ | ✓ (desktop) | ✓ (Phase 1) |
| Click element → show task | ✗ | ✗ | ✓ (desktop) | ✓ (desktop) | ✗ | Partial | ✓ (Phase 1) |
| Click task → highlight elements | ✗ | ✗ | ✓ (desktop) | ✓ (desktop) | ✗ | Partial | ✓ (Phase 1) |
| Progress update from 3D model | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Phase 2) |
| **Platform** | | | | | | | |
| Web-native (no install) | ✗ | Partial | ✗ | ✗ | ✓ | ✗ | ✓ |
| Mobile view + update | ✗ | Limited | ✗ | ✗ | ✓ | ✓ | ✓ (Phase 1) |
| Real-time multi-user collaboration | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (Phase 1, Yjs) |
| **Import/Export** | | | | | | | |
| Import P6 XER | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ (Phase 1) |
| Import MS Project MPP/XML | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (Phase 1) |
| Export to XER | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ (Phase 1) |
| Export to MPP/XML | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ (Phase 1) |
| PDF Gantt export | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (Phase 1) |
| **Collaboration & Field** | | | | | | | |
| Subcontractor portal | ✗ | ✗ | ✗ | ✗ | ✓ | Partial | ✓ (Phase 2) |
| Comment threads on tasks | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (Phase 1) |
| Audit trail | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ (Phase 1) |
| Lookahead views (2-6 week) | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (Phase 2) |
| Photo evidence on progress | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (Phase 1) |
| **AI & Analytics** | | | | | | | |
| AI schedule generation | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Phase 3) |
| Forensic delay analysis | ✓ (Claim Digger) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Phase 3) |
| S-curve generation | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ (Phase 2) |
| Portfolio dashboard | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ (Phase 2) |
| **Pricing (rough/user/year)** | $2,150-$5,000 | $360-$660 | $4,280-$4,980 | $2,835 | ACV-based | $1,675-$2,500 | ~$588-$948 |

---

## Recommended Feature Set for Aruct Scheduler

### Phase 1: MVP (Months 1-6)

The goal for Phase 1 is to ship the only web-native tool that combines a true CPM engine with genuine 4D model visualization. This single combination is a defensible market position no existing product occupies. Feature depth is secondary to delivering this core promise reliably.

**Schedule Creation Engine:**
- True CPM scheduler with forward pass, backward pass, float calculation, and auto-updating critical path. The engine must be deterministic and run both in-browser (WebWorker) and server-side (Node.js) as `@aruct/scheduler-engine`.
- Task types: Task (duration-based), Milestone (zero-duration), Summary (WBS parent).
- All four dependency types: Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish with configurable lead/lag.
- Drag-and-drop Gantt chart with timeline zoom levels: day, week, month, quarter, year.
- WBS hierarchy with collapsible tree and drag-to-reorder.
- Work calendars: project-level and task-level calendar assignment.
- Progress tracking: percent complete, actual start, actual finish.
- Baseline capture (1 baseline in MVP) with variance columns: BL duration, BL start, BL finish, total float variance.
- Multi-user real-time editing via Yjs CRDT (already in the codebase).
- Comment threads on tasks with @mention notifications.
- Activity log and audit trail (who changed what, when).
- Role-based access: Owner (full edit), Scheduler (edit schedule), Viewer (read-only), Field (progress updates only).

**4D Visualization:**
- IFC model viewer in-browser (Three.js + web-ifc, leveraging the existing Aruct 3D engine). No new 3D stack — extend what exists.
- Model-task linking: select model elements, assign to task via drag-from-Gantt or drag-from-model.
- 4D playback: timeline slider controls time cursor. Model elements color-coded by schedule status:
  - Not yet started: grey/transparent
  - In progress: amber
  - Complete: green
  - Critical and delayed: red
- Bidirectional navigation: click model element to jump to linked task in Gantt; click task to highlight linked elements in 3D viewer.
- Split-screen layout: Gantt on left, 3D model on right (resizable split panel).

**Import/Export:**
- Import MS Project MSPDI XML format (simpler than binary MPP; use this for MVP).
- Import P6 XER (tab-delimited ASCII; parse in TypeScript).
- Export to XER and MSPDI XML.
- Export Gantt to PDF for owner submittals.

**Mobile (MVP — view and update only):**
- Responsive web app: view Gantt, view 3D model, update percent complete on assigned tasks.
- Photo attachment on task progress update.

**REST API (basic):**
- Read tasks, activities, and progress.
- Write progress updates.
- Webhook events: `task_started`, `task_completed`, `task_delayed`, `baseline_deviation`.

**Rationale for MVP scope:** The 4D + CPM combination in a browser is the product's reason for existing. Everything else in Phase 1 is table stakes required to sell at all (import/export, multi-user, mobile, baselines). Resource leveling, earned value, subcontractor portals, and analytics are kept out of MVP deliberately — they increase complexity without strengthening the core positioning.

---

### Phase 2: Growth (Months 7-12)

Phase 2 achieves functional parity with P6 and MS Project on CPM depth while adding the field and collaboration workflows that make Aruct stickier than any desktop tool. The target is teams actively searching for P6 or MS Project Online replacements.

**Schedule Controls:**
- Resource management: define labor and equipment resources with max units and unit cost, assign to tasks with quantity/units.
- Resource histogram view alongside the Gantt.
- Resource leveling (automatic: delay non-critical tasks to eliminate overallocation, preserving critical path).
- Cost-loaded scheduling: planned cost per task and cumulative spend curve.
- Up to 5 baselines per project.
- S-curve generation: Planned Value, Earned Value, Actual Cost plotted over time.
- Earned value metrics: PV, EV, AC, SPI, CPI displayed per task and at project level.
- DCMA-14 schedule quality checks: missing logic, dangling activities, negative float, high float, excessive constraints, missing resources, invalid dates.
- Schedule quality score dashboard (0-100 score with drill-down on failing checks).

**Lookahead Scheduling:**
- 2-6 week lookahead view: filtered sub-Gantt showing only near-term activities within the selected window.
- Subcontractor view: filtered Gantt by responsible party/subcontractor assignment.
- Constraint log: tasks flagged as constrained with reason and resolution workflow.

**4D Enhancements:**
- 4D animation recording and shareable public link (for owner/client presentations without requiring a login).
- Phase/zone color coding on model.
- Model element properties panel showing linked schedule data on hover.
- Multi-model support: architectural, structural, and MEP IFC layers managed independently.
- Progress update from model: field users mark model elements as complete directly in the 3D viewer. This propagates the percent complete to the linked task.

**Subcontractor Portal:**
- Invite subcontractors with Field-level access (email invitation, no account creation required for viewing).
- Subcontractor sees only their tasks (filtered Gantt by assignment).
- Daily progress update: percent complete, notes, photos, issues.
- Notifications: task start reminders, upcoming deadlines, delay alerts.

**Reporting:**
- Auto-generated schedule narrative: variance summary, critical path description, delay event list.
- Project health dashboard: health score, SPI/CPI gauges, on-time/at-risk/delayed task counts.
- Multi-project portfolio view: health overview across all active projects.

**Integrations:**
- Procore two-way sync: tasks and activities sync with Procore Scheduling.
- BCF issue linking: issues from BCF-compatible tools (BIMcollab, Procore, Revizto) linked to schedule tasks.
- Microsoft 365 calendar sync: task due dates pushed to Outlook calendar as events.
- Autodesk Construction Cloud connector (basic: document linking to tasks via ACC API).

---

### Phase 3: Leadership (Months 13-18+)

Phase 3 positions Aruct Scheduler as the platform that replaces the entire P6 + Synchro + analytics stack. The features here are genuinely ahead of any current competitor at any price point.

**AI and Automation:**
- AI schedule generation: describe project scope in plain language; AI generates WBS and activity durations calibrated to AEC best practices and historical data from the Aruct dataset.
- AI delay prediction: flag tasks at risk of delay based on progress patterns (EV trendlines, float erosion rate, subcontractor update frequency).
- AI schedule optimization: suggest alternative sequences to recover float after a delay event.
- Natural language schedule queries: "What tasks are on the critical path this week?" "Which subcontractors are behind schedule?" "What is the projected completion date at current SPI?"

**Advanced Analytics:**
- Forensic delay analysis: retrospective critical path comparison between schedule versions; identify delay events by type (owner-caused, contractor-caused, force majeure, concurrent).
- Time Impact Analysis (TIA): model the impact of a change event on project completion date — the standard methodology for change order schedule claims.
- Monte Carlo risk simulation: assign duration uncertainty ranges (optimistic, most likely, pessimistic or distribution type), run 1,000-10,000 simulations, output confidence intervals and P80/P90 completion dates.
- Delay pattern detection across portfolio for systematic risk identification.

**Advanced 4D:**
- Point cloud overlay: import LiDAR scan data, compare as-built vs. design model to compute physical progress against schedule.
- 5D BIM: cost timeline visualization — planned spend curve visualized on the 3D model by element.
- Construction sequence video export: shareable animated MP4 of the full construction sequence for owner presentations and tender submissions.
- AR viewing mode: schedule-linked model viewable in browser AR (WebXR).

**Location-Based Scheduling:**
- Line of Balance for repetitive work (housing estates, floors, road sections, tunnels).
- Production rate visualization showing flow efficiency per location.

**Integrations — Full Ecosystem:**
- Primavera P6 live sync (bidirectional; near-real-time where API permits).
- Revit plugin: select elements in Revit, auto-assign to Aruct Scheduler tasks. Roundtrip linking without intermediate IFC export.
- IFC 4 property sets: schedule data embedded in the IFC model file per buildingSMART IFC 4.3 IfcWorkSchedule schema.
- Procore financial integration: committed costs vs. scheduled costs in the same dashboard.
- ERP connectors: Sage 300 CRE, Viewpoint Vista, Trimble Spectrum.
- UK market: COINS, Causeway integration.
- Zapier for long-tail integrations without native connectors.

---

## Technical Architecture

### Scheduling Engine

Build a pure TypeScript/JavaScript CPM engine that runs both in-browser (as a WebWorker) and server-side (Node.js). This is not a wrapper around a C++ library — full control and web portability are required. The engine lives as `@aruct/scheduler-engine` in the monorepo alongside `packages/core`.

Key operations the engine must expose:
- `calculateCriticalPath(project: Project): ProjectWithFloat`
- `levelResources(project: Project, strategy: LevelingStrategy): Project`
- `compareBaseline(current: Project, baseline: Baseline): VarianceReport`
- `computeEarnedValue(project: Project, dataDate: Date): EVMetrics`
- `runMonteCarloSimulation(project: Project, iterations: number): SimulationResult`

The CPM algorithm is well-understood and testable. Write a comprehensive test suite against known schedules (including DCMA-14 test cases) before shipping Phase 1. The engine should be deterministic given the same inputs and calendar definitions.

### Real-time Collaboration

Yjs is already in the codebase. Schedule data maps naturally to Yjs primitives: `YMap` for tasks, links, and resources; `YArray` for ordered task sequences. The CPM engine runs locally on each client after receiving a Yjs delta — no server round-trip is needed for scheduling logic. The computed float and critical path are derived state from the Yjs document, recalculated on each change. The Hocuspocus server (or y-websocket) handles persistence and broadcasting; the Aruct backend stores a snapshot of the Yjs document state for each save point.

Conflict resolution for concurrent edits: Yjs CRDT handles structural conflicts automatically. The only manual conflict resolution required is for CPM constraint violations (e.g., two users simultaneously creating a circular dependency) — these are caught by the CPM engine and surfaced as warnings, not silently accepted.

### 3D Viewer Integration

The 4D scheduler integration is a new viewer system (`SchedulerSystem`) in `packages/viewer` that follows the existing systems architecture documented in `wiki/architecture/systems.md`:

```typescript
// packages/viewer/src/systems/SchedulerSystem.ts
interface SchedulerSystem {
  setTimeCursor(t: Date): void
  playAnimation(speedMultiplier: number): void
  pauseAnimation(): void
  linkTaskToNode(taskId: string, nodeId: string): void
  unlinkTaskFromNode(taskId: string, nodeId: string): void
}
```

The system:
- Subscribes to the scheduler store's time cursor (from `packages/core`)
- On each time cursor change, evaluates each task's status at that moment (not_started, in_progress, complete, delayed)
- Applies material overrides to linked scene nodes via the existing viewer material system — no new rendering infrastructure required
- Fires events `onTaskElementHovered` and `onTaskElementClicked` for the editor to handle Gantt synchronization

Layer boundary compliance: `SchedulerSystem` lives in `packages/viewer`. The scheduling data store lives in `packages/core` (new `scheduler` slice alongside existing stores). The Gantt UI, timeline controls, and link panel live in `apps/editor`. This mirrors the existing viewer/editor split and requires no architectural exceptions.

### Gantt Rendering

Do not use an existing Gantt library for the long term — most have licensing issues (DHTMLX is commercial), poor TypeScript support, or performance problems at 1,000+ tasks. The recommended approach:

- **MVP (Months 1-3):** Evaluate Bryntum Gantt (~$1,500/developer/year commercial license) to save 6+ months of custom rendering work. If budget permits, use it to validate product-market fit quickly.
- **Phase 2 (Months 6-12):** Build a canvas-based Gantt renderer using HTML5 Canvas for bar drawing and TanStack Virtual for row virtualization. This delivers 10,000+ task performance without the commercial license dependency. The canvas approach also enables features Bryntum cannot support (custom 4D color overlays, model-linked selection highlight).

Virtual scrolling is a hard requirement for competitive parity with P6 at 10,000+ activity counts.

### IFC Handling

- Use `web-ifc` (That Open Company, MIT license) for in-browser IFC parsing. This is the same library backing OpenBIM-Components and is already widely used in the web BIM ecosystem.
- For large IFC files (100MB+): parse server-side and stream model chunks to the browser. Convert IFC to glTF server-side using IfcOpenShell (Python) and serve glTF to Three.js. Store IFC property data (GlobalId, element type, attributes) separately in a lightweight JSON sidecar for task linking.
- The `taskElementLinks` store maps `taskId → IFC GlobalId[]`. GlobalId is stable across model updates and survives re-export from Revit.

### File Import/Export

- **P6 XER:** Parse in TypeScript. XER is a tab-delimited ASCII format with a predictable `%T` table header structure. Implement as a streaming parser to handle large files. Write a full test suite against real P6 XER exports.
- **MS Project XML (MSPDI):** Parse the XML-based `.xml` export format (Microsoft Project Data Interchange) for MVP. This is well-documented and significantly simpler than binary MPP. Add binary MPP support in Phase 2 using the `mpp-reader` npm package or by shelling out to a .NET process on the server.

### Database Schema

```sql
Project { id, name, data_date, calendar_id, created_by, ... }
Task { id, project_id, wbs_code, name, type, planned_start, planned_finish,
       actual_start, actual_finish, pct_complete, calendar_id, constraint_type, constraint_date }
Dependency { id, predecessor_id, successor_id, type, lag_hours }
Resource { id, project_id, name, type, max_units, unit_cost }
ResourceAssignment { id, task_id, resource_id, budgeted_units, budgeted_cost }
Baseline { id, project_id, captured_at, name }
BaselineTask { baseline_id, task_id, start, finish, duration, total_float }
TaskElementLink { task_id, project_id, element_global_ids JSONB }
TimeCursor { project_id, user_id, cursor_value TIMESTAMP }
```

### Backend Services

- **Schedule compute service (Node.js):** CPM calculation on large schedules (>50K activities) offloaded to server to avoid blocking the browser. Results streamed back via WebSocket with incremental float updates.
- **IFC conversion service:** IfcOpenShell (Python) or web-ifc-convert for server-side IFC to glTF conversion. Run as a separate worker service behind a job queue (BullMQ or similar).
- **Export service:** Generates XER, MSPDI XML, PDF Gantt on demand. Stateless function; triggered by REST endpoint.
- **Real-time sync:** Hocuspocus (Yjs WebSocket server) or y-websocket — already the likely stack given Yjs is in the codebase.

### MCP Integration

The Aruct MCP server (`packages/mcp`) exposes scheduler tools for AI agent access:

```typescript
get_project_schedule(projectId: string) → ScheduleJSON
get_critical_path(projectId: string) → Task[]
get_task_status(projectId: string, taskId: string) → TaskStatus
update_task_progress(projectId: string, taskId: string, pct: number, note?: string) → void
create_task(projectId: string, taskData: NewTaskInput) → Task
get_schedule_health(projectId: string) → HealthReport
```

These tools enable AI-driven use cases from Phase 3: natural language queries, delay prediction summaries, and progress updates via voice or chat interface without opening the editor.

---

## Integration with Aruct Editor

### Scene graph integration

The Aruct scene graph (`packages/core`) gets a new top-level domain: **`scheduler`**. This store slice holds:
- The project schedule: tasks, dependencies, resources, baselines
- The `taskElementLinks` mapping: `taskId → nodeId[]`
- The current time cursor value for 4D playback
- Schedule display settings: visible tasks, active filter, critical path highlight toggle

This is pure data — no rendering, no UI — consistent with `packages/core`'s existing role as the domain data and pure logic layer.

### Editor panels

Two new editor panels in `apps/editor`:
- **`GanttPanel`**: The primary scheduling UI. Can be docked to the bottom or left panel. Renders the virtual Gantt chart, WBS tree, task property editor, baseline variance columns, and CPM highlights. Communicates with `SchedulerSystem` via events defined in `packages/core`'s event bus.
- **`TaskLinkPanel`**: When a model element is selected in the 3D viewer, shows its linked schedule tasks with status, float, and start/finish dates. Supports drag-from-model linking: select nodes in the 3D viewer, drag to a task row in `GanttPanel`.

New editor tools in `apps/editor`:
- **Link tool**: Click a model element to open task assignment dialog. Creates entries in `taskElementLinks`.
- **Progress tool**: Click a model element to mark as complete. Updates percent complete on the linked task and fires a progress event.
- **4D Playback toolbar**: Play, pause, scrub controls overlaid on the 3D viewport. Scrubbing the timeline updates the `SchedulerSystem` time cursor reactively.

These tools follow the existing tool architecture in `wiki/architecture/tools.md` and require no changes to the viewer or core layer boundaries.

### Plugin system integration

Aruct Scheduler is exposed as a first-party plugin in the Aruct marketplace. This validates the plugin API and allows third-party plugins to extend scheduling workflows:

```typescript
// Scheduler plugin API surface
aruct.scheduler.getTasks(): Task[]
aruct.scheduler.getTaskByElement(nodeId: string): Task | null
aruct.scheduler.linkTaskToElement(taskId: string, nodeId: string): void
aruct.scheduler.updateProgress(taskId: string, pct: number): void
aruct.scheduler.onTimeCursorChange(cb: (t: Date) => void): Unsubscribe
aruct.scheduler.getCriticalPath(): Task[]
aruct.scheduler.exportSchedule(format: 'xer' | 'xml' | 'json'): Promise<Blob>
```

Third-party plugins can use these hooks to build subcontractor-specific dashboards, custom reporting templates, or specialized scheduling workflows (e.g., a bridge-specific phasing tool or a housing production scheduler).

---

## Pricing Strategy

### Competitive context

| Tool | Price per user per year | Model |
|------|------------------------|-------|
| Primavera P6 Professional | $2,150-$5,000 | Per user |
| Synchro 4D | $4,280-$4,980 | Per user (annual) |
| Navisworks Manage | $2,835 | Per user |
| Asta Powerproject | $1,675-$2,500 | Per user |
| MS Project Plan 3 | $360 | Per user |
| Procore Scheduling | ACV-based, bundled | Per company by revenue |
| Planera | Volume-based | Per company |
| SmartPM | $12,000-$25,000 | Per company |
| Monday.com Pro | $228 | Per user |

### Recommended pricing

**Structural principles:**
- Bundle Aruct Scheduler as a premium add-on to Aruct Pro. Do not sell it standalone initially — the 4D differentiation requires the Aruct 3D model context.
- Price to dramatically undercut the P6 + Synchro stack ($7,000-$10,000/user/year) while sitting above commodity tools like MS Project ($360/user/year).
- Use per-seat pricing for Phase 1. Migrate toward company-level unlimited-seat pricing for Enterprise accounts in Phase 2 to compete with Procore and Planera on large-team deals.

**Recommended tier structure:**

| Tier | Price | Included |
|------|-------|---------|
| **Aruct Pro** (existing, enhanced) | $49/user/month | Aruct editor + basic scheduling: Gantt, CPM, milestones, 1 baseline, IFC link, 4D playback. Up to 5 users, 3 projects. |
| **Aruct Scheduler** (add-on) | +$29/user/month | Full scheduling: unlimited projects, resource management, earned value, S-curves, DCMA-14 checks, subcontractor portal, XER/MPP export. |
| **Aruct Scheduler Pro** (add-on) | +$59/user/month | Everything in Scheduler + Monte Carlo simulation, forensic delay analysis, portfolio dashboard, AI schedule assist, priority support. |
| **Aruct Enterprise** | Custom (from $2,000/month for teams of 20+) | Unlimited seats, dedicated CSM, SLA, SSO, on-premise IFC conversion, Revit plugin, ERP integrations. |

**Worked example — 10-person GC team:**
- Aruct Pro ($49 × 10) + Scheduler add-on ($29 × 10) = $780/month = $9,360/year
- This delivers 4D BIM + CPM scheduling for less than 2 seats of Synchro alone ($9,960/year for 2 users)
- The same team on P6 ($2,150 × 10) + Synchro ($4,980 × 10) = $71,300/year — Aruct delivers the same core capability at 13% of the cost

**Market disruption timing:** Target the MS Project Online retirement (September 30, 2026) with a direct migration campaign in Q3-Q4 2026. Offer 3 months free on the Scheduler add-on for teams switching from MS Project Online or Planner. This is the single largest addressable near-term demand event in the scheduling software market.

**Enterprise positioning:** For competitive displacements of P6 + Synchro stacks, Enterprise deals should be positioned at $60,000-$90,000/year for 20-30 seat teams — still 40-60% below the incumbent stack cost, with the additional benefit of no desktop installs, no IT provisioning, and real-time collaboration included.

---

## Success Metrics

### Acquisition
- Signups per week from scheduler-specific landing pages: target 50/week by Month 6
- Conversion rate from free trial to paid within 14-day trial: target >15%
- MS Project Online migration leads captured: target 500 by end of 2026
- Organic search ranking for "4D BIM scheduling software," "web-based CPM scheduling," "construction schedule software BIM": target page 1 within 12 months of launch

### Activation
- Time to first 4D link (model element linked to a schedule task): target under 30 minutes from account creation
- Time to first CPM schedule with computed critical path: target under 2 hours from account creation
- Projects with imported XER or MPP files: track as a percentage of active projects — this is the primary indicator of teams switching from P6 or MS Project
- DAU/MAU ratio: target above 40% (indicates active project use, not dormant accounts)

### Retention
- Monthly churn rate: target below 3%/month (AEC software benchmark: 2-4% is healthy)
- Net Revenue Retention (NRR): target above 115% (expansion from Pro → Scheduler → Enterprise upgrades)
- Projects with more than 5 active team members: indicator of multi-user adoption and account stickiness
- Baseline captures per project: more than 1 baseline per project indicates teams are using schedule controls, not just the Gantt view

### Product Depth
- 4D link coverage: percentage of schedule tasks with at least one linked model element; target above 60% on active projects
- Field progress updates via mobile or model click: target above 30% of all progress updates
- Subcontractor portal invites per project: target average 3 subcontractors invited per project on Scheduler tier
- Schedule export rate: percentage of projects exporting XER or MPP for owner submission — this indicates contract-grade use and is a leading indicator of retention

### Business
- Average Revenue Per Account (ARPA): target $850/month by Month 12
- Enterprise accounts (>$2,000/month): target 20 by Month 18
- Third-party plugins using the scheduler API: target 5 by Month 18
- Net Promoter Score: target above 45 (construction software average ~30; Procore scores ~43)

### Competitive Displacement
- Origin of XER imports: track P6 version metadata in XER file headers to identify teams migrating from P6
- "Switching from" data in onboarding surveys: categorize competitor mentions
- Feature parity completion rate: percentage of Phase 2 feature checklist shipped on schedule by Month 12

---

## Implementation Timeline

### Month 1-2: Foundation

- Implement `@aruct/scheduler-engine` package with CPM forward/backward pass and float calculation
- Write comprehensive test suite against known schedules and DCMA-14 test cases
- Define `scheduler` store slice in `packages/core`
- Define `SchedulerSystem` interface in `packages/viewer`
- Scaffold `GanttPanel` and `TaskLinkPanel` in `apps/editor`
- Implement XER parser and MSPDI XML parser with round-trip tests
- Milestone: CPM engine correctly calculates critical path on imported P6 and MS Project schedules

### Month 3-4: 4D Integration and Gantt UI

- Implement `SchedulerSystem` in `packages/viewer` with material overrides on linked scene nodes
- Build task-element linking workflow (link tool in editor)
- Build 4D playback toolbar with time cursor scrubbing
- Implement basic Gantt chart (Bryntum Gantt for MVP or custom canvas implementation)
- Implement task-model bidirectional navigation
- Implement baseline capture and variance columns
- Milestone: A user can import a P6 XER schedule, load an IFC model, link elements to tasks, and play back the 4D animation in the browser

### Month 5-6: Collaboration, Mobile, and Export

- Real-time multi-user editing via Yjs (integrate scheduler store with existing Hocuspocus setup)
- Role-based access (Owner, Scheduler, Viewer, Field)
- Comment threads on tasks and activity log
- Mobile-responsive view and progress update UI
- Photo attachment on progress update
- PDF Gantt export
- XER and MSPDI XML export
- REST API (basic read/write/webhook)
- Milestone: MVP feature-complete; internal testing and closed beta with 5-10 GC teams

### Month 7-8: Resource Management and Earned Value

- Resource definition and assignment UI
- Resource histogram view in Gantt
- Resource leveling algorithm
- Cost-loaded scheduling (budgeted cost per task)
- S-curve generation (PV, EV, AC)
- Earned value metrics (SPI, CPI) at task and project level
- Milestone: A scheduler can produce a cost-loaded schedule with EV metrics from within Aruct

### Month 9-10: Lookaheads, Subcontractor Portal, DCMA-14

- 2-6 week lookahead view with filtering
- Subcontractor portal (invitation, filtered Gantt, daily progress update, notifications)
- DCMA-14 quality checks implementation
- Schedule quality score dashboard
- Progress update from 3D model (field click to complete)
- 4D animation shareable public link for client presentations
- Milestone: A subcontractor can receive an invite, see their tasks, and submit daily progress without a full Aruct account

### Month 11-12: Integrations and Reporting

- Procore two-way sync
- BCF issue linking
- Microsoft 365 calendar sync
- Auto-generated schedule narrative report
- Portfolio dashboard (multi-project health overview)
- Multiple baselines (up to 5)
- Binary MPP import (Phase 2 upgrade from MSPDI XML only)
- Milestone: Phase 2 feature-complete; Aruct Scheduler is feature-competitive with P6 + Synchro for mid-market teams at one-third the cost

### Month 13-18: AI and Leadership Features

- AI schedule generation (describe scope → WBS + duration recommendations)
- AI delay prediction (float erosion alerts, EV trendline warnings)
- Monte Carlo risk simulation
- Forensic delay analysis (retrospective critical path comparison between versions)
- Time Impact Analysis workflow
- Point cloud overlay for scan-to-BIM progress tracking
- Line of Balance for repetitive work
- Revit plugin (direct element-to-task linking without IFC export step)
- Primavera P6 live sync
- Construction sequence video export
- Milestone: Aruct Scheduler is feature-ahead of the P6 + Synchro stack in AI and web accessibility; targeting first Enterprise displacement wins of incumbent desktop tools

---

*Sources: BIM Software Market — Grand View Research; Construction Scheduling Software Compared — illustrarch.com; Primavera P6 vs Microsoft Project 2026 — Civinnovate; Procore Alternatives for Scheduling — Planera; Best Construction Scheduling Software — SmartPM; Best Construction Scheduling Software — ProjectManager; Synchro 4D Pricing — TrustRadius; SYNCHRO Product Page — Bentley Systems; Top 4D BIM Tools — Novatr; Oracle Primavera Alternatives — ConstructionBids.ai; Asta Powerproject — Elecosoft; Buildertrend vs CoConstruct — Projul; Construction Delay Analysis Software — ConstructionReviewOnline; Top 8 Subcontractor Scheduling Tools — Contractor Foreman; Construction Scheduling Software Market — ResearchAndMarkets; 4D BIM Scheduling — BIM Services US; Open Source BIM Stack — AlterSquare; BCF API Standard — buildingSMART.*
