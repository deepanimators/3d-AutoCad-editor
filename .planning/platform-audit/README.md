# Aruct Platform Audit — Index

Comprehensive analysis of what the platform has, what's missing for professional architects,
and how every new capability ships as a plan-gated plugin.

## Files

| File | Contents |
|---|---|
| `01-capabilities.md` | Everything the platform can do today — 47 node types, tools, export, AI |
| `02-gap-analysis.md` | Feature-by-feature gap vs Revit, ArchiCAD, SketchUp, Blender |
| `03-plugin-architecture.md` | Exact pattern for adding a new Pro/Team-only plugin (code walkthrough) |
| `04-mesh-editor-plugin.md` | Blender-like mesh editing — design, approach, implementation plan |
| `05-texture-material-plugin.md` | Full PBR texture pipeline — upload, editor, library, per-item overrides |
| `06-roadmap.md` | Prioritized 12-month roadmap with effort estimates |

## Core Concept

Every new feature = a plugin entry in `apps/editor/lib/plugins/catalog.ts`.
Set `requiredPlan: 'pro'` or `'team'` — client + server gating is automatic.
No other infrastructure changes needed for basic gating.

## Quick numbers

- **47 node types** — wall to P-trap to classical column
- **50+ MCP tools** — AI agents can read/write scenes
- **3 plan tiers** — free / pro ($29/mo) / team ($79/seat/mo)
- **8 plugins today** — 3 free, 3 pro-only, 2 team-only
- **Critical gaps** — GLB export, DWG/DXF, free-form mesh editing, full PBR materials
