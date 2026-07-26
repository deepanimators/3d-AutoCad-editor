'use client'

import { useScene } from '@aruct/core'
import { Editor, ItemsPanel } from '@aruct/editor'
import { Hammer, Layers, Package, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { BuildTab } from '@/components/build-tab'
import { EditorTopBar } from '@/components/editor-top-bar'
import { FloorplanConstructionPreflight } from '@/components/floorplan-construction-preflight'
import { RailAccountNav } from '@/components/rail-account-nav'
import {
  CommunityViewerToolbarLeft,
  CommunityViewerToolbarRight,
} from '@/components/viewer-toolbar'

// The open-source editor only ships the built-in catalog (no uploaded items),
// so the Library/Community/Mine source chips and tag filters add nothing —
// drop them and keep the panel to plain categories.
function EditorItemsPanel() {
  return <ItemsPanel showSourceFilter={false} showTagFilters={false} />
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
