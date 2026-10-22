# AI and Automation — Features and Gaps

## What Exists

### AI 3D Generation (Tripo)
- **`apps/editor/lib/tripo-client.ts`** — Tripo3D API client
- **`api/tripo/generate`** — server-side generation endpoint
- **`ai-generate-tile.tsx`** — UI tile in catalog/sidebar
- Plan gate: `canUseAIGeneration()` — Pro required
- Limits: 20 generations/month (Pro), unlimited (Team)
- Monthly counter tracked in DB: `aiGenerationsThisMonth`, `aiGenerationsResetAt`
- Generates a 3D GLB from a text prompt → placed as `item` node

**Gaps:**
| Gap | Priority | Notes |
|---|---|---|
| Image-to-3D (photo → mesh) | High | Tripo supports this; not wired up |
| Style consistency across generated items | Medium | Each generation is independent |
| Generated item quality validation | Medium | Users get whatever Tripo returns |
| Generation history / library | Medium | No gallery of past generations |
| Refine / iterate on generated mesh | Low | Round-trip edit not supported |

### Vision / AI Analysis
- `canUseVision()` — Pro gate
- `getVisionLimit()` — 5 calls/month (Pro), unlimited (Team)
- DB tracking: `visionCallsThisMonth`, `visionCallsResetAt`
- No specific route found — may be planned or partially implemented

**What vision could enable:**
- Upload a photo of a room → AI extracts dimensions → auto-generates walls
- Photo-to-floor-plan reconstruction
- Material detection from photo → apply to surface

### MCP Server (`packages/mcp/`)
- MCP (Model Context Protocol) server for AI agent control
- `api/mcp/track` — usage tracking
- Plan gate: `canUseMCP()` — Pro required
- **`wiki/architecture/plugin-authoring.md`** covers the public contract

**MCP capabilities (inferred from architecture):**
- Read scene graph (list nodes, get properties)
- Create / update / delete nodes via structured commands
- Trigger exports (GLB, IFC, DXF)
- Navigate scenes
- Query spatial relationships

**Gaps:**
| Gap | Priority | Notes |
|---|---|---|
| Natural language command parsing | High | "Add a window to the south wall of room 3" |
| MCP tool: generate floor plan from brief | High | "Create a 3BR apartment ~90m²" |
| MCP tool: apply design rules | Medium | "All corridors min 1.2m wide" |
| MCP tool: run code-compliance check | Medium | ADA/building code validation |
| MCP documentation (public) | High | Developers need docs to build integrations |
| MCP auth (API key management UI) | Medium | Users need to generate keys |
| MCP streaming responses | Medium | Long operations need progress |
| Agent SDK example | High | Show developers how to build on top |

### DCC Bridge (`apps/editor/app/dcc-bridge/`)
- `dcc-bridge-client.tsx` — bridge to DCCs (Blender, Maya, Cinema 4D)
- No public documentation found
- Likely uses the MCP server or a local socket

---

## Gaps vs CadCraft

| AI Feature | CadCraft | Aruct |
|---|---|---|
| Command-line driven by AI (MCP) | ✅ Full MCP server | ✅ MCP (Pro) |
| JSON control channel | ✅ | Partial |
| AI 3D generation | ❌ | ✅ (Tripo, Pro) |
| AI floor plan generation | ❌ | ❌ |
| Vision / photo-to-model | ❌ | ❌ (gate exists) |
| Smart item placement suggestions | ❌ | ❌ |
| Natural language commands | ❌ | ❌ |
| Code compliance check | ❌ | ❌ |
| AI material suggestion | ❌ | ❌ |
| Scripting (AutoLISP equiv.) | ✅ (in progress) | ❌ |
| Script files (`.scr`) | ✅ | ❌ |

---

## Opportunities

### Floor Plan Generation from Brief
High-value, defensible feature. User inputs:
- Program (3BR/2BA, 90m², budget class)
- Site boundary (drawn or uploaded PDF)
- Style preferences (open plan, traditional, contemporary)

AI generates a valid Aruct scene with walls, zones, doors placed correctly. Uses MCP internally.

### Spatial Compliance Checker
Query the scene graph via MCP → apply building-code rules:
- Minimum corridor width (1.2m ADA, 0.9m residential)
- Minimum room size per use
- Fire egress (distance to exit)
- Natural light (window-to-floor area ratio)

Reports violations as a list → user clicks to navigate to issue.

### AI Material Suggestions
Given a room type (bedroom, kitchen, living) and style (Scandinavian, Industrial, Modern):
- Suggest material presets for walls, floor, ceiling
- Apply with one click
- Generated via Anthropic Claude API

### Smart Item Placement
Given room type and dimensions:
- Suggest furniture layout (sofa + coffee table + TV for living room)
- Respect clearances (91cm around dining table)
- Avoid blocking door swings
- Uses scene graph spatial queries

### Design Review Assistant
Upload a photo of a hand-drawn sketch or whiteboard diagram:
1. Vision model extracts room layout
2. Converts to walls, zones, doors in Aruct
3. User refines the auto-generated plan

---

## Recommended Next Steps

1. **MCP documentation** — publish public docs for the MCP server; include example scripts
2. **MCP API key management** — UI for generating/revoking keys; usage dashboard
3. **Image-to-3D** — wire up Tripo's image input mode (already supported by the API)
4. **Natural language floor plan generation** — MCP + Claude integration
5. **Compliance checker** — spatial query + rule engine via MCP
6. **AI material suggestions** — Claude API + material library
