export type PluginPlan = 'free' | 'pro' | 'team'
export type PluginStatus = 'stable' | 'beta' | 'coming_soon'
export type PluginCategory = 'core' | 'catalog' | 'ai' | 'export' | 'analysis' | 'collaboration' | 'modeling' | 'materials' | 'documentation' | 'interop' | 'rendering'

export type PluginEntry = {
  id: string
  name: string
  description: string
  longDescription: string
  category: PluginCategory
  requiredPlan: PluginPlan
  status: PluginStatus
  icon: string
  features: string[]
  builtIn: boolean
}

export const PLUGIN_CATALOG: PluginEntry[] = [
  {
    id: 'aruct:core',
    name: 'Core Building Elements',
    description: 'Walls, doors, windows, slabs, roofs, stairs, and more.',
    longDescription:
      'The foundational building element library. Includes all structural and architectural primitives — walls, doors, windows, slabs, roofs, stairs, fences, measurements, and more. Cannot be disabled.',
    category: 'core',
    requiredPlan: 'free',
    status: 'stable',
    icon: '🏗️',
    features: [
      'Walls with automatic mitering',
      'Doors and windows with wall cutouts',
      'Slabs, roofs, and staircases',
      'Fences and barriers',
      'Dimension measurements',
    ],
    builtIn: true,
  },
  {
    id: 'aruct:plugin-polyhaven',
    name: 'Poly Haven Models',
    description: 'Free CC0 3D model library with 200+ photorealistic assets.',
    longDescription:
      'Integrates the Poly Haven CC0 3D model library into the catalog panel. Search and place photorealistic furniture, props, plants, vehicles, and architectural elements directly in your scene. All models are free for commercial use.',
    category: 'catalog',
    requiredPlan: 'free',
    status: 'stable',
    icon: '📦',
    features: [
      '200+ photorealistic CC0 models',
      'Furniture, props, plants, vehicles',
      'Automatic texture loading',
      'Search by name or category',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-polypizza',
    name: 'Poly Pizza Models',
    description: 'Low-poly CC0 model library — great for fast scene blocking.',
    longDescription:
      'Access the Poly Pizza library of curated low-poly CC0 3D models. Ideal for quick scene composition and blocking. Requires a free Poly Pizza API key configured in your environment.',
    category: 'catalog',
    requiredPlan: 'free',
    status: 'stable',
    icon: '🍕',
    features: [
      'Thousands of low-poly models',
      'Fast loading for scene blocking',
      'CC0 commercial license',
      'Category and keyword search',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-ai-gen',
    name: 'AI Model Generator',
    description: 'Generate custom 3D models from text prompts using Tripo3D.',
    longDescription:
      'Use AI to generate custom 3D models directly inside the editor. Describe any object in plain text and receive a production-ready 3D model in seconds, powered by Tripo3D. Generated models are saved to your catalog for reuse.',
    category: 'ai',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '✨',
    features: [
      'Text-to-3D model generation',
      'Powered by Tripo3D API',
      'Auto-saved to personal catalog',
      'Up to 50 generations/month on Pro',
      'Up to 200 generations/month on Team',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-sun-study',
    name: 'Sun & Shadow Study',
    description: 'Visualize solar path and shadow casting at any location/time.',
    longDescription:
      'Overlay accurate sun position and shadow simulation based on geographic coordinates and time of day. Essential for passive solar design, daylighting analysis, and building orientation decisions.',
    category: 'analysis',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '☀️',
    features: [
      'Real solar path simulation',
      'Shadow casting by time of day/year',
      'Geographic location support',
      'Export shadow study screenshots',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-bom',
    name: 'Bill of Materials',
    description: 'Extract quantities and generate material take-offs from your scene.',
    longDescription:
      'Automatically count and quantify all building elements in your scene. Export a Bill of Materials (BOM) as CSV or PDF for use in cost estimation, procurement, and construction documentation.',
    category: 'export',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '📋',
    features: [
      'Auto-count walls, doors, windows',
      'Material area calculations',
      'CSV and PDF export',
      'Custom item annotations',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-ifc',
    name: 'IFC / BIM Export',
    description: 'Export scenes to IFC format for BIM workflows and handoff.',
    longDescription:
      'Export your Aruct scene to Industry Foundation Classes (IFC) format, enabling handoff to BIM tools like Revit, ArchiCAD, and BIMx. Preserves element types, materials, and geometry with full BIM metadata.',
    category: 'export',
    requiredPlan: 'team',
    status: 'stable',
    icon: '🏛️',
    features: [
      'IFC 2x3 and IFC 4 export',
      'Preserves element types and materials',
      'Compatible with Revit, ArchiCAD, BIMx',
      'BIM metadata mapping',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-glb-export',
    name: 'GLB / glTF Export',
    description: 'Export your scene as a GLB file for Blender, AR/VR, and game engines.',
    longDescription:
      'Download your Aruct scene as a GLB (glTF 2.0 binary) file. Open it directly in Blender, import into game engines (Unity, Unreal, Godot), publish to web 3D viewers, or use in AR/VR pipelines. Export runs entirely in the browser — no upload required.',
    category: 'export',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '📤',
    features: [
      'One-click GLB download',
      'Full scene geometry and hierarchy',
      'PBR materials and vertex colors',
      'Compatible with Blender, Unity, Unreal, Godot',
      'Runs entirely in the browser',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-texture-manager',
    name: 'Texture & Material Manager',
    description: 'Upload textures, edit PBR materials, and build a reusable material library.',
    longDescription:
      'Upload your own texture maps (albedo, normal, roughness, metalness, AO) and apply them to any surface. Save reusable materials to your scene library and apply them across nodes. Essential for photorealistic renders and accurate material takeoffs.',
    category: 'materials',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '🎨',
    features: [
      'Upload PNG/JPG/WebP texture maps',
      'Albedo map with UV repeat/offset',
      'Reusable scene material library',
      'Apply materials to any surface slot',
      'Stored in cloud storage (R2/S3)',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-sections',
    name: 'Sections & Elevations',
    description: 'Create section planes and view orthographic cuts through your building.',
    longDescription:
      'Add named section planes anywhere in your scene. Switch to an orthographic camera aligned to any section for precise elevation views. Essential for construction documentation and spatial analysis.',
    category: 'documentation',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '✂️',
    features: [
      'Named section planes',
      'Front/Back/Left/Right orientation presets',
      'One-click orthographic section view',
      'Adjustable cut height',
      'Multiple sections per scene',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-mesh-editor',
    name: 'Mesh Editor',
    description: 'Add editable 3D mesh primitives to your scene.',
    longDescription:
      'Place box, sphere, and cylinder mesh primitives directly in your scene. Mesh nodes are fully serialised in the scene graph and export via GLB. Full vertex/edge/face editing with extrude, bevel, and loop cut tools is planned for v2.',
    category: 'modeling',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '✏️',
    features: [
      'Box, sphere, cylinder primitives',
      'Custom geometry support',
      'Full vertex/edge/face editing in v2',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-terrain',
    name: 'Terrain',
    description: 'Grid-based terrain surfaces with elevation control and contour lines.',
    longDescription:
      'Add terrain surfaces to your scene with a configurable height map grid. Import elevation data from CSV, paint heights (v2), and visualise contour lines at adjustable intervals. Ideal for site context, landscaping, and topographic studies.',
    category: 'modeling',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '🏔️',
    features: [
      'Configurable grid resolution (up to 256×256)',
      'Physical size control in metres',
      'CSV elevation data import',
      'Contour line overlay with adjustable interval',
      '2D floor-plan footprint in the plan view',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-schedules',
    name: 'Schedules & Takeoffs',
    description: 'Auto-generate door, window, room, and item schedules from your scene.',
    longDescription:
      'Automatically build door, window, room finish, and item schedules from your scene data. Each schedule mirrors standard AIA format with one row per element, sorted by mark or room number. Export any schedule to CSV for use in construction documents.',
    category: 'documentation',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '📊',
    features: [
      'Door and window schedules',
      'Room area schedule from zones',
      'Item / furniture schedule',
      'CSV export',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-dwg',
    name: 'DWG / DXF Interop',
    description: 'Import DXF files and export scenes to DXF format.',
    longDescription:
      'Import AutoCAD DXF files directly into your scene — lines become walls, closed polylines become slabs. Export any scene back to DXF R12 format for use in CAD tools. DWG binary import (requiring server-side conversion) is planned for a future release.',
    category: 'interop',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '📐',
    features: [
      'DXF import (lines, polylines, walls)',
      'DXF R12 export',
      'Wall and slab geometry round-trip',
      'DWG binary import (coming soon)',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-render',
    name: 'High-Quality Render',
    description: 'Export high-resolution renders of your scene as PNG images.',
    longDescription:
      'Capture the current 3D view as a high-resolution PNG using the live WebGPU renderer. Choose from 1K, 2K, or 4K output at draft, standard, or high quality. The render runs entirely in your browser — no upload or server required.',
    category: 'rendering',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '🎬',
    features: [
      '1K / 2K / 4K resolution export',
      'PNG download',
      'Current view capture',
      'WebGPU accelerated',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-curtain-wall',
    name: 'Curtain Wall',
    description: 'Glazed curtain wall systems with configurable mullion and transom grids.',
    longDescription:
      'Place parametric curtain wall segments anywhere in your scene. Configure the mullion and transom grid spacing, frame profile dimensions, and panel type (glazing, spandrel, or opaque). Supports per-wall frame color and glazing opacity for accurate facade design.',
    category: 'modeling',
    requiredPlan: 'pro',
    status: 'stable',
    icon: '🏢',
    features: [
      'Mullion and transom grid with configurable spacing',
      'Glazing, spandrel, and opaque panel types',
      'Frame color and glass opacity controls',
      'Parametric frame width and depth',
      'Multiple curtain walls per scene',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-point-cloud',
    name: 'Point Cloud Import',
    description: 'Import LiDAR and photogrammetry point clouds (.laz, .e57) into your scene.',
    longDescription:
      'Upload raw point cloud files from LiDAR scanners or photogrammetry pipelines and anchor them in your scene. Supports .laz, .las, and .e57 formats. The bounding box stub is shown immediately while full rendering support is in development.',
    category: 'interop',
    requiredPlan: 'team',
    status: 'stable',
    icon: '☁️',
    features: [
      'Import .laz, .las, .e57 files (up to 500 MB)',
      'Bounding box preview in 3D viewport',
      'Elevation, intensity, and RGB color modes',
      'Point size and opacity controls',
      'Stored in cloud storage (R2/S3)',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-energy',
    name: 'Energy & Daylight Analysis',
    description: 'Estimate building energy use and glazing ratios from your scene.',
    longDescription:
      'Compute a zone-level Energy Use Intensity (EUI) proxy directly from your scene geometry. Measure glazing ratios and compare against ASHRAE 90.1 baselines. Full EnergyPlus integration is planned for Team plan v2.',
    category: 'analysis',
    requiredPlan: 'team',
    status: 'stable',
    icon: '⚡',
    features: [
      'Zone-level EUI estimate',
      'Glazing ratio analysis',
      'EnergyPlus integration (v2)',
      'ASHRAE 90.1 benchmark',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-collab',
    name: 'Real-Time Collaboration',
    description: 'Invite teammates for simultaneous editing with live cursors.',
    longDescription:
      'Work on the same scene with multiple team members at the same time. See live cursors, selections, and edits from collaborators in real-time. Powered by operational transforms with automatic conflict resolution.',
    category: 'collaboration',
    requiredPlan: 'team',
    status: 'stable',
    icon: '👥',
    features: [
      'Simultaneous multi-user editing',
      'Live cursor and selection sharing',
      'Automatic conflict resolution',
      'User presence indicators',
      'Edit history per collaborator',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-version-history',
    name: 'Version History',
    description: 'Browse and restore previous versions of your scene.',
    longDescription:
      'Every cloud save is recorded as a versioned snapshot. Browse the full save history, see what changed at each version, and restore any previous state with one click.',
    category: 'documentation',
    requiredPlan: 'free',
    status: 'stable',
    icon: '🕐',
    features: [
      'Full save history per scene',
      'Restore any previous version',
      'Timestamp and version number',
      'Up to 50 recent versions shown',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-zone-rollup',
    name: 'Zone Area Rollup',
    description: 'Summarize floor areas, perimeters, and finishes across all zones.',
    longDescription:
      'Instantly see total floor area, individual room areas, perimeters, and ceiling heights for every zone in your scene. Export the full schedule as a CSV for use in cost estimates and permit applications.',
    category: 'analysis',
    requiredPlan: 'free',
    status: 'stable',
    icon: '📐',
    features: [
      'Total and per-room floor areas',
      'Perimeter and ceiling height per zone',
      'Floor, wall, and ceiling finish schedule',
      'Export as CSV',
    ],
    builtIn: false,
  },
  {
    id: 'aruct:plugin-measurement-export',
    name: 'Measurement Export',
    description: 'Export all scene measurements to CSV for use in spreadsheets and reports.',
    longDescription:
      'Download every distance, angle, area, perimeter, and volume measurement in your scene as a CSV file. Useful for cross-checking quantities and feeding into external cost or documentation workflows.',
    category: 'interop',
    requiredPlan: 'free',
    status: 'stable',
    icon: '📏',
    features: [
      'Export all measurement types to CSV',
      'Includes distance, angle, area, perimeter, volume',
      'Computed values in SI units',
    ],
    builtIn: false,
  },
]

export function getPlugin(id: string): PluginEntry | undefined {
  return PLUGIN_CATALOG.find((p) => p.id === id)
}

export function getEnabledPlugins(pluginPrefsJson: string): string[] {
  try {
    const parsed = JSON.parse(pluginPrefsJson)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export const PLAN_RANK: Record<PluginPlan, number> = { free: 0, pro: 1, team: 2 }

export function canUsePlugin(plugin: PluginEntry, userPlan: PluginPlan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[plugin.requiredPlan]
}
