# 3D Viewer and Rendering — Features and Gaps

Source: `packages/viewer/src/`

## Renderer Architecture

Three.js / React Three Fiber (R3F) based. Each node kind has a dedicated system component that subscribes to the scene store and maintains Three.js objects. See `wiki/architecture/renderers.md` for the pattern.

```
<Viewer>
  <SceneRenderer>          ← iterates live node list
    <NodeRenderer>         ← dispatches to kind-specific renderer
      <WallSystem>
      <DoorSystem>
      <StairSystem>
      …
    </NodeRenderer>
  </SceneRenderer>
  <SelectionManager>
  <ViewerCamera>
  <Lights>
  <PostProcessing>
  <SceneBVH>
</Viewer>
```

## Implemented Systems

### Core Rendering
| Feature | File | Notes |
|---|---|---|
| R3F canvas + Three.js WebGPU | `viewer/index.tsx` | TSL (Three Shading Language) compatible |
| Frame limiter (idle → 1fps, active → 60fps) | `frame-limiter.tsx` | Reduces GPU load on idle |
| GPU performance monitor | `gpu-perf.ts` | Logs frame times |
| Scene BVH (Bounding Volume Hierarchy) | `scene-bvh.tsx` + tests | Used for raycasting and walkthrough collision |
| Error boundary | `error-boundary.tsx` | Catches renderer crashes |
| KTX2 compressed textures | `ktx2-loader.ts` + `use-gltf-ktx2.tsx` | Basis Universal, reduces VRAM |
| Post-processing pipeline | `post-processing.tsx` | SSAO, bloom, tone mapping |

### Node Systems (all in `systems/`)
| System | Nodes Handled | Notes |
|---|---|---|
| `wall-system.tsx` | Wall, with openings | CSG-based opening cutouts |
| `door-system.tsx` | Door | Animation (open/close angle) |
| `door-animation-system.tsx` | Door | Spring animation |
| `window-system.tsx` | Window | Animation (open %) |
| `window-animation-system.tsx` | Window | — |
| `stair-system.tsx` | Stair + segments | Tread/riser geometry |
| `slab-system.tsx` | Slab | Edge profile; tests |
| `ceiling-system.tsx` | Ceiling | — |
| `roof-system.tsx` | Roof + segments | Ridge/valley geometry |
| `fence-system.tsx` | Fence | Spline path |
| `column-geometry.ts` | Column | — |
| `elevator-interaction-system.tsx` | Elevator | — |
| `item-system.tsx` | Item (GLB) | Async GLB load, material replacement |
| `item-light-system.tsx` | Item lights | Light pools from item extras |
| `level-system.tsx` | Level | Floor/ceiling visibility per level |
| `floor-elevation-system.tsx` | Floor elevation | — |
| `zone-system.tsx` | Zone | Room volume visualization |
| `scan-system.tsx` | Point cloud / Scan | Splat renderer |
| `geometry-system.tsx` | Mesh | Arbitrary mesh nodes |
| `guide-system.tsx` | Guide | 3D guide planes |
| `surface-hole-geometry.ts` | Surface holes | Shared CSG utility |
| `interactive-system.tsx` | Interactive nodes | Pointer event routing |
| `control-widget.tsx` | Transform handles | Drag handles for selected nodes |

### Camera
| Feature | File | Notes |
|---|---|---|
| Orbit camera | `viewer-camera.tsx` | Pan/rotate/zoom |
| Walkthrough (first-person) | `glb-walkthrough-controller.tsx` | WASD + pointer look |
| BVH-based character controller | `bvh-ecctrl.tsx` | Collision with scene geometry |
| Hero pose (presentation angle) | `lib/hero-pose.ts` | Auto-framing for thumbnails |
| Perspective / Orthographic toggle | `viewer-camera.tsx` | — |

### Materials and Themes
| Feature | File | Notes |
|---|---|---|
| Surface roles (wall/floor/ceiling/trim) | `materials.ts` | Per-face material assignment |
| Scene themes (realistic/clay/wireframe) | `scene-themes.ts` | Clay = uniform color; wireframe = edges |
| Ink edges (stylized outline) | `ink-edges.ts` | Post-process edge detection |
| Box UV projection | `box-uv.ts` | World-space UV for materials |
| Texture reference | `texture-reference.ts` + tests | Per-node texture override |
| Material library | `core/material-library.ts` | Preset PBR materials |
| KTX2 textures | — | GPU-compressed albedo/normal/roughness |

### Lighting
| Feature | File | Notes |
|---|---|---|
| Ambient + directional (sun) | `lights.tsx` | — |
| Sun study (azimuth/altitude) | `sun-study-panel.tsx` (app) | Time-of-day sun position |
| Environment (HDRI) | `scene-environment.tsx` | IBL for PBR materials |
| Item point lights | `item-light-system.tsx` | Fixtures emit real light |

### Snapshot / Export
| Feature | File | Notes |
|---|---|---|
| Thumbnail capture | `snapshot-pipeline.ts` | Offscreen render to blob |
| Offline render (high res) | `apps/editor/lib/render/offline-render.ts` | Server-side render via headless |

### GLB Scene Loading
| Feature | File | Notes |
|---|---|---|
| Interactive GLB scene | `glb-interactive.tsx` | Click-to-select on loaded GLB |
| Reference nodes in GLB | `glb-reference-nodes.tsx` | — |
| Instance replacement | `glb-replace-instances.tsx` | Swap item instances at runtime |
| Scene from GLB | `glb-scene.tsx` | Complete scene from exported GLB |

### Selection
| Feature | File | Notes |
|---|---|---|
| Viewer selection manager | `selection-manager.tsx` | Raycast + click |
| Isolation (show only selected) | `isolation.ts` | — |
| Merged outline node | `merged-outline-node.ts` + tests | Selection highlight outline |

---

## Gaps

### Rendering Features
| Gap | Priority | Notes |
|---|---|---|
| Shadow maps (real-time) | High | No self-shadowing currently; only env IBL |
| Section cut plane (live slice) | High | `section` node exists, no 3D renderer |
| Interior vs exterior camera modes | Medium | Outdoor view vs indoor walkthrough differ |
| Ambient occlusion quality | Medium | SSAO only; HBAO would improve quality |
| Reflection probes / cubemap capture | Medium | Critical for glass/mirror surfaces |
| Transparent glass shader | High | Window glass is opaque placeholder |
| Translucency (frosted glass, curtains) | Medium | — |
| Subsurface scattering | Low | Skin/stone materials |
| Level-of-detail (LOD) for items | Medium | 50+ items in scene causes perf drop |
| Texture streaming / LOD | Medium | Large textures loaded fully upfront |
| Terrain heightmap renderer | High | `terrain` node has no 3D mesh |
| Curtain wall 3D renderer | High | Schema + panel exist, no geometry |
| Gutter / downspout 3D renderer | Medium | Exterior envelope detail |
| Cabinet 3D renderer | Medium | — |
| Railing / balustrade renderer | High | No railing node type at all |
| Beam / structural framing renderer | High | No beam node type |

### Camera and Navigation
| Gap | Priority | Notes |
|---|---|---|
| Named camera views (save position) | Medium | Save/restore specific views |
| Parallel section views (elevation, section) | High | Auto-elevation from section node |
| Top-down plan view (true orthographic) | Medium | Currently approximate |
| Camera animation (flythrough) | Low | Presentation feature |
| VR mode | Low | WebXR |

### Export / Visualization
| Gap | Priority | Notes |
|---|---|---|
| High-quality offline render (GPU raytracing) | Medium | Path tracing via Three.js WebGPU |
| Render queue (multiple scenes) | Low | — |
| Video export (animation) | Low | — |
| 2D vector floor plan from 3D model | High | Auto-generate 2D plan drawing |
| Section elevation drawing | High | Auto-generate section from cut plane |
| Isometric view export | Medium | — |

### Performance
| Gap | Priority | Notes |
|---|---|---|
| Instance merging (static items) | Medium | Many duplicate chairs/tables should instance |
| Worker-thread geometry computation | Medium | Wall CSG blocks main thread on complex scenes |
| GPU-driven rendering | Low | WebGPU `indirect` draw calls |
| Scene streaming (large buildings) | Low | Load only visible levels/zones |
