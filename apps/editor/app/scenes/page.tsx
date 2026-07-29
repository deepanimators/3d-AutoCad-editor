import type { Metadata } from 'next'
import { CreateSceneButton } from '@/components/save-button'
import { SceneCard } from '@/components/scene-card'
import { AppShell } from '@/components/app-shell'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes, orgMembers, organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Scenes',
  description: 'Browse and manage your saved 3D scenes.',
}

type SceneRow = { id: string; name: string; nodeCount: number; updatedAt: string; thumbnailUrl: string | null; orgId: string | null }

async function fetchScenesWithOrg(userId: string, isAdmin: boolean): Promise<SceneRow[]> {
  try {
    const rows = isAdmin
      ? await db.select({ id: scenes.id, name: scenes.name, nodeCount: scenes.nodeCount, updatedAt: scenes.updatedAt, thumbnailUrl: scenes.thumbnailUrl, orgId: scenes.orgId }).from(scenes).orderBy(scenes.updatedAt).limit(50)
      : await db.select({ id: scenes.id, name: scenes.name, nodeCount: scenes.nodeCount, updatedAt: scenes.updatedAt, thumbnailUrl: scenes.thumbnailUrl, orgId: scenes.orgId }).from(scenes).where(eq(scenes.ownerId, userId)).orderBy(scenes.updatedAt).limit(50)
    return rows
  } catch (error) {
    console.error('[ScenesPage] Failed to fetch scenes:', error)
    return []
  }
}

async function fetchUserOrg(userId: string): Promise<{ id: string; name: string; slug: string } | null> {
  try {
    const [row] = await db
      .select({ id: organizations.id, name: organizations.name, slug: organizations.slug })
      .from(orgMembers)
      .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
      .where(eq(orgMembers.userId, userId))
      .limit(1)
    return row ?? null
  } catch { return null }
}

export default async function ScenesPage() {
  const session = await getSession()
  const userOrg = session ? await fetchUserOrg(session.id) : null
  const sceneRows = session ? await fetchScenesWithOrg(session.id, session.role === 'admin') : []
  const scenes = sceneRows

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
                canShare={!!session}
                userOrgId={userOrg?.id ?? null}
                sceneOrgId={scene.orgId}
              />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
