'use client'

import { type AssetInput, useScene } from '@aruct/core'
import { CATALOG_ITEMS, Editor, type ExternalResult, ItemsPanel, useEditor } from '@aruct/editor'
import { BarChart2, Building2, Camera, ClipboardList, Clock, CloudSnow, Hammer, LayoutGrid, Layers, Mountain, Package, Palette, PenTool, Plus, Scissors, Settings, Sun, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AiGenerateTile } from '@/components/ai-generate-tile'
import { BomPanel } from '@/components/bom-panel'
import { CollabPanel } from '@/components/collab-panel'
import { SunStudyPanel } from '@/components/sun-study-panel'
import { BuildTab } from '@/components/build-tab'
import { TextureManagerPanel } from '@/components/texture-manager-panel'
import { SectionsPanel } from '@/components/sections-panel'
import { MeshEditorPanel } from '@/components/mesh-editor-panel'
import { TerrainPanel } from '@/components/terrain-panel'
import { SchedulesPanel } from '@/components/schedules-panel'
import { RenderPanel } from '@/components/render-panel'
import { CurtainWallPanel } from '@/components/curtain-wall-panel'
import { PointCloudPanel } from '@/components/point-cloud-panel'
import { EnergyPanel } from '@/components/energy-panel'
import { VersionHistoryPanel } from '@/components/version-history-panel'
import { ZoneRollupPanel } from '@/components/zone-rollup-panel'
import { UnifiedPluginsPanel } from '@/components/unified-plugins-panel'
import { EditorTopBar } from '@/components/editor-top-bar'
import { FloorplanConstructionPreflight } from '@/components/floorplan-construction-preflight'
import { GlbExportGate } from '@/components/glb-export-gate'
import { RailAccountNav } from '@/components/rail-account-nav'
import {
  CommunityViewerToolbarLeft,
  CommunityViewerToolbarRight,
} from '@/components/viewer-toolbar'

type CatalogApiModel = {
  id: string
  name: string
  category: string | null
  glbUrl: string
  thumbnailUrl: string | null
  source: string | null
  tags: string[]
}

function mapDbModelToAsset(m: CatalogApiModel): AssetInput {
  const source =
    m.source === 'mine' || m.source === 'tripo3d'
      ? ('mine' as const)
      : m.source === 'polyhaven' || m.source === 'polypizza' || m.source === 'community'
        ? ('community' as const)
        : ('library' as const)
  return {
    id: m.id,
    name: m.name,
    category: m.category ?? 'furniture',
    thumbnail: m.thumbnailUrl ?? '',
    src: m.glbUrl as AssetInput['src'],
    dimensions: [1, 1, 1],
    offset: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    tags: m.tags,
    source,
  }
}

function EditorItemsPanel() {
  const [externalResults, setExternalResults] = useState<ExternalResult[] | null | undefined>(
    undefined,
  )
  const [externalUnconfigured, setExternalUnconfigured] = useState<string[]>([])
  const [externalDisabled, setExternalDisabled] = useState<string[]>([])
  const [externalHasMore, setExternalHasMore] = useState(false)
  const [externalPage, setExternalPage] = useState(0)
  const [dbItems, setDbItems] = useState<AssetInput[]>([])
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentQueryRef = useRef('')

  const loadDbItems = useCallback(() => {
    fetch('/api/catalog?limit=48')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: { models: CatalogApiModel[] }) => {
        setDbItems(data.models.map(mapDbModelToAsset))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadDbItems()
    fetch('/api/user/plugins', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { enabled?: string[] } | null) => {
        if (data?.enabled) setEnabledPlugins(data.enabled)
      })
      .catch(() => {})
  }, [loadDbItems])

  const handleExternalSelect = (result: ExternalResult) => {
    void fetch('/api/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: result.source,
        sourceId: result.sourceId,
        name: result.name,
        description: result.description ?? undefined,
        glbUrl: result.glbUrl,
        thumbnailUrl: result.thumbnailUrl ?? undefined,
        license: result.license,
        attribution: result.attribution ?? undefined,
        tags: result.tags ?? [],
        category: result.category ?? undefined,
      }),
    }).then((r) => { if (r.ok) loadDbItems() }).catch(() => {})
  }

  const fetchExternal = async (q: string, page: number, append: boolean) => {
    try {
      const res = await fetch(`/api/catalog/external?q=${encodeURIComponent(q)}&limit=12&page=${page}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = (await res.json()) as {
        results: ExternalResult[]
        unconfigured?: string[]
        disabled?: string[]
        hasMore?: boolean
      }
      setExternalResults((prev) =>
        append && Array.isArray(prev) ? [...prev, ...(data.results ?? [])] : (data.results ?? [])
      )
      setExternalUnconfigured(data.unconfigured ?? [])
      setExternalDisabled(data.disabled ?? [])
      setExternalHasMore(data.hasMore ?? false)
    } catch {
      if (!append) {
        setExternalResults([])
        setExternalUnconfigured([])
        setExternalDisabled([])
      }
      setExternalHasMore(false)
    }
  }

  const handleSearchChange = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    currentQueryRef.current = q
    setExternalPage(0)
    if (!q.trim()) {
      setExternalResults(undefined)
      setExternalUnconfigured([])
      setExternalDisabled([])
      setExternalHasMore(false)
      return
    }
    setExternalResults(null)
    debounceRef.current = setTimeout(() => {
      void fetchExternal(q, 0, false)
    }, 400)
  }

  const handleLoadMore = () => {
    const nextPage = externalPage + 1
    setExternalPage(nextPage)
    void fetchExternal(currentQueryRef.current, nextPage, true)
  }

  const allItems = dbItems.length > 0 ? [...CATALOG_ITEMS, ...dbItems] : undefined
  const aiGenEnabled = enabledPlugins.includes('aruct:plugin-ai-gen')

  return (
    <ItemsPanel
      externalDisabled={externalDisabled}
      externalResults={externalResults}
      externalUnconfigured={externalUnconfigured}
      hasMore={externalHasMore}
      items={allItems}
      leadingTile={aiGenEnabled ? <AiGenerateTile onGenerated={loadDbItems} /> : undefined}
      onExternalSelect={handleExternalSelect}
      onLoadMore={handleLoadMore}
      onSearchChange={handleSearchChange}
      showSourceFilter={dbItems.length > 0}
      showTagFilters={false}
    />
  )
}

function TabUrlSync({ validTabIds }: { validTabIds: string[] }) {
  const router = useRouter()
  const activePanel = useEditor((s) => s.activeSidebarPanel)
  const setActivePanel = useEditor((s) => s.setActiveSidebarPanel)
  const mounted = useRef(false)

  // On mount: apply tab from URL
  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && validTabIds.includes(tab)) setActivePanel(tab)
  }, [setActivePanel, validTabIds])

  // Sync active panel to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === activePanel) return
    params.set('tab', activePanel)
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }, [activePanel, router])

  return null
}

const PROJECT_ID = 'local-editor'

export default function Home() {
  const router = useRouter()
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/user/plugins', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { enabled?: string[] } | null) => {
        if (data?.enabled) setEnabledPlugins(data.enabled)
      })
      .catch(() => {})

    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: string[] }>).detail
      if (detail?.enabled) setEnabledPlugins(detail.enabled)
    }
    window.addEventListener('aruct:plugins-changed', onChanged)
    return () => window.removeEventListener('aruct:plugins-changed', onChanged)
  }, [])

  const sidebarTabs = [
    {
      id: 'site',
      label: 'Scene',
      component: () => null,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Layers className="h-5 w-5" />,
      icon: <Layers className="h-5 w-5" />,
    },
    {
      id: 'build',
      label: 'Build',
      component: BuildTab,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Hammer className="h-5 w-5" />,
      icon: <Hammer className="h-5 w-5" />,
    },
    {
      id: 'items',
      label: 'Items',
      component: EditorItemsPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Package className="h-5 w-5" />,
      icon: <Package className="h-5 w-5" />,
    },
    ...(enabledPlugins.includes('aruct:plugin-bom') ? [{
      id: 'bom',
      label: 'BOM',
      component: BomPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <BarChart2 className="h-5 w-5" />,
      icon: <BarChart2 className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-sun-study') ? [{
      id: 'sun-study',
      label: 'Sun Study',
      component: SunStudyPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Sun className="h-5 w-5" />,
      icon: <Sun className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-collab') ? [{
      id: 'collab',
      label: 'Collab',
      component: CollabPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Users className="h-5 w-5" />,
      icon: <Users className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-texture-manager') ? [{
      id: 'textures',
      label: 'Textures',
      component: TextureManagerPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Palette className="h-5 w-5" />,
      icon: <Palette className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-sections') ? [{
      id: 'sections',
      label: 'Sections',
      component: SectionsPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Scissors className="h-5 w-5" />,
      icon: <Scissors className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-mesh-editor') ? [{
      id: 'mesh-editor',
      label: 'Mesh',
      component: MeshEditorPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <PenTool className="h-5 w-5" />,
      icon: <PenTool className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-terrain') ? [{
      id: 'terrain',
      label: 'Terrain',
      component: TerrainPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Mountain className="h-5 w-5" />,
      icon: <Mountain className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-schedules') ? [{
      id: 'schedules',
      label: 'Schedules',
      component: SchedulesPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <ClipboardList className="h-5 w-5" />,
      icon: <ClipboardList className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-render') ? [{
      id: 'render',
      label: 'Render',
      component: RenderPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Camera className="h-5 w-5" />,
      icon: <Camera className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-curtain-wall') ? [{
      id: 'curtain-wall',
      label: 'Curtain Wall',
      component: CurtainWallPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Building2 className="h-5 w-5" />,
      icon: <Building2 className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-point-cloud') ? [{
      id: 'point-cloud',
      label: 'Point Cloud',
      component: PointCloudPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <CloudSnow className="h-5 w-5" />,
      icon: <CloudSnow className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-energy') ? [{
      id: 'energy',
      label: 'Energy',
      component: EnergyPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Zap className="h-5 w-5" />,
      icon: <Zap className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-version-history') ? [{
      id: 'version-history',
      label: 'History',
      component: VersionHistoryPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Clock className="h-5 w-5" />,
      icon: <Clock className="h-5 w-5" />,
    }] : []),
    ...(enabledPlugins.includes('aruct:plugin-zone-rollup') ? [{
      id: 'zone-rollup',
      label: 'Zones',
      component: ZoneRollupPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <LayoutGrid className="h-5 w-5" />,
      icon: <LayoutGrid className="h-5 w-5" />,
    }] : []),
    {
      id: 'settings',
      label: 'Settings',
      component: () => null, // Editor renders its own SettingsPanel via settingsPanelProps
      mobileDefaultSnap: 0.5,
      mobileIcon: <Settings className="h-5 w-5" />,
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: 'plugins',
      label: 'Plugins',
      component: UnifiedPluginsPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Plus className="h-5 w-5" />,
      icon: <Plus className="h-5 w-5" />,
    },
  ]

  const handleSaveAsNewCloud = useCallback(async () => {
    const name =
      typeof window !== 'undefined'
        ? window.prompt('Enter scene name to save to account:', 'My Scene')
        : null
    if (!name) return
    const currentState = useScene.getState()
    const graph = {
      nodes: currentState.nodes,
      rootNodeIds: currentState.rootNodeIds,
      collections: currentState.collections,
      materials: currentState.materials,
      installedPlugins: currentState.installedPlugins,
    }
    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, graph }),
      })
      if (response.status === 401) {
        router.push('/login?next=/scenes')
        return
      }
      if (response.ok) {
        const created = (await response.json()) as { id: string }
        router.push(`/scene/${created.id}`)
      }
    } catch (err) {
      console.error('Failed to create scene:', err)
    }
  }, [router])

  return (
    <div className="relative h-screen w-screen">
      <FloorplanConstructionPreflight />
      <GlbExportGate />
      <TabUrlSync validTabIds={sidebarTabs.map((t) => t.id)} />
      {PROJECT_ID === 'local-editor' && (
        <div className="pointer-events-none absolute top-3 left-1/2 z-40 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/60 bg-background/90 px-4 py-1.5 text-xs shadow-sm backdrop-blur">
            <span className="text-muted-foreground">Local editor — scenes are not saved.</span>
            <Link className="font-medium text-foreground hover:underline" href="/scenes">
              Open recent scenes
            </Link>
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <Link className="font-medium text-foreground hover:underline" href="/scenes">
              Create new
            </Link>
          </div>
        </div>
      )}
      <Editor
        layoutVersion="v2"
        navbarSlot={<EditorTopBar />}
        projectId={PROJECT_ID}
        railBottomSlot={<RailAccountNav />}
        settingsPanelProps={{
          sceneName: 'Local Workspace',
          onSaveAsNewCloud: handleSaveAsNewCloud,
          onDxfImport: enabledPlugins.includes('aruct:plugin-dwg') ? async (file: File) => {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/import/dxf', { method: 'POST', body: fd })
            if (!res.ok) {
              const body = (await res.json().catch(() => ({}))) as { error?: string }
              throw new Error(body.error ?? `Server error ${res.status}`)
            }
            const data = (await res.json()) as {
              nodes: Array<{ type: string }>
              stats: { lines: number; polylines: number; skipped: number; inserts: number }
            }
            const { createNode } = useScene.getState()
            let nodesAdded = 0
            for (const node of data.nodes) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              createNode(node as any)
              nodesAdded++
            }
            return { nodesAdded, stats: data.stats }
          } : undefined,
        }}
        sidebarTabs={sidebarTabs}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={<CommunityViewerToolbarRight />}
      />
    </div>
  )
}
