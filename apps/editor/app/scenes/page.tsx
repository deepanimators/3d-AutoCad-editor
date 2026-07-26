import { CreateSceneButton } from '@/components/save-button'
import type { SceneMeta } from '@/components/scene-loader'
import { SceneCard } from '@/components/scene-card'
import { AppShell } from '@/components/app-shell'
import { getSession } from '@/lib/auth-server'
import { getSceneOperations } from '@/lib/scene-store-server'

export const dynamic = 'force-dynamic'

async function fetchScenes(): Promise<SceneMeta[]> {
  try {
    const session = await getSession()
    if (!session) return []
    const operations = await getSceneOperations()
    const scenes = await operations.listScenes({
      limit: 50,
      ownerId: session.role === 'admin' ? undefined : session.id,
    })
    return scenes as SceneMeta[]
  } catch (error) {
    console.error('[ScenesPage] Failed to fetch scenes:', error)
    return []
  }
}

export default async function ScenesPage() {
  const scenes = await fetchScenes()

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground tracking-tight">My Scenes</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {scenes.length === 0
                ? 'No scenes yet. Create one to get started.'
                : `${scenes.length} scene${scenes.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <CreateSceneButton />
        </div>

        {scenes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2 L22 7.5 L12 13 L2 7.5 Z" />
                <line x1="2" y1="13" x2="22" y2="13" />
                <path d="M2 7.5 L2 16.5 L12 22 L12 13" />
                <path d="M22 7.5 L22 16.5 L12 22" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">No scenes yet</p>
            <p className="mt-1 text-muted-foreground text-sm">Start with a blank canvas to build in 3D.</p>
            <div className="mt-6 flex justify-center">
              <CreateSceneButton />
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                id={scene.id}
                name={scene.name}
                nodeCount={scene.nodeCount}
                updatedAt={scene.updatedAt}
                thumbnailUrl={scene.thumbnailUrl}
              />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
