# Investigation 06 — Tripo3D Platform Overview

**Date:** 2026-07-26  
**Status:** Complete  
**Trigger:** Evaluate Tripo3D for integration as 3D model source and DCC bridge into Aruct Editor

---

## What is Tripo3D?

Tripo3D (tripo3d.ai / studio.tripo3d.ai) is an **AI-powered 3D asset generation platform** by VAST AI Research (founded 2023, $50M funding from Alibaba and Baidu Ventures).

### Core Capability
Converts text prompts, single images, multi-view images, or sketches → production-ready 3D models in ~10 seconds. The pipeline is fully server-side: geometry reconstruction, UV unwrapping, and PBR texture baking (albedo, normal, roughness) all happen automatically.

### Scale
- 6.5M+ creators
- 90,000+ developers
- ~100M models generated

### Current Models
- **Tripo 3.0** — released August 2025, ~20B parameters
- **Tripo H3.1** — March 2026, high-fidelity variant
- **Tripo P1** — March 2026, production-quality output

### Output Formats
GLB, GLTF, FBX, OBJ, STL, 3MF, USD/USDZ

### Key Generative Features
- Text-to-3D and Image-to-3D (single or multi-view)
- AI auto-rigging for character animation
- Remeshing / topology optimization (quad-dominant, clean UVs)
- Stylization: clay, voxel, low-poly, minecraft
- Smart Mesh (March 2026) — game-ready clean topology
- Multi-format export

---

## Pricing Tiers (Consumer)

| Plan | Price/mo | Credits/mo | Models/mo | Commercial | Queue |
|------|----------|------------|-----------|------------|-------|
| Free | $0 | 200 | ~8 | No (CC BY 4.0, public) | Standard |
| Pro | $19.90 | 3,000 | ~120 | Yes (private + commercial) | Priority |
| Max | $89.90 | 25,000 | ~1,000 | Yes | Priority |
| Team | $109.90 | 45,000 | ~1,800 | Yes (shared workspace) | Priority |

**Free tier caveats:**
- Generated models are **public** and CC BY 4.0 licensed (attribution required)
- 1 concurrent task only
- 1-day trial of Smart Mesh
- Not for API/production use

**API pricing is separate** — pay-as-you-go, 1 credit = $0.01 USD. No free API tier.

---

## Model Gallery (Free Public Catalog)

URL: https://studio.tripo3d.ai/3d-model-gallery/

- Browsable without login, searchable by keyword
- ~20 categories: Animals, Characters, Architecture, Vehicles, Weapons, Anime, Landmarks, etc.
- Trending searches: Avatar, Cat, Dragon, Minecraft
- Download formats: STL/3MF, FBX/OBJ, GLB/USDZ
- Free models: CC BY 4.0 (attribution required, no commercial exclusivity)
- One-click export to Blender, 3ds Max, Maya, Unity, Unreal via DCC Bridge

**Important:** No documented public REST API for programmatic catalog search or bulk download. Discovery is UI-only as of July 2026.

---

## DCC Bridge

A suite of lightweight plugins that maintain a live API-level link between Tripo Studio (browser) and a local DCC application. Generate in browser → model appears in local tool in one click, with animations and materials intact.

**Supported tools (9 confirmed):**

| Tool | Notes |
|------|-------|
| Blender 4.1+ | Most mature bridge, first released |
| Maya | Direct Studio-to-Maya export |
| 3ds Max | Direct Studio-to-3ds Max export |
| Unity | One-click browser-to-editor |
| Unreal Engine | Direct Studio-to-UE export |
| ZBrush | First native ZBrush bridge from any AI 3D platform |
| Godot | Real-time import with animation support |
| Cocos | Real-time import with animation support |
| ComfyUI | Listed on DCC Hub page |

**MetaTailor** (shown in screenshot) — this is a **separate third-party product** by Hologress for auto-fitting clothing to avatars. Not a Tripo-built bridge. Appears in Tripo ecosystem context as a partner listing.

Bridges are free to install. Generation credits are still consumed per model produced.

### DCC Bridge Docs
- Hub: https://www.tripo3d.ai/blog/tripo-dcc-bridge-guide-hub
- Blender: https://www.tripo3d.ai/blog/tripo-dcc-bridge-for-blender
- Maya: https://www.tripo3d.ai/blog/tripo-dcc-bridge-for-maya
- Unity: https://www.tripo3d.ai/blog/tripo-dcc-bridge-for-unity
- 3ds Max: https://www.tripo3d.ai/blog/tripo-dcc-bridge-for-3ds-max

---

## Relevance to Aruct Editor

| Feature | Feasibility | Notes |
|---------|-------------|-------|
| REST API for generation | ✅ Yes | Production-ready, pay-per-use |
| MCP integration | ✅ Yes | Official + community servers exist |
| Free model search/import (programmatic) | ⚠️ No API | Gallery is UI-only, no search endpoint documented |
| S3 caching of free models | ✅ Yes | Scrape/download gallery → cache in S3 |
| DCC Bridge for web editor | ❌ Not directly | Bridges are desktop-app plugins, not web APIs |

**See also:** [07-tripo3d-api-mcp.md](./07-tripo3d-api-mcp.md), [08-free-3d-model-marketplaces.md](./08-free-3d-model-marketplaces.md), [09-global-model-catalog-architecture.md](./09-global-model-catalog-architecture.md)
