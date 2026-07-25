'use client'

// Node registry bootstrap is loaded once at the root via
// `<ClientBootstrap>` in `app/layout.tsx` — no per-page side-effect
// import here.
import { useScene } from '@aruct/core'
import {
  applySceneGraphToEditor,
  Editor,
  ItemsPanel,
  type ProjectVisibility,
  type SaveStatus,
  type SceneGraph,
  type SidebarTab,
} from '@aruct/editor'
import { Hammer, Layers, Package, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BuildTab } from './build-tab'
import { RailAccountNav } from './rail-account-nav'
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

function EditorItemsPanel() {
  return <ItemsPanel showSourceFilter={false} showTagFilters={false} />
}

const SIDEBAR_TABS: (SidebarTab & { component: React.ComponentType })[] = [
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
  {
    id: 'settings',
    label: 'Settings',
    component: () => null,
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
]

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
      <div className="pointer-events-none absolute top-4 right-4 z-40 flex items-center gap-2">
        <Link
          className="pointer-events-auto rounded-md border border-border bg-background/90 px-3 py-1.5 font-medium text-xs shadow-sm backdrop-blur hover:bg-accent/40"
          href="/scenes"
        >
          All scenes
        </Link>
      </div>
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
        sidebarTabs={SIDEBAR_TABS}
        viewerToolbarLeft={<CommunityViewerToolbarLeft />}
        viewerToolbarRight={<CommunityViewerToolbarRight />}
      />
    </div>
  )
}
