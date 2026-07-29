import type { Metadata } from 'next'
import type { SceneGraph } from '@aruct/editor'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { SceneLoader, type SceneMeta } from '@/components/scene-loader'
import { getSceneOperations } from '@/lib/scene-store-server'
import { getSession } from '@/lib/auth-server'
import { verifyShareToken } from '@/lib/share-token'
import { getSceneRole } from '@/lib/permissions'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [row] = await db.select({ name: scenes.name }).from(scenes).where(eq(scenes.id, id))
  return { title: row?.name ?? 'Scene' }
}

interface SceneWithGraph extends SceneMeta {
  graph: SceneGraph
}

async function fetchScene(id: string): Promise<SceneWithGraph | null> {
  try {
    const operations = await getSceneOperations()
    const scene = await operations.loadStoredScene(id)
    return scene as SceneWithGraph | null
  } catch (error) {
    console.error(`[ScenePage] Failed to load scene ${id}:`, error)
    return null
  }
}

export default async function ScenePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const { shareToken } = await searchParams

  // Check access before loading the full scene graph
  const [sceneRow] = await db
    .select({ ownerId: scenes.ownerId, isPublic: scenes.isPublic })
    .from(scenes)
    .where(eq(scenes.id, id))

  if (!sceneRow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 text-center shadow-xl">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-wide">404</p>
          <h1 className="mt-2 font-semibold text-lg">Scene not found</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            We couldn&apos;t find a scene with id <code className="font-mono">{id}</code>.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              className="rounded-md border border-border bg-accent px-3 py-2 font-medium text-sm hover:bg-accent/80"
              href="/scenes"
            >
              Browse scenes
            </Link>
            <Link
              className="rounded-md border border-border bg-background px-3 py-2 font-medium text-sm hover:bg-accent/40"
              href="/"
            >
              Back to editor
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const session = await getSession()

  let hasAccess = false
  if (sceneRow.isPublic) {
    hasAccess = true
  } else if (session) {
    if (session.role === 'admin' || sceneRow.ownerId === session.id) {
      hasAccess = true
    } else {
      const collaboratorRole = await getSceneRole(session.id, id)
      if (collaboratorRole !== null) hasAccess = true
    }
  }
  if (!hasAccess && shareToken) {
    hasAccess = verifyShareToken(shareToken, id)
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 text-center shadow-xl">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-wide">403</p>
          <h1 className="mt-2 font-semibold text-lg">This scene is private</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            You need permission or a valid share link to view this scene.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              className="rounded-md border border-border bg-accent px-3 py-2 font-medium text-sm hover:bg-accent/80"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-md border border-border bg-background px-3 py-2 font-medium text-sm hover:bg-accent/40"
              href="/"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const scene = await fetchScene(id)

  if (!scene) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 text-center shadow-xl">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-wide">404</p>
          <h1 className="mt-2 font-semibold text-lg">Scene not found</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            We couldn&apos;t find a scene with id <code className="font-mono">{id}</code>.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              className="rounded-md border border-border bg-accent px-3 py-2 font-medium text-sm hover:bg-accent/80"
              href="/scenes"
            >
              Browse scenes
            </Link>
            <Link
              className="rounded-md border border-border bg-background px-3 py-2 font-medium text-sm hover:bg-accent/40"
              href="/"
            >
              Back to editor
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { graph, ...meta } = scene
  return <SceneLoader initialScene={graph} meta={meta} />
}
