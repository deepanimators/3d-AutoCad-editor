'use client'

import { type AssetInput, useScene } from '@aruct/core'
import { CATALOG_ITEMS, Editor, type ExternalResult, ItemsPanel } from '@aruct/editor'
import { Hammer, Layers, Package, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AiGenerateTile } from '@/components/ai-generate-tile'
import { BuildTab } from '@/components/build-tab'
import { UnifiedPluginsPanel } from '@/components/unified-plugins-panel'
import { EditorTopBar } from '@/components/editor-top-bar'
import { FloorplanConstructionPreflight } from '@/components/floorplan-construction-preflight'
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
  const [dbItems, setDbItems] = useState<AssetInput[]>([])
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    fetch('/api/user/plugins')
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

  const handleSearchChange = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setExternalResults(undefined)
      setExternalUnconfigured([])
      setExternalDisabled([])
      return
    }
    setExternalResults(null) // loading
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/external?q=${encodeURIComponent(q)}&limit=12`)
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as { results: ExternalResult[]; unconfigured?: string[]; disabled?: string[] }
        setExternalResults(data.results ?? [])
        setExternalUnconfigured(data.unconfigured ?? [])
        setExternalDisabled(data.disabled ?? [])
      } catch {
        setExternalResults([])
        setExternalUnconfigured([])
        setExternalDisabled([])
      }
    }, 400)
  }

  const allItems = dbItems.length > 0 ? [...CATALOG_ITEMS, ...dbItems] : undefined
  const aiGenEnabled = enabledPlugins.includes('aruct:plugin-ai-gen')

  return (
    <ItemsPanel
      externalDisabled={externalDisabled}
      externalResults={externalResults}
      externalUnconfigured={externalUnconfigured}
      items={allItems}
      leadingTile={aiGenEnabled ? <AiGenerateTile onGenerated={loadDbItems} /> : undefined}
      onExternalSelect={handleExternalSelect}
      onSearchChange={handleSearchChange}
      showSourceFilter={dbItems.length > 0}
      showTagFilters={false}
    />
  )
}

const SIDEBAR_TABS = [
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
  {
    id: 'settings',
    label: 'Settings',
    component: () => null,
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

const PROJECT_ID = 'local-editor'

export default function Home() {
  const router = useRouter()

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
        }}
        sidebarTabs={SIDEBAR_TABS}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={<CommunityViewerToolbarRight />}
      />
    </div>
  )
}
