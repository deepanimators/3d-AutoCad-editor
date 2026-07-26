# Investigation 10 — DCC Bridge: Concept, Architecture & Tripo Implementation

**Date:** 2026-07-26  
**Status:** Complete  
**Trigger:** Evaluate DCC Bridge pattern for Aruct Editor; understand how Tripo3D bridges connect web platform to desktop DCC tools

---

## What is a DCC Bridge?

**DCC = Digital Content Creation** — Blender, 3ds Max, Maya, Unity, Unreal Engine, Godot, ZBrush, Cinema 4D, etc.

A **DCC Bridge** is an integration layer that enables bidirectional, automated data transfer between a web platform (or AI service) and a locally-installed DCC application. Instead of manually exporting → downloading → importing a file, the bridge handles this with one click: you click "Send to Blender" in the browser, and the asset appears in your open Blender session.

### Core Challenge

Two fundamentally different runtimes:
- **Web app** — sandboxed, no filesystem access, HTTP-native
- **Desktop DCC** — native process, has filesystem + Python/C++ scripting, no native HTTP server

**Universal solution:** the DCC tool hosts a **local server** (TCP socket, HTTP, or WebSocket) on `localhost:<port>`. The web app calls into it.

---

## Communication Patterns (Verified)

### Pattern A: TCP Socket + JSON (Most Common for Python Addons)

**Used by:** Tripo3D Blender addon, BlenderMCP (open source)

DCC plugin starts a raw TCP socket server inside the DCC process. External caller connects to `localhost:<port>` and sends newline-delimited JSON.

**Tripo's actual `server.py` (verified from source):**
```python
class BlenderMCPServer:
    def __init__(self, host="localhost", port=9876):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Non-blocking, bpy.app.timers callback runs on main thread
```

- Default port: **9876**
- Message format: raw JSON over TCP
- Threading: `setblocking(False)` + `bpy.app.timers.register()` to process on Blender's main thread (required — bpy is not thread-safe)
- **Single-client constraint** — only one external connection at a time

Command types: `get_scene_info`, `create_object`, `execute_code`, `set_material`, `render_scene`, `get_tripo_apikey`

**⚠️ Security:** The `execute_code` handler runs **arbitrary Python** inside Blender via `exec()`. Acceptable for localhost, dangerous if exposed over a network.

```python
def execute_code(self, code):
    namespace = {"bpy": bpy}
    exec(code, namespace)  # executes arbitrary code in Blender
```

### Pattern B: Local HTTP Server + REST

**Used by:** Meshy DCC Bridge (all platforms), NVIDIA RTX Remix

DCC plugin runs a local HTTP server. Web app sends `POST` requests to `localhost:<port>`.

**Meshy's per-DCC port map:**

| DCC | Port |
|-----|------|
| Blender | 5324 |
| Unity | 5326 |
| Omniverse/USD | 5331 |

Flow:
1. User clicks "Send to Blender" in web app
2. Web app `POST http://localhost:5324` with model URL
3. Plugin downloads → imports via `bpy.ops`
4. Temp file cleaned up

NVIDIA RTX Remix uses REST on port **8011** with resource-style endpoints: `GET /status`, `POST /stagecraft/assets/{prim_path}/file-paths`.

### Pattern C: Node.js Relay + Socket.IO

**Used by:** ArtFX Silex (VFX pipeline tool)

A neutral Node.js relay server runs Socket.IO. DCC clients (Maya, Houdini plugins) connect **outbound** to the relay. The web frontend also connects. Relay fans messages between DCC instances and the UI.

Better for multi-user / multi-DCC scenarios — no per-machine port binding required.

### Pattern D: Cloud API Polling

**Used by:** Tripo3D's AI generation (separate from the bridge itself)

Plugin POSTs to cloud API → gets task ID → polls for completion → downloads GLB → imports. Used for the actual AI generation workflow. The "bridge" (Pattern A) is layered on top for MCP/AI assistant orchestration.

### Pattern E: Object Graph Streaming (Production Pipelines)

**Used by:** Speckle (AEC/BIM), ShotGrid/Flow (VFX)

Speckle decomposes 3D objects into hash-identified JSON blobs stored on a server (Postgres + Redis). Connectors (Rhino, Revit, Blender) use a multi-transport abstraction. GraphQL API + WebSocket subscriptions for real-time. Essentially "git for 3D geometry."

---

## Tripo3D DCC Bridge — Technical Deep Dive

### GitHub Repos (VAST-AI-Research org)

| Repo | Purpose |
|------|---------|
| `tripo-3d-for-blender` | Blender addon (MIT, Python) |
| `tripo-mcp` | MCP server wiring Tripo API + BlenderMCP |
| `tripo-python-sdk` | REST API client (submodule) |
| `tripo-js-sdk` / go / rust / java | Polyglot SDKs |

### Blender Addon — Two Distinct Modes

**Mode 1: Direct AI Generation** (no web app needed)
- Artist enters API key in Blender N-panel
- Text/image prompt → `POST` to Tripo cloud API
- Plugin polls → downloads GLB → `bpy.ops.import_scene.gltf()`

**Mode 2: DCC Bridge / MCP Mode** (web app → Blender)
- Starts `BlenderMCPServer` on `localhost:9876`
- External process (`tripo-mcp`, Claude Desktop, Cursor) connects via TCP
- Sends JSON commands → executed on Blender's main thread
- Note: derived from open-source `blender-mcp` by Siddharth Ahuja (acknowledged in tripo-mcp README)

### Full Web-to-Blender Flow

1. User opens Tripo Studio (browser), generates a model
2. Tripo Studio detects Blender addon's TCP server running on port 9876
3. Web app (or companion process) connects to `localhost:9876`
4. Sends JSON command to download + import model
5. Addon executes import in Blender's main thread via timer callback

### Supported DCC Tools + Plugin Types

| DCC | Plugin Type | Port |
|-----|------------|------|
| Blender 4.1+ | Python addon | 9876 |
| Maya | MEL/Python plugin | TBD |
| 3ds Max | MaxScript plugin | TBD |
| Unity | C# Editor package | TBD |
| Unreal Engine | C++ plugin | TBD |
| Godot | GDScript addon | TBD |
| Cocos | TypeScript plugin | TBD |
| ZBrush | ZScript/GoZ | TBD |
| MetaTailor | Third-party (Hologress) | N/A |

---

## Competitive Landscape

| Product | Protocol | Scope | Open Source |
|---------|----------|-------|-------------|
| **Tripo3D DCC Bridge** | TCP socket (9876) + cloud REST | AI gen → DCC | Partially (Blender addon MIT) |
| **Meshy Bridge** | Local HTTP (5324/5326/5331) | AI gen → DCC | No |
| **BlenderMCP** | TCP socket (9876) JSON | AI/LLM → Blender | Yes (MIT) |
| **Unity MeshSync** | Custom binary, persistent | DCC ↔ Unity live sync | Yes |
| **NVIDIA RTX Remix** | REST port 8011, JSON+USD | DCC ↔ Omniverse | SDK only |
| **Speckle** | GraphQL + WS subscriptions | AEC data platform, versioned | Yes (Apache 2) |
| **ShotGrid Toolkit** | REST + Python injected into DCC launchers | VFX production pipeline | Toolkit open source |
| **ArtFX Silex** | Socket.IO (Node.js relay) | VFX pipeline (Maya/Houdini ↔ web) | Yes |
| **OpenAssetIO** | In-process C++/Python (no network) | Asset manager ↔ DCC | Yes (Apache 2) |

### Notable: Speckle for Architecture

Speckle handles versioning, diffing, and multi-user concurrency — not just one-shot transfers. Has connectors for Rhino, Revit, Grasshopper, Blender. **Most relevant precedent** for an architecture editor that needs real DCC collaboration. Self-hostable.

### Notable: OpenAssetIO

Not a network bridge — an in-process plugin API that standardizes how DCCs resolve asset IDs to file paths. Relevant if you want DCCs to resolve model IDs from Aruct's global catalog directly without a network hop.

---

## Recommendations for Aruct Editor

### Phase 1: No Bridge (Today)
Users export GLB from DCC → upload via "My Items". Zero engineering. This already works.

### Phase 2: Blender Addon ("Send to Aruct")

Simple Blender addon with one button. **~150–200 lines of Python.**

```python
# Direction: Blender → Aruct (reverse of Tripo's direction)
class ARUCT_OT_send_to_aruct(bpy.types.Operator):
    bl_label = "Send to Aruct"
    
    def execute(self, context):
        # 1. Export selection to GLB in memory (bpy.ops.export_scene.gltf)
        # 2. POST to https://api.aruct.com/items/upload with user's API key
        # 3. Show success notification with direct link
        return {'FINISHED'}
```

API key stored in Blender's addon preferences. Distributes as `.zip` on Aruct website.

### Phase 3: Multi-DCC Bridge (Long Term)

Follow Meshy's pattern (local HTTP server, distinct port per DCC). Simpler than TCP socket + JSON because HTTP is easier to implement in C# (Unity), C++ (Unreal), and MEL (Maya).

Flow: User generates model in Aruct → clicks "Send to Blender" → web app `POST http://localhost:5324` → plugin imports.

### Phase 4: Live Sync / AEC Pipeline (Future)

Adopt Speckle's GraphQL + transport model if real collaboration (multiple users editing simultaneously with DCC tools open) becomes a requirement.

---

## Key Sources

- Tripo DCC Bridge Hub: https://www.tripo3d.ai/blog/tripo-dcc-bridge-guide-hub
- Tripo Blender Bridge: https://www.tripo3d.ai/blog/tripo-dcc-bridge-for-blender
- GitHub: VAST-AI-Research/tripo-3d-for-blender
- GitHub: VAST-AI-Research/tripo-mcp
- GitHub: ahujasid/blender-mcp (open source foundation Tripo built on)
- Meshy Bridge docs: https://docs.meshy.ai/en/blender-plugin/bridge-to-blender
- GitHub: Unity-Technologies/MeshSyncDCCPlugins
- NVIDIA RTX Remix REST API: https://docs.omniverse.nvidia.com/kit/docs/rtx_remix/latest/docs/tutorials/tutorial-restapi.html
- Speckle architecture: https://speckle.guide/dev/architecture.html
- OpenAssetIO: https://github.com/OpenAssetIO/OpenAssetIO

**See also:** [06-tripo3d-platform-overview.md](./06-tripo3d-platform-overview.md), [07-tripo3d-api-mcp.md](./07-tripo3d-api-mcp.md)
