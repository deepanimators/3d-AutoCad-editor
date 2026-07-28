'use client'

// Node registry bootstrap is loaded once at the root via
// `<ClientBootstrap>` in `app/layout.tsx` — no per-page side-effect
// import here.
import { type AssetInput, useScene } from '@aruct/core'
import {
  applySceneGraphToEditor,
  CATALOG_ITEMS,
  Editor,
  type ExternalResult,
  ItemsPanel,
  type ProjectVisibility,
  type SaveStatus,
  type SceneGraph,
  type SidebarTab,
  useEditor,
} from '@aruct/editor'
import { BarChart2, Hammer, Layers, Package, Plus, Settings, Sun, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AiGenerateTile } from './ai-generate-tile'
import { BomPanel } from './bom-panel'
import { BuildTab } from './build-tab'
import { CollabPanel } from './collab-panel'
import { RailAccountNav } from './rail-account-nav'
import { SettingsPanel } from './settings-panel'
import { SunStudyPanel } from './sun-study-panel'
import { UnifiedPluginsPanel } from './unified-plugins-panel'
import { CommunityViewerToolbarLeft, CommunityViewerToolbarRight } from './viewer-toolbar'

export interface SceneMeta {
  id: string
  name: string
  projectId: string | null
  thumbnailUrl: string | null
  version: number
  createdAt: string
  updatedAt: string
  ownerId: string | null
  sizeBytes: number
  nodeCount: number
  isPublic?: boolean
  showScansPublic?: boolean
  showGuidesPublic?: boolean
}

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
    fetch('/api/user/plugins', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { enabled?: string[] } | null) => {
        if (data?.enabled) setEnabledPlugins(data.enabled)
      })
      .catch(() => {})
  }, [loadDbItems])

  const handleSearchChange = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setExternalResults(undefined)
      return
    }
    setExternalResults(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/external?q=${encodeURIComponent(q)}&limit=12`)
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as { results: ExternalResult[] }
        setExternalResults(data.results ?? [])
      } catch {
        setExternalResults([])
      }
    }, 400)
  }

  const allItems = dbItems.length > 0 ? [...CATALOG_ITEMS, ...dbItems] : undefined
  const aiGenEnabled = enabledPlugins.includes('aruct:plugin-ai-gen')

  return (
    <ItemsPanel
      externalResults={externalResults}
      items={allItems}
      leadingTile={aiGenEnabled ? <AiGenerateTile onGenerated={loadDbItems} /> : undefined}
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

interface SceneLoaderProps {
  initialScene: SceneGraph
  meta: SceneMeta
}

type SceneGraphWithCollections = SceneGraph & {
  collections?: Record<string, unknown>
}

interface LiveSceneEvent {
  eventId: number
  sceneId: string
  version: number
  kind: string
  createdAt: string
  graph: SceneGraphWithCollections
}

function sceneGraphSignature(graph: SceneGraphWithCollections): string {
  return JSON.stringify({
    nodes: graph.nodes,
    rootNodeIds: graph.rootNodeIds,
    collections: graph.collections,
    installedPlugins: graph.installedPlugins,
  })
}

export function SceneLoader({ initialScene, meta }: SceneLoaderProps) {
  const router = useRouter()
  const versionRef = useRef(meta.version)
  const lastRemoteGraphJsonRef = useRef<string | null>(null)
  const suppressRemoteSaveUntilRef = useRef(0)
  const [conflict, setConflict] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [sceneName, setSceneName] = useState(meta.name)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [projectVisibility, setProjectVisibility] = useState<ProjectVisibility>({
    isPrivate: !(meta.isPublic ?? false),
    showScansPublic: meta.showScansPublic ?? true,
    showGuidesPublic: meta.showGuidesPublic ?? true,
  })
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

  const sidebarTabs: (SidebarTab & { component: React.ComponentType })[] = [
    {
      id: 'site',
      label: 'Scene',
      component: () => null,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Layers className="h-5 w-5" />,
      icon: (
        <Image
          alt=""
          className="h-8 w-8 object-contain"
          height={32}
          src="/icons/scene.webp"
          width={32}
        />
      ),
    },
    {
      id: 'build',
      label: 'Build',
      component: BuildTab,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Hammer className="h-5 w-5" />,
      icon: (
        <Image
          alt=""
          className="h-8 w-8 object-contain"
          height={32}
          src="/icons/build.webp"
          width={32}
        />
      ),
    },
    {
      id: 'items',
      label: 'Items',
      component: EditorItemsPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Package className="h-5 w-5" />,
      icon: (
        <Image
          alt=""
          className="h-8 w-8 object-contain"
          height={32}
          src="/icons/couch.webp"
          width={32}
        />
      ),
    },
    ...(enabledPlugins.includes('aruct:plugin-bom') ? [{
      id: 'bom',
      label: 'BOM',
      component: BomPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <BarChart2 className="h-5 w-5" />,
      icon: <BarChart2 className="h-5 w-5" />,
    } as SidebarTab & { component: React.ComponentType }] : []),
    ...(enabledPlugins.includes('aruct:plugin-sun-study') ? [{
      id: 'sun-study',
      label: 'Sun Study',
      component: SunStudyPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Sun className="h-5 w-5" />,
      icon: <Sun className="h-5 w-5" />,
    } as SidebarTab & { component: React.ComponentType }] : []),
    ...(enabledPlugins.includes('aruct:plugin-collab') ? [{
      id: 'collab',
      label: 'Collab',
      component: CollabPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Users className="h-5 w-5" />,
      icon: <Users className="h-5 w-5" />,
    } as SidebarTab & { component: React.ComponentType }] : []),
    {
      id: 'settings',
      label: 'Settings',
      component: SettingsPanel,
      mobileDefaultSnap: 0.5,
      mobileIcon: <Settings className="h-5 w-5" />,
      icon: (
        <Image
          alt=""
          className="h-8 w-8 object-contain"
          height={32}
          src="/icons/settings.webp"
          width={32}
        />
      ),
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

  const handleLoad = useCallback(async () => initialScene, [initialScene])

  const handleSave = useCallback(
    async (graph: SceneGraph, options?: { keepalive?: boolean }) => {
      const graphJson = sceneGraphSignature(graph)
      const isRecentRemoteApply = Date.now() < suppressRemoteSaveUntilRef.current
      if (lastRemoteGraphJsonRef.current === graphJson) {
        lastRemoteGraphJsonRef.current = null
        suppressRemoteSaveUntilRef.current = 0
        return
      }
      if (isRecentRemoteApply) return

      try {
        const response = await fetch(`/api/scenes/${meta.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'If-Match': String(versionRef.current),
          },
          body: JSON.stringify({ name: sceneName, graph }),
          keepalive: options?.keepalive,
        })

        if (response.status === 409) {
          setConflict(true)
          return
        }

        if (!response.ok) {
          setSaveError(`Save failed (${response.status})`)
          return
        }

        const next = (await response.json()) as SceneMeta
        versionRef.current = next.version
        setSaveError(null)
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Save failed')
      }
    },
    [meta.id, sceneName],
  )

  const handleRenameScene = useCallback(
    async (newName: string) => {
      try {
        const response = await fetch(`/api/scenes/${meta.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        })
        if (response.ok) {
          const updated = (await response.json()) as SceneMeta
          setSceneName(updated.name)
        }
      } catch (err) {
        console.error('Failed to rename scene:', err)
      }
    },
    [meta.id],
  )

  const handleSaveAsNewCloud = useCallback(async () => {
    const defaultName = `${sceneName} (Copy)`
    const newName = typeof window !== 'undefined' ? window.prompt('Enter new scene name:', defaultName) : null
    if (!newName) return
    const currentState = useScene.getState()
    const graph: SceneGraph = {
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
        body: JSON.stringify({ name: newName, graph }),
      })
      if (response.ok) {
        const created = (await response.json()) as { id: string }
        router.push(`/scene/${created.id}`)
      }
    } catch (err) {
      console.error('Failed to save as new scene:', err)
    }
  }, [router, sceneName])

  const handleClearAndStartNewCloud = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Start a new empty scene in your account?')
    ) {
      return
    }
    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled scene', graph: { nodes: {}, rootNodeIds: [] } }),
      })
      if (response.ok) {
        const created = (await response.json()) as { id: string }
        router.push(`/scene/${created.id}`)
      }
    } catch (err) {
      console.error('Failed to start new scene:', err)
    }
  }, [router])

  const handleVisibilityChange = useCallback(
    async (field: 'isPrivate' | 'showScansPublic' | 'showGuidesPublic', value: boolean) => {
      const payload: Record<string, boolean> =
        field === 'isPrivate' ? { isPublic: !value } : { [field]: value }
      try {
        const response = await fetch(`/api/scenes/${meta.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (response.ok) {
          setProjectVisibility((prev) => ({ ...prev, [field]: value }))
        }
      } catch (err) {
        console.error('Failed to update visibility:', err)
      }
    },
    [meta.id],
  )

  useEffect(() => {
    const source = new EventSource(`/api/scenes/${meta.id}/events`)
    let everConnected = false

    source.addEventListener('scene', (event) => {
      everConnected = true
      let payload: LiveSceneEvent
      try {
        payload = JSON.parse((event as MessageEvent<string>).data) as LiveSceneEvent
      } catch {
        return
      }
      if (payload.sceneId !== meta.id) return
      if (payload.version <= versionRef.current) return

      versionRef.current = payload.version
      lastRemoteGraphJsonRef.current = sceneGraphSignature(payload.graph)
      suppressRemoteSaveUntilRef.current = Date.now() + 2500
      applySceneGraphToEditor(payload.graph)
      setConflict(false)
      setSaveError(null)
    })

    // Suppress the "connection closed" banner on first close — the Postgres
    // store doesn't support SSE events and returns 501 immediately, which is
    // expected. Only show the error if we successfully connected at least once.
    source.addEventListener('error', () => {
      if (source.readyState === EventSource.CLOSED && everConnected) {
        setSaveError('Live scene connection closed')
      }
    })

    return () => source.close()
  }, [meta.id])

  const handleThumb = useCallback(
    async (_blob: Blob) => {
      await fetch(`/api/scenes/${meta.id}/thumbnail`, {
        method: 'POST',
      }).catch(() => {})
    },
    [meta.id],
  )

  return (
    <div className="relative h-screen w-screen">
      <TabUrlSync validTabIds={sidebarTabs.map((t) => t.id)} />
      {conflict && (
        <div className="pointer-events-auto absolute top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-lg border border-border bg-background p-4 shadow-xl">
          <h2 className="font-semibold text-sm">Another session saved first — refresh?</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Your changes haven&apos;t been saved. Reload to pick up the latest version.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              className="rounded-md border border-border bg-accent px-3 py-1.5 font-medium text-xs hover:bg-accent/80"
              onClick={() => router.refresh()}
              type="button"
            >
              Reload
            </button>
            <button
              className="rounded-md border border-border bg-background px-3 py-1.5 font-medium text-xs hover:bg-accent/40"
              onClick={() => setConflict(false)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {saveError && !conflict && (
        <div className="pointer-events-auto absolute top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-lg border border-destructive/50 bg-background p-3 shadow-xl">
          <p className="font-medium text-destructive text-xs">{saveError}</p>
        </div>
      )}
      <Editor
        layoutVersion="v2"
        onLoad={handleLoad}
        onSave={handleSave}
        onSaveStatusChange={setSaveStatus}
        onThumbnailCapture={handleThumb}
        projectId={meta.projectId ?? 'default'}
        railBottomSlot={<RailAccountNav />}
        settingsPanelProps={{
          sceneId: meta.id,
          sceneName,
          saveStatus,
          projectId: meta.projectId ?? undefined,
          projectVisibility,
          onVisibilityChange: handleVisibilityChange,
          onRenameScene: handleRenameScene,
          onSaveCloud: () => {
            const currentState = useScene.getState()
            void handleSave({
              nodes: currentState.nodes,
              rootNodeIds: currentState.rootNodeIds,
              collections: currentState.collections,
              materials: currentState.materials,
              installedPlugins: currentState.installedPlugins,
            })
          },
          onSaveAsNewCloud: handleSaveAsNewCloud,
          onClearAndStartNewCloud: handleClearAndStartNewCloud,
        }}
        sidebarTabs={sidebarTabs}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={<CommunityViewerToolbarRight />}
      />
    </div>
  )
}
