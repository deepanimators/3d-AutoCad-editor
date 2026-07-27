/**
 * Admin migration: rewrite direct Poly Haven CDN GLTF URLs in scene graphs
 * to go through the /api/proxy/polyhaven endpoint.
 *
 * Pre-proxy scenes stored asset.src as:
 *   https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/{slug}/{slug}.gltf
 *
 * The proxy now prefers GLB (packed, no external texture deps) over GLTF.
 * Rewriting to proxy URLs fixes texture 404s for all existing scenes.
 *
 * Also updates globalModels rows where source='polyhaven' and s3Key is a
 * direct CDN GLTF URL.
 *
 * POST /api/admin/migrate/polyhaven-urls?dry_run=true  → preview changes
 * POST /api/admin/migrate/polyhaven-urls               → apply changes
 */
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes, globalModels } from '@/lib/db/schema'
import { eq, like } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const PH_CDN_GLTF_RE =
  /https?:\/\/dl\.polyhaven\.org\/file\/ph-assets\/Models\/gltf\/\w+\/([^/]+)\/[^/]+\.gltf/gi

function extractSlug(url: string): string | null {
  const match = /\/Models\/gltf\/\w+\/([^/]+)\//.exec(url)
  return match?.[1] ?? null
}

function proxyUrl(slug: string): string {
  return `/api/proxy/polyhaven?id=${encodeURIComponent(slug)}&res=2k`
}

function rewriteGraphJson(graphJson: string): { updated: string; count: number } {
  let count = 0
  const updated = graphJson.replace(PH_CDN_GLTF_RE, (match) => {
    const slug = extractSlug(match)
    if (!slug) return match
    count++
    return proxyUrl(slug)
  })
  return { updated, count }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true'

  // ── Scenes ──────────────────────────────────────────────────────────────
  const allScenes = await db.select({ id: scenes.id, graphJson: scenes.graphJson }).from(scenes)

  type SceneResult = { id: string; urlsFixed: number }
  const sceneResults: SceneResult[] = []

  for (const scene of allScenes) {
    if (!scene.graphJson.includes('dl.polyhaven.org')) continue
    const { updated, count } = rewriteGraphJson(scene.graphJson)
    if (count > 0) {
      sceneResults.push({ id: scene.id, urlsFixed: count })
      if (!dryRun) {
        await db.update(scenes).set({ graphJson: updated }).where(eq(scenes.id, scene.id))
      }
    }
  }

  // ── globalModels ─────────────────────────────────────────────────────────
  const phModels = await db
    .select({ id: globalModels.id, s3Key: globalModels.s3Key })
    .from(globalModels)
    .where(like(globalModels.s3Key, '%dl.polyhaven.org%'))

  type ModelResult = { id: string; oldUrl: string; newUrl: string }
  const modelResults: ModelResult[] = []

  for (const m of phModels) {
    const slug = extractSlug(m.s3Key)
    if (!slug) continue
    const newUrl = proxyUrl(slug)
    modelResults.push({ id: m.id, oldUrl: m.s3Key, newUrl })
    if (!dryRun) {
      await db.update(globalModels).set({ s3Key: newUrl }).where(eq(globalModels.id, m.id))
    }
  }

  return NextResponse.json({
    dryRun,
    scenesScanned: allScenes.length,
    scenesUpdated: sceneResults.length,
    sceneUrlsFixed: sceneResults.reduce((n, r) => n + r.urlsFixed, 0),
    modelsUpdated: modelResults.length,
    scenes: sceneResults,
    models: modelResults,
  })
}
