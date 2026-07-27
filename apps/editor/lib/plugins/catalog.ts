export type PluginPlan = 'free' | 'pro' | 'team'
export type PluginStatus = 'stable' | 'beta' | 'coming_soon'
export type PluginCategory = 'core' | 'catalog' | 'ai' | 'export' | 'analysis' | 'collaboration'

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
    status: 'beta',
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
    status: 'coming_soon',
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
    status: 'coming_soon',
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
    status: 'coming_soon',
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
    id: 'aruct:plugin-collab',
    name: 'Real-Time Collaboration',
    description: 'Invite teammates for simultaneous editing with live cursors.',
    longDescription:
      'Work on the same scene with multiple team members at the same time. See live cursors, selections, and edits from collaborators in real-time. Powered by operational transforms with automatic conflict resolution.',
    category: 'collaboration',
    requiredPlan: 'team',
    status: 'coming_soon',
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
