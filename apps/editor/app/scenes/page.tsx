import Link from 'next/link'
import { CreateSceneButton } from '@/components/save-button'
import type { SceneMeta } from '@/components/scene-loader'
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default async function ScenesPage() {
  const scenes = await fetchScenes()

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground">My Scenes</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {scenes.length === 0
                ? 'No scenes yet. Create one to get started.'
                : `${scenes.length} scene${scenes.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <CreateSceneButton />
        </div>

        {scenes.length === 0 ? (
          <div className="rounded-xl border border-border/60 border-dashed bg-background p-12 text-center">
            <p className="text-muted-foreground text-sm">No scenes saved yet.</p>
            <div className="mt-4 flex justify-center">
              <CreateSceneButton />
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => (
              <li key={scene.id}>
                <Link
                  className="group block rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-border hover:bg-accent/30"
                  href={`/scene/${scene.id}`}
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-accent/30">
                    {scene.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={scene.name}
                        className="h-full w-full object-cover"
                        src={scene.thumbnailUrl}
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">No thumbnail</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h2 className="truncate font-semibold text-sm group-hover:text-foreground">
                      {scene.name}
                    </h2>
                    <div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
                      <span>{scene.nodeCount} nodes</span>
                      <time dateTime={scene.updatedAt}>{formatDate(scene.updatedAt)}</time>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
