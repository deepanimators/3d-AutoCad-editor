# Aruct Render: Market Research & Implementation Roadmap

> Photorealistic rendering studio

## Executive Summary

The global architectural rendering software market is valued at $2.715B in 2024 and projected to reach $8.032B by 2035 (10.36% CAGR). Every major tool in this market — Enscape, Lumion, D5 Render, Twinmotion, V-Ray — requires a desktop install or a host application plugin. No credible rendering product is fully browser-native. This is a structurally open position that Aruct is placed to own, because the editor itself is already web-native. Aruct Render does not need to beat V-Ray on path-tracing physics. It needs to be the rendering studio that requires no install, lives in the same browser tab as the model, and produces client-ready stills in under two minutes from any device.

The convergence of three forces makes this technically viable in 2025 rather than aspirational: WebGPU reached full cross-browser support (Chrome, Firefox, Safari, Edge) in November 2025, enabling GPU-accelerated compute shaders and path tracing in the browser; AI denoising (OIDN, DLSS) collapses the sample count required for production-quality frames from thousands to tens; and NVIDIA RTX hardware is now mainstream at the $500-800 price point. A published Web3D '24 paper demonstrates a full OpenPBR path tracer running in a browser via WebGPU. The technical foundation is proven.

The recommended approach is to launch an MVP that matches Enscape's feature depth at roughly 80% — path-traced rendering, PBR materials, HDRI lighting, physical camera, client-sharing links — with the web-native zero-install advantage as the primary acquisition hook. Price it below Enscape and D5 as a bundle with the Aruct Pro subscription rather than as a standalone product. Use Blender/Cycles on cloud GPUs as the initial final-quality render backend (battle-tested, free, GPU-capable), then migrate to a custom Vulkan renderer in Phase 3. The critical Phase 1 investment is denoising quality and the curated HDRI and material starter library: these two factors determine 80% of first-impression quality judgments from architects, who make binary "this looks real / this looks like a video game" decisions.

---

## Market Overview

**Market size and growth**: The architectural rendering software market was $2.715B in 2024, growing to $2.997B in 2025, and projected to reach $8.032B by 2035 at a 10.36% CAGR (Market Research Future). A higher estimate from Technavio projects a $2.77B incremental increase from 2025 to 2030 at a 22.3% CAGR — the real-time rendering sub-segment is pulling overall numbers upward. Cloud-based rendering specifically grew from $1.5B in 2024 and is on track for $4.5B by 2035, making it the highest-velocity segment. The upstream BIM software market reached $5.06B in 2024 at a 15.1% CAGR — BIM-integrated rendering (the Enscape model) is the fastest-growing adoption vector.

**Geographic distribution**: North America holds approximately 40% of the market (~$0.90B in 2024). Europe holds ~30%. Asia-Pacific holds ~20% and is growing fastest in construction volume terms. The Middle East holds ~10% but punches above weight on revenue per seat due to high-value AEC project density.

**Structural transition underway**: The market is moving from offline batch rendering (V-Ray, Corona, Arnold) toward real-time path-traced hybrid engines (D5 Render, Twinmotion Path Tracer, Enscape path-traced mode). This transition is driven by: NVIDIA RTX hardware proliferation at mainstream price points; AI denoising maturity (DLSS, OIDN, AMD FSR) enabling high-quality output from 2-8 samples per pixel; and WebGPU standardization closing the browser graphics performance gap.

**User behavior**: 75% of designers now use real-time rendering daily or weekly. 52% operate in hybrid work environments. 45.7% of architects report that faster rendering directly reduces design decision time — speed is a primary productivity value driver.

**User segments by size**:
- Large architecture firms (>50 staff): ~15,000 firms globally. Primary tools: V-Ray, Enscape, Lumion.
- SMB architecture firms (5-50 staff): ~85,000 firms. Primary tools: Enscape, Twinmotion, D5 Render.
- Solo architects and freelancers: ~500,000. Primary tools: Twinmotion (free), D5 (free), Blender. High price sensitivity.
- Interior designers: ~300,000. Primary tools: Enscape, Corona, D5 Render.
- Real estate developers: ~50,000. Primary tools: Lumion, V-Ray via outsourcing.
- AEC visualization studios: ~10,000. Primary tools: V-Ray, Corona, Arnold.
- Urban planners: ~20,000. Primary tools: Twinmotion, Lumion.

**The unmet gap**: No major AEC rendering tool is fully browser-native. The 85,000 SMB firms and 500,000 solo architects who find Enscape and Lumion expensive or installation-heavy represent the primary addressable market for a web-first product.

---

## Competitor Analysis

### V-Ray (Chaos)

**Platform:** Desktop plugin (Windows + macOS). Plugins for 3ds Max, Maya, SketchUp, Rhino, Revit, Unreal Engine, Cinema 4D. No web.

**Pricing:** Solo $540/year, Premium $718.80/year. Chaos Cloud credits at $1/credit (20 free); bulk packs from $625/year (30,000 credits) to $1,050/year (60,000 credits). Per-frame cloud cost typically $0.05-$0.15.

**Strengths:**
- Deepest parameter control of any commercial renderer
- Physically accurate to the point of use in film/VFX production
- Seamless Chaos Cloud integration for cloud offload
- VRscans material library (real-world scanned materials)
- Chaos Scatter for vegetation and crowds
- Phoenix FD for fluid simulation
- Industry standard for hero shots at visualization studios and large firms

**Weaknesses:**
- Steep learning curve requiring 2-4 hours of scene/material setup before first render
- Complex interior scene takes 20-60 minutes per frame even on RTX hardware
- Requires substantial GPU investment per seat
- No native real-time preview (requires separate Chaos Vantage product)
- No web-based workflow of any kind

**Key differentiators:**
- Film/VFX-grade physical accuracy unmatched in the field
- Broadest host application support across the AEC and VFX ecosystem

---

### Enscape (Chaos)

**Platform:** Desktop plugin (Windows all plans; Apple Silicon Mac for SketchUp, Rhino, Archicad, Vectorworks — not Revit). No standalone operation.

**Pricing:** Solo $574.80/year, Premium $670.80/year, Collection $730.80/year. All plans include Chaos Cloud access and monthly AI credits (100/500/1,500). Collection adds Enscape Envision (client web viewer) and Enscape Impact (sustainability analysis).

**Strengths:**
- Used by 85 of the top 100 architecture firms and 50,000+ practices globally
- Zero export friction — visualize exactly what is in the BIM model
- Path-traced mode (2024+) challenges V-Ray/Corona for final stills
- VR walkthroughs from within the plugin
- Enscape Envision browser-based client sharing
- NVIDIA DLSS denoising
- Chaos Cloud render offload since v4.1.1

**Weaknesses:**
- Mac users lose Revit integration (no Revit for Mac)
- No standalone operation — requires host application license ($2,545/year for Revit alone)
- Restricted scene control compared to standalone apps
- Requires dedicated GPU with minimum 4GB VRAM
- Plugin architecture ties performance to host application frame rate

**Key differentiators:**
- Dominant market share in the large-firm BIM workflow segment — 85 of top 100 firms
- Enscape Envision provides the closest existing analog to Aruct Render's web sharing

---

### Lumion

**Platform:** Desktop standalone, Windows only. No Mac. No web.

**Pricing:** Pro $999/year (named-user), Studio $1,299/year (floating Pro + named Lumion View). Previous Standard tier ($749/year) discontinued in 2025.

**Strengths:**
- Largest built-in asset library (10,000+ objects in app)
- Strongest exterior and landscape scene composition tools
- LiveSync with SketchUp, Revit, Archicad, Vectorworks, AutoCAD, Rhino, BricsCAD, FormIt, Allplan
- Excellent animation and walkthrough tools with cinematic camera paths
- Lumion 2025 added ray-traced water/fog and AI upscaling
- Lumion View plugin extends into SketchUp/Revit for real-time design-phase feedback

**Weaknesses:**
- Windows-only is a growing liability as Apple Silicon gains architecture office market share
- Most expensive standard subscription at $999/year
- No path-traced interior accuracy (indirect light approximation, inferior to D5/Enscape)
- No cloud rendering — relies on third-party render farms
- No VR capability
- Optimized for exterior/massing; weaker for detailed interior material accuracy

**Key differentiators:**
- Best-in-class exterior and landscape scene composition
- Broadest LiveSync integrations across BIM and CAD tools
- Strongest animation and walkthrough feature set in the peer group

---

### Twinmotion (Epic Games / Unreal Engine)

**Platform:** Desktop standalone (Windows + macOS). Twinmotion Cloud for browser-based client sharing.

**Pricing:** Free for individuals and companies under $1M annual revenue. $445/seat/year commercial (includes Twinmotion Cloud).

**Strengths:**
- Free tier is genuinely capable — the most accessible entry point in the market
- Unreal Engine 5 foundation: Nanite (virtualized geometry), Lumen (dynamic GI), path tracer for finals
- Over 10,000 built-in assets plus 1M+ from Quixel Megascans and Sketchfab
- Twinmotion Cloud enables browser-based interactive panorama and walkthrough sharing
- VR support
- Direct Link with Revit, Rhino, SketchUp Pro, Archicad, 3ds Max, Vectorworks
- Photo matching and virtual camera system

**Weaknesses:**
- Designed for finished models, not concept exploration — renders something already designed, not generating design options
- Path Tracer for final output requires 8GB+ VRAM and is Windows-only
- Asset placement and scene population less intuitive than Lumion for non-game-engine users
- No native cloud rendering offload (Twinmotion Cloud is sharing, not rendering)
- Unreal Engine import pipeline can be complex for architects unfamiliar with the toolchain

**Key differentiators:**
- Free tier with genuine capability eliminates the price barrier for solo architects
- Unreal Engine 5 foundation delivers game-engine cinematic quality
- Quixel Megascans asset library (1M+ assets) is the deepest in the market

---

### D5 Render

**Platform:** Desktop standalone, Windows only. No macOS. No web.

**Pricing:** Community free (non-commercial), Pro $360/year ($38/month), Teams $708/seat/year minimum 2 seats ($75/seat/month), Education free.

**Strengths:**
- Hybrid real-time path tracing on DirectX 12 + DXR delivers V-Ray-quality stills at interactive speeds
- LiveSync for SketchUp, Revit, Rhino, 3ds Max, Archicad, Cinema 4D, Blender, Vectorworks
- AI tools: Atmosphere Match (match sky/lighting from reference photo), AI Enhancer, Style Transfer
- 16,000+ asset library on Pro tier
- Render passes and channel maps for compositing
- VR panoramas and interactive presentations
- Best value proposition: near-photorealistic output at $360/year
- Output up to 16K stills and panoramas

**Weaknesses:**
- Windows-only excludes a significant slice of the architecture market using Apple Silicon
- Excludes AutoCAD in LiveSync integrations
- Community tier severely limited (2,100 assets, 50 AI credits)
- Teams pricing ($708/seat/year) is dramatically higher than Pro, discouraging team adoption
- No Mac, no web, no cloud rendering

**Key differentiators:**
- Best path-tracing quality-to-price ratio in the real-time tool category
- Atmosphere Match for reference-photo-based scene lighting is widely praised and relatively unique

---

### Corona Renderer (Chaos)

**Platform:** Desktop plugin. 3ds Max (Windows), Cinema 4D (Windows/Mac). No standalone.

**Pricing:** Solo $394.80/year, Premium $514.80/year.

**Strengths:**
- Historically CPU-only — consistent results across any machine without GPU dependency
- Corona 12 (July 2024) added export to Chaos Vantage for GPU real-time visualization
- LightMix: post-render light intensity adjustment without re-rendering
- Interactive rendering (IPR) with live scene update preview
- VFB 2.0 with tone-mapping, glare, bloom, and color grading
- AI-based render upscaler in Corona 12

**Weaknesses:**
- CPU-only path is increasingly uncompetitive on render time vs. GPU alternatives
- Limited to 3ds Max and Cinema 4D — narrowest host application support in the peer group
- GPU path in Corona 12 requires export to Vantage rather than native GPU rendering
- Interior specialists only; poor fit for exterior/landscape or animation
- Chaos Vantage link differs in fidelity from production Corona output

**Key differentiators:**
- LightMix post-render light adjustment is the most user-praised workflow differentiator in the field
- Deepest interior natural-light accuracy via CPU path tracing

---

### KeyShot

**Platform:** Desktop standalone (Windows + macOS). Cloud rendering via credit API.

**Pricing:** Professional $1,299/year, Business $1,599/year. Cloud Rendering credits: $25 for 100 GigaSamples scaling to $6,875 for 50,000 GS. Studio VR add-on $1,188/year. Education $95/year.

**Strengths:**
- Best-in-class material fidelity for product surfaces (plastics, metals, glass, fabrics)
- Supports 34+ CAD formats
- Network Rendering for local farm distribution
- Cloud rendering via credit system
- Extremely fast iteration for material studies
- AI-powered visualization modes

**Weaknesses:**
- Built for product/industrial design, not buildings — poor fit at architectural scale
- No BIM format support (no Revit, no IFC, no Archicad)
- No LiveSync with AEC authoring tools
- Very expensive ($1,299+/year) for the functionality architects actually need
- No web viewer or client sharing

**Key differentiators:**
- Dominant in the product/industrial design segment, not direct AEC competition
- Broadest CAD format import support (34+ formats) for manufactured product geometry

---

### Blender Cycles

**Platform:** Desktop standalone (Windows, macOS, Linux). GPU via CUDA, OptiX, HIP, Metal.

**Pricing:** Free (GPL). Cloud farm rates: GPU rendering $0.003/OctaneBench-hour on RTX 5090; RenderStreet GPU (L40s) at $4.49/server-hour or CPU at $3.00/server-hour. Unlimited CPU on RenderStreet: $59.97/month.

**Strengths:**
- Zero cost including for commercial use
- Full 3D pipeline in one app (modeling, sculpting, animation, compositing)
- Broadest hardware support including Apple Silicon GPU rendering via Metal
- OIDN and OptiX denoiser built-in
- Scales to cloud farms at commodity pricing
- EEVEE real-time rasterizer for fast previews
- Huge community with free materials, HDRIs, and assets

**Weaknesses:**
- Steep learning curve — designed for 3D artists, not architects
- No direct BIM integration (no Revit/Archicad LiveSync)
- SketchUp/Rhino import via IFC or intermediary formats only
- Many architects hire visualization studios to operate it rather than using it directly
- No real-time architectural walkthrough tool equivalent to Enscape/Lumion
- No shared team license management

**Key differentiators:**
- Zero cost barrier makes it the default choice for visualization studios operating on thin margins
- Recommended as the Phase 1-2 cloud render backend for Aruct due to proven GPU-capable cloud infrastructure

---

### NVIDIA Omniverse

**Platform:** Desktop (Windows, RTX GPU required minimum 6GB VRAM). Cloud APIs available programmatically.

**Pricing:** Free for individuals. Enterprise $4,500/year per GPU. Cloud APIs priced on compute consumption.

**Strengths:**
- OpenUSD native — the most strategic long-term play in 3D scene interchange
- RTX Path Tracing with OmniPBR material system
- Real-time multi-user collaboration across applications via USD Live
- Physics simulation via PhysX 5
- Connects to 3ds Max, Maya, Blender, SketchUp, Revit via connectors
- Cloud APIs (USD Render, Write, Query, Notify) open to developer embedding as of March 2024
- 300,000+ downloads, 252+ enterprise deployments

**Weaknesses:**
- RTX GPU mandatory — cannot run on AMD or integrated graphics
- Enterprise pricing ($4,500/GPU/year) puts it out of reach for most AEC practices
- Positioned at industrial/manufacturing digital twins, not architecture SMB
- Requires understanding USD and the Omniverse connector ecosystem
- Overkill for standard architectural visualization workflows

**Key differentiators:**
- Only platform with genuine real-time multi-user 3D collaboration at scale
- OpenUSD as scene format is the strategic long-term standard — relevant for Aruct's Phase 3 architecture

---

## Feature Comparison Matrix

| Feature | V-Ray (Chaos) | Lumion | Enscape | Twinmotion (Epic) | D5 Render | Aruct (Proposed) |
|---------|---------------|--------|---------|-------------------|-----------|-----------------|
| **Platform** | Desktop plugin | Desktop (Win only) | Desktop plugin | Desktop (Win/Mac) | Desktop (Win only) | Web browser |
| **Mac support** | Partial | No | Partial | Yes | No | Yes (any OS) |
| **No install required** | No | No | No | No | No | Yes |
| **Path-traced rendering** | Yes | Partial | Yes (2024+) | Yes | Yes | Yes (WebGPU) |
| **Real-time preview** | Via Vantage | Yes | Yes | Yes | Yes | Yes |
| **AI denoising** | Yes (DLSS) | Yes (AI upscale) | Yes (DLSS) | Yes | Yes | Yes (OIDN WASM) |
| **PBR materials** | Yes | Yes | Yes | Yes | Yes | Yes |
| **HDRI environment** | Yes | Yes | Yes | Yes | Yes | Yes (50 curated) |
| **Physical sun/sky** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Depth of field** | Yes | Yes | Yes | Yes | Yes | Yes |
| **4K still output** | Yes | Yes | Yes | Yes | Yes (16K) | Yes |
| **8K+ output** | Yes | Yes | Yes | Yes | Yes | Phase 2 |
| **Animation/walkthrough** | Via Vantage | Yes | Yes | Yes | Yes | Phase 2 |
| **VR panorama** | Yes | No | Yes | Yes | Yes | Yes (MVP) |
| **Render passes/AOVs** | Yes | No | No | No | Yes (Pro) | Phase 2 |
| **LightMix** | No | No | No | No | No | Phase 2 |
| **AI style transfer** | No | No | Via Veras | No | Yes | Phase 2 |
| **Atmosphere match** | No | No | No | No | Yes | Phase 2 |
| **Cloud render offload** | Yes (Chaos Cloud) | No | Yes (Chaos Cloud) | No | No | Phase 2 |
| **Client share link** | No | No | Yes (Envision) | Yes (Cloud) | Partial | Yes (MVP) |
| **Client annotations** | No | No | No | No | No | Yes (MVP) |
| **Built-in asset library** | Cosmos | 10,000+ | Cosmos | 10,000+ | 16,000+ (Pro) | 500 (MVP), 5,000+ (Ph2) |
| **BIM LiveSync** | Yes | Yes | Yes | Yes | Yes | Via Aruct Editor |
| **IFC import** | No | No | No | No | No | Phase 2 |
| **Web viewer for clients** | No | No | Yes (Envision) | Yes (Cloud) | No | Yes (MVP) |
| **Multi-user collaboration** | No | No | No | No | No | Phase 3 |
| **API / MCP integration** | No | No | No | No | No | Yes (MCP server) |
| **Plugin marketplace** | No | No | Via Chaos | No | No | Phase 3 |
| **Price (individual/year)** | $540 | $999 | $575 | Free / $445 | Free / $360 | Free / $290 |

---

## Recommended Feature Set for Aruct Render

### Phase 1: MVP (Months 1-6)

**Goal**: Match Enscape's feature profile at 80% depth with a web-native zero-install advantage. Produce client-credible stills without requiring architects to install anything.

**Rendering engine**
- WebGPU path tracer with progressive refinement (coarse-to-fine, visibly sharpening in the browser as samples accumulate)
- Hybrid mode: WebGL 2.0 rasterization for interactive viewport at all times; path tracing enabled on demand for final output
- AI denoising: OIDN 2.x compiled to WebAssembly with SIMD extensions, running in a Web Worker. Server-side OIDN for final stills (albedo + normal auxiliary buffers for highest quality)
- Interactive target: 4 samples per pixel at 10+ fps on RTX 3060-class GPU
- Final still target: 512+ spp with full denoising pass; cloud-dispatched for large scenes

**Lighting**
- HDRI environment map system: 50 curated HDRIs (interior studio, exterior sky, golden hour, overcast, dramatic, night)
- Physical sun/sky model (Hosek-Wilkie or Preetham) with date, time, and latitude controls
- Point, spot, and area lights with intensity and color temperature controls
- Emissive material support for self-lit surfaces

**Materials**
- Principled BSDF: base color, roughness, metallic, IOR, opacity, normal map, displacement, emission
- Texture map import: JPG, PNG, EXR, TIFF up to 8K
- Material inspector panel with live preview swatch
- Starter library: 200 curated PBR materials across concrete, wood, glass, steel, brick, plaster, fabric, and water categories

**Camera system**
- Physical camera: focal length 14-200mm, f-stop, ISO, exposure compensation
- Depth of field with click-to-focus picker
- Minimum 10 saved camera bookmarks per scene
- Pan, orbit, and fly navigation modes

**Output**
- Still export: PNG (with transparent background option), JPEG, EXR — up to 4K (3840×2160)
- 360-degree equirectangular panorama for VR viewer delivery
- Render progress indicator with time-to-completion estimate
- Render history: last 20 renders per project, downloadable

**Editor integration**
- One-click "Send to Render" from Aruct Editor — no file export, no format conversion
- Scene graph sync via `RenderSnapshot` export in `packages/core`: geometry, materials, lights, camera from editor state serialized to glTF 2.0 with Aruct extension annotations
- Incremental diff sync over the existing Y.js CRDT layer — not full scene upload on each change

**Client sharing**
- Shareable render link: read-only URL with image carousel per saved camera
- Basic annotation: pin comments to 2D image coordinates on the shared render
- Approval status: client can mark renders as approved or request changes

**Asset library**
- 500 scene objects: furniture (chairs, tables, desks, sofas), 10 tree species, textured people figures, 10 vehicle types
- Category browse and text search

**Why this scope**: The five things that convert free trial to paid in rendering tools are quality of first render, speed to first render, ease of lighting setup, client sharing capability, and asset library breadth. This MVP addresses all five at table-stakes depth while the web-native zero-install story handles acquisition.

---

### Phase 2: Growth (Months 7-12)

**Goal**: Reach competitive parity with D5 Render Pro on features while opening the animation and cloud rendering capability gap that no web-native tool currently fills.

**Rendering quality upgrades**
- 8K still output (7680×4320)
- Caustics support (pool water refractions, glass dispersion)
- Subsurface scattering (skin, wax, marble, frosted glass)
- Motion blur for animation frames
- Adaptive sampling (concentrate sample budget in high-variance regions automatically)
- GPU cloud burst rendering: offload final-quality renders to cloud GPUs when the local GPU is slow or the user is on a thin client — the defining web-native capability advantage

**Animation and walkthroughs**
- Keyframe camera path animation with easing curves
- Time-of-day animation (sun moves along a timeline)
- MP4 and WebM export at 1080p and 4K (24/30/60fps)
- Target duration: 10-120 second walkthroughs

**Materials v2**
- Material library expansion to 1,500 PBR materials
- User material upload and save to personal library
- Material layering: decals, dirt and wear overlays
- Procedural textures: checker, gradient, noise
- Adobe Substance .sbsar format import (connects Aruct to the Substance ecosystem)

**AI features**
- Atmosphere Match: analyze a reference photo and apply matching sky, time-of-day, and tone to the scene
- AI Upscaler: 2x/4x upscale via ESRGAN or equivalent
- Style Transfer presets: sketch, watercolor, pencil, painterly (for concept-phase client presentations)

**Lighting v2**
- IES photometric profile library: 200+ fixture profiles from major manufacturers
- LightMix: adjust per-light intensity and color after the render without re-rendering (via multi-layer EXR compositing in the browser)
- Neon and emissive geometry support for signage and feature lighting

**Render passes / AOVs**
- Diffuse, specular, reflection, refraction, shadow, depth, normals, and object mask passes
- Export as layered TIFF or multi-channel EXR
- Basic browser-based layer compositor with blend modes

**Asset library v2**
- 5,000+ objects: expanded furniture, landscape elements (terrain, water, ground cover), environmental context
- User-uploaded assets (FBX, OBJ, glTF) to personal library

**Integrations**
- IFC import for rendering geometry without Aruct Editor (for consultants using other BIM tools)
- glTF/GLB export of rendered-quality scene for embedding in third-party presentations
- Aruct MCP server: programmatic render trigger for CI/CD integration and automated overnight renders

**Collaboration**
- Multi-user simultaneous camera viewing (see where teammates are looking)
- Comment threads tied to render versions
- Client approval workflow: share link → client marks approved or requests changes → designer notified

---

### Phase 3: Leadership (Months 13-24+)

**Goal**: Build capabilities that no existing tool offers and that create platform lock-in.

**Aruct-native intelligence**
- AI-generated design variants: "Generate 3 material colorway variations" — uses the Aruct scene graph to produce coherent alternative renders, not image-space diffusion only
- Parametric material studies: vary a material parameter across a render grid for client selection (e.g., six wood species side-by-side at the same camera angle)
- Automated render scheduling: "render all cameras at sunrise lighting every night" — cron trigger via Aruct MCP server
- Real-time BIM data overlay in render: toggle Revit parameter data (room names, areas, spec data) as overlay on rendered imagery

**Cloud rendering infrastructure**
- Dedicated Aruct cloud render farm: own or partner with bare-metal RTX 4090/5090 providers (Hetzner, Lambda Labs, Vast.ai at ~$0.50-$0.80/GPU-hour wholesale)
- Render on demand with no local GPU required — full photorealistic output from any browser including iPad and mobile
- Credit pricing: 1 credit = 1 minute of RTX 4090-equivalent compute

**Next-generation rendering**
- Neural Radiance Field / 3D Gaussian Splatting import from drone or camera captures: blend real captured context with modelled design
- AI material generation from text prompt: "generate a weathered copper cladding material" → PBR texture set
- Spectral rendering for daylighting and energy compliance: CIE color matching, full spectrum for lux and candela output against planning requirements
- WebGPU pixel streaming from cloud GPU for real-time walkthrough on any device

**Platform and enterprise**
- White-label render portal for large firms: custom domain, logo, and color scheme at $2,000/month
- API-first render trigger: POST /renders → queued job → webhook on completion
- Plugin marketplace: third-party material libraries, furniture brand packs, HDRIs — 30/70 Aruct/creator revenue share
- SSO/SAML and SCIM provisioning for enterprise seat management
- Rendering audit log for compliance: who rendered what, when, with what settings

**Delivery formats**
- Interactive 3D web viewer (WebGPU): embed a navigable scene in a client presentation website with no download
- VR headset streaming: Aruct Cloud VR, frame-streamed to Quest via browser
- Print-optimized export: CMYK-targeted TIFF, bleed-ready PDF at 300 DPI
- Auto-generated social media crops: Instagram 1:1, LinkedIn 4:5, Twitter 16:9

---

## Technical Architecture

### Rendering pipeline tiers

**Tier 1 — Interactive preview (in-browser, real-time)**
WebGPU compute shaders for hybrid rasterization and limited path tracing. The rasterizer handles primary visibility via a G-buffer (positions, normals, albedo, roughness, metallic). A screen-space path tracing pass computes indirect illumination via 1-4 shadow/GI rays per pixel using RTX-capable GPU through WebGPU's `RayQuery` extension when available (Chrome 113+ on DX12 backends). For non-RTX GPUs (AMD, Intel integrated), fall back to rasterized GI approximation (SSAO, SSR, environment probes). Target: 10+ fps on RTX 3060-class GPU, 2-4 fps on AMD/Intel.

AI denoising in browser: OIDN 2.x compiled to WebAssembly with SIMD, running in a dedicated Web Worker so it does not block the main thread. Server round-trip fallback for MVP: send the noisy buffer to a cloud endpoint, denoise on CPU, return in under 1 second.

**Tier 2 — Final quality (cloud-dispatched)**
Phase 1-2: Export Aruct scene to glTF 2.0 and enqueue a headless Blender/Cycles render job on cloud GPU infrastructure. Blender/Cycles is the recommended Phase 1-2 backend because it is battle-tested for archviz output, free, GPU-capable via OptiX/HIP/Metal, and operates on commodity cloud hardware.

Phase 3: Custom Vulkan renderer (maximum margin and control). WebGPU pixel streaming from cloud RTX instance for real-time walkthroughs on thin clients.

**Job queue infrastructure**: Redis job queue, GPU worker containers on Docker, S3-compatible object storage for render output, WebSocket push notification to client on job completion. CDN delivery for client-sharing links (sub-100ms TTFB).

### Scene format

Use **glTF 2.0 with PBR extensions** as the canonical interchange between the editor and the render engine. Key extensions:

- `KHR_materials_ior` — glass and refraction
- `KHR_materials_transmission` — transparent materials
- `KHR_materials_volume` — subsurface and participating media
- `KHR_materials_emissive_strength` — neon and emissive surfaces
- `KHR_lights_punctual` — point, spot, directional lights
- `EXT_mesh_gpu_instancing` — efficient repeated objects (trees, chairs, column grids)
- `KHR_materials_unlit` — wireframe and conceptual preview mode

glTF gives Aruct a standards-compliant format that also exports cleanly to Three.js, Babylon.js, Blender, and any glTF-compatible viewer, multiplying the downstream utility of renders.

### Material model

Implement **OpenPBR** (Autodesk/Adobe joint standard, compatible with MaterialX) as the internal Aruct Render material model. OpenPBR extends basic metallic/roughness with coat, sheen, transmission, and thin-film interference. A 2024 paper demonstrates a full OpenPBR path tracer in WebGPU — this is proven feasible in the browser. Surface the editing UI as Principled BSDF parameters (what architects recognize from the industry) and translate to OpenPBR internally for the render backend.

### Key architecture decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Browser rendering API | WebGPU + WebGL 2.0 fallback | WebGPU cross-browser since Nov 2025; ~10x perf over WebGL for path tracing |
| Scene format | glTF 2.0 + KHR extensions | Industry standard; Three.js/Babylon.js native; Blender-compatible for cloud backend |
| Material model | OpenPBR (Principled BSDF in UI) | Future-proof; MaterialX compatible; proven in WebGPU |
| Phase 1-2 cloud render backend | Headless Blender/Cycles | Battle-tested for archviz; free; GPU via OptiX/HIP/Metal |
| Phase 3 cloud render backend | Custom Vulkan renderer | Maximum margin and control when volume justifies |
| Interactive denoising | OIDN WASM in Web Worker | Hardware-agnostic; best quality/speed ratio; non-blocking |
| Final still denoising | Server-side OIDN with albedo+normal buffers | Higher quality via auxiliary buffer inputs |
| Animation frame rendering | Server-side with frame-level parallelism | N frames distributed across N GPU nodes |
| Scene sync to renderer | Incremental diff over Y.js layer | Already in Aruct stack; avoids full-scene re-upload on every edit |

---

## Integration with Aruct Editor

### Scene graph export

Add a `RenderSnapshot` export function to `packages/core` that serializes the current scene to a glTF 2.0 document with `ARUCT_render_settings` and `ARUCT_material_overrides` extension annotations. This keeps the architecture layer boundaries in `CLAUDE.md` intact: the renderer is injected into `<Viewer>` via props and children; it does not import from `useEditor` directly. The render engine is a consumer of `packages/core` scene data, not a peer of the editor.

**Key sync points**:
- **Geometry**: Export all scene nodes to glTF meshes with `EXT_mesh_gpu_instancing` for repeated objects (chairs, trees, column grids) to keep scene file size manageable
- **Materials**: Translate the Aruct material store to glTF PBR materials; custom parameters in `ARUCT_materials` extension block
- **Lights**: Translate Aruct light nodes to `KHR_lights_punctual`
- **Camera**: Export the current `packages/viewer` presentation camera as a glTF camera node with physical parameters
- **Environment**: Serialize HDRI selection and sun position to render settings extension

### MCP server (`packages/mcp`)

Extend the existing MCP server with a `RenderAdapter` that enqueues cloud render jobs and stores output URLs back to the scene record:

```
POST /render
{
  "scene_id": "...",
  "camera": "camera_a",
  "resolution": "4k",
  "samples": 512,
  "denoised": true,
  "notify_webhook": "https://..."
}
→ { "job_id": "...", "estimated_seconds": 45 }
```

This enables CI/CD integration (nightly renders of committed design changes), automated marketing pipelines (PropTech platforms that auto-render listings), and batch camera sweeps (render all cameras overnight, return URLs in the morning).

### Plugin marketplace (`df0b8945`)

The existing plugin marketplace is the natural distribution channel for third-party render assets. The plugin manifest should include a `render_assets` field declaring material packs, HDRIs, and scene objects that are injected into the Render studio panel when the plugin is installed. Target integrations: Poliigon PBR materials, Poly Haven HDRIs, Architextures textures, branded furniture libraries.

### IFC and DWG import (`0f4d80de`)

IFC/DWG import buttons already wired in the editor. The render system must handle IFC polyhedral geometry (potentially 100MB+ files) with: automatic material assignment from IFC property sets (material by layer/type); bounding box simplification for non-critical far-field geometry; and performance limits to prevent memory exhaustion on large models.

### Real-time sync (`f23085ef`)

The Y.js real-time sync toggle should drive render preview invalidation: when sync is on and a collaborator changes geometry, the render preview resets and begins progressive re-render from scratch. Y.js awareness protocol carries "render invalidation" signals as ephemeral state — no separate websocket channel needed.

### PDF underlay (`5349a4c5`)

The calibrated PDF underlay system generates 2D floor plans that can inform render camera angle for "Plan Oblique" renders — axonometric views from above widely used in planning submissions. Offer a "Plan Oblique" camera preset that reads the calibrated floor plan scale from the PDF underlay state.

---

## Pricing Strategy

### Competitor benchmark

| Tool | Individual entry | Individual standard | Team/seat | Cloud rendering |
|------|-----------------|---------------------|-----------|-----------------|
| Twinmotion | Free | $445/year | Included | No (sharing only) |
| D5 Render | Free (non-commercial) | $360/year | $708/seat/year | None |
| Enscape | — | $574.80/year | $730.80/year | Chaos Cloud credits included |
| Lumion | — | $999/year | $1,299/year | None |
| V-Ray | — | $540/year | $718.80/year | $1/credit |
| Corona | — | $394.80/year | $514.80/year | Via Chaos Cloud |
| KeyShot | — | $1,299/year | $1,599/year | Pay-per-credit |

### Recommended pricing model

Aruct Render is not a standalone product — it is the value anchor that justifies the Aruct Pro/Team subscription upgrade. The goal is not to price-compete with V-Ray as a standalone renderer but to make Aruct Render the feature that makes declining a Pro upgrade feel irrational.

| Plan | Monthly | Annual | Render credits | Notes |
|------|---------|--------|----------------|-------|
| Aruct Free | $0 | $0 | 50 credits/month (~5 high-quality renders) | Web preview only, 1080p max, watermarked exports |
| Aruct Pro | $29/month | $290/year | 500 credits/month (~50 renders) | Full quality, 4K output, client share links, no watermark |
| Aruct Team | $25/seat/month | $240/seat/year | 300 credits/seat/month + 2,000 shared pool | Team annotation, approval workflow, shared asset library |
| Credit top-up | — | — | $0.05/credit (minimum 100 = $5) | Pay-as-you-go burst |
| Cloud render burst | Metered | Metered | $0.10/credit-minute GPU equivalent | Animation frames and cloud offload |

**Pricing rationale**:
- $290/year Pro positions below Enscape ($574.80), D5 Pro ($360), and well below V-Ray ($540) — aggressive but defensible because Aruct Render is bundled with the full editor and offers zero-install access from any device.
- 50 free credits per month matches D5 Community's 50 AI credits: enough to produce 5 compelling client-ready renders and trigger conversion without giving away the product.
- The credit model mirrors Chaos Cloud and KeyShot Cloud, which architects already understand. 1 credit = 1 standard-quality 4K still render on cloud GPU.
- Team plan at $25/seat/month sharply undercuts D5 Teams at $75/seat/month. The shared credit pool (2,000/month) creates a team-level value incentive beyond just summing individual Pro plans.
- No perpetual licenses: the industry moved entirely to SaaS subscription (V-Ray in 2019, Enscape and Lumion following). No architects expect perpetual licenses for rendering tools.

**Revenue expansion mechanics**:
- Asset marketplace: 30% Aruct / 70% creator revenue share on material packs, furniture libraries, HDRI sets
- White-label render portal for large firms: $2,000/month for custom-branded client-sharing URL
- Render API for PropTech and automated pipelines: $0.08/credit for programmatic render jobs

---

## Success Metrics

### Adoption KPIs

| Metric | 3-month target | 6-month target | 12-month target |
|--------|---------------|----------------|-----------------|
| Renders created per month | 5,000 | 25,000 | 150,000 |
| Monthly Active Renderers | 500 | 2,500 | 15,000 |
| Editor-to-Render activation rate | 15% | 30% | 45% |
| Free-to-Pro conversion driven by credit exhaustion | — | 8% | 12% |
| Client share links created per month | 500 | 3,000 | 20,000 |

### Quality KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first render (scene open → first image) | < 3 seconds (interactive mode) | P50 and P95 in product analytics |
| Final render turnaround (4K still, cloud) | < 2 minutes | P50 cloud job duration |
| Render success rate | > 99.5% | Job completion rate |
| Client share link load time | < 1.5s TTFB | CDN metrics |
| User render quality satisfaction | > 4.2/5 | In-app rating after 3rd render |

### Business KPIs

| Metric | 12-month target |
|--------|----------------|
| Render-attributed ARR (Pro upgrades) | $500K |
| Credit top-up revenue | $150K |
| Asset marketplace GMV | $50K |
| 90-day churn delta: Render users vs. non-Render users | Render users churn 40% less |
| NPS delta: Render users vs. baseline | +15 points |

### Technical KPIs

| Metric | Target |
|--------|--------|
| GPU memory footprint (browser render session) | < 4GB VRAM (mid-range GPU target) |
| WebGPU frame rate, typical scene, RTX 3060 equivalent | > 10 fps |
| Scene upload time (editor → render engine, 50MB scene) | < 5 seconds |
| OIDN denoising latency (WASM, 1080p buffer) | < 500ms |
| Cloud render queue wait time | < 30 seconds P90 |

### Competitive displacement metrics

| Metric | 12-month target |
|--------|----------------|
| Users who cancelled a competitor subscription after adopting Aruct Render | 500 (survey-based) |
| Firms using Aruct Render as primary rendering tool | 200 firms |
| Community-uploaded render assets | 1,000 |

---

## Implementation Timeline

### Months 1-2: Foundation

**Milestone**: Rendering pipeline is available in the browser and produces a recognizable render from an Aruct Editor scene.

- Set up WebGPU render context within the `apps/editor` shell — keep render system isolated from `packages/viewer` per layer boundary rules
- Implement rasterized G-buffer pass (positions, normals, albedo, roughness, metallic)
- Build `RenderSnapshot` export function in `packages/core` serializing scene to glTF 2.0 with Aruct extensions
- Wire "Send to Render" button in editor toolbar
- Implement HDRI environment loading and basic tone mapping
- Integrate OIDN WASM build in a Web Worker for interactive denoising
- Internal alpha: team can produce a recognizable render from any editor scene

**Verify**: An Aruct scene renders to a 1080p JPEG in the browser in under 10 seconds with no install step.

---

### Months 3-4: Quality and client sharing

**Milestone**: Renders are at a quality level architects would share with clients. Client sharing links work.

- Implement path tracing pass (1-4 rays/pixel) using WebGPU compute shaders; fall back to SSAO+SSR on non-RTX GPUs
- Build 50-HDRI environment library and physical sun/sky model (Hosek-Wilkie)
- Implement Principled BSDF material system with 200 starter PBR materials
- Build physical camera controls (focal length, f-stop, DoF with focus picker)
- Implement render history panel (last 20 renders, downloadable)
- Build client share link (read-only URL with image carousel and pin-comment annotations)
- Build cloud job queue: Redis + GPU worker containers, S3 output storage, WebSocket notification
- 4K still export: PNG, JPEG, EXR

**Verify**: An architect reviewing Phase 1 renders alongside D5 Render output does not judge Aruct as obviously inferior. Client share link loads in < 1.5 seconds on a cold link.

---

### Months 5-6: Asset library and go-to-market

**Milestone**: MVP shipped to early access users. Credit billing live.

- Build 500-object asset library with search and category browse
- Implement 360-degree equirectangular panorama export
- Build render credit system: track consumption, enforce limits, show usage in UI
- Implement watermark for Free tier exports
- Wire Stripe billing for Pro upgrade at $290/year via existing auth/subscription infrastructure
- Onboarding flow: first-time user sees a guided "your first render in 60 seconds" walkthrough
- Public beta launch to waitlist

**Verify**: A new user with no rendering experience produces a 4K client-ready render within 5 minutes of opening Aruct Render for the first time.

---

### Months 7-9: Animation and cloud burst rendering

**Milestone**: Walkthroughs are exportable. Cloud GPU offload works for users on thin clients.

- Implement keyframe camera path animation with easing curves
- Add time-of-day sun animation on a timeline
- MP4/WebM export pipeline: server-side frame rendering with parallelism across GPU nodes
- GPU cloud burst: users can send heavy final renders to cloud GPUs regardless of local GPU capability
- IES photometric profile import (200 fixture profiles)
- Adaptive sampling implementation

**Verify**: A 30-second walkthrough animation renders to 1080p MP4 in under 15 minutes via cloud burst from a browser on a MacBook Air with no discrete GPU.

---

### Months 10-12: Material platform and integrations

**Milestone**: Material library at 1,500 materials. IFC import working. MCP render API live. D5 Pro feature parity reached.

- Material library expansion to 1,500 PBR materials
- User material upload and personal library
- Adobe Substance .sbsar import
- AI Upscaler (2x/4x via ESRGAN)
- Style Transfer presets (sketch, watercolor, pencil, painterly)
- Atmosphere Match from reference photo
- IFC import for rendering geometry from external BIM tools
- Render passes/AOVs export (layered TIFF, multi-channel EXR)
- LightMix via multi-layer EXR compositor in browser
- Aruct MCP render API: programmatic render trigger with webhook notification
- Client approval workflow: approved/changes-needed status with designer notification

**Verify**: An architecture firm can point the Aruct MCP server at their CI/CD pipeline and receive rendered images of every committed design change automatically without a single designer manually triggering a render.

---

### Months 13-18: Platform and leadership features

**Milestone**: Dedicated cloud render farm. Plugin marketplace for render assets. Enterprise features launched.

- Aruct cloud render farm on bare-metal RTX hardware (or negotiated partnership with infrastructure provider)
- Render-on-demand from any device including iPad and mobile
- Plugin marketplace render_assets manifest: third-party material packs, HDRI sets, furniture libraries
- White-label render portal for large firms
- Multi-user render viewing with camera presence indicators
- Neural Radiance Field / 3D Gaussian Splatting import
- AI material generation from text prompt
- Spectral rendering mode for daylighting/energy compliance
- SSO/SAML for enterprise accounts
- Rendering audit log

**Verify**: A top-25 architecture firm completes a 6-month pilot and replaces their Enscape or Lumion subscription with Aruct as the primary rendering tool for client presentations.
