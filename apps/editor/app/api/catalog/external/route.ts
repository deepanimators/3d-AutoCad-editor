import { type NextRequest, NextResponse } from 'next/server'
import {
  listPolyHavenModels,
  getPolyHavenFiles,
  getBestGltfUrl,
} from '@/lib/free-sources/poly-haven'
import { searchPolyPizza, getBestGlbUrl } from '@/lib/free-sources/poly-pizza'
import type { PolyPizzaModel } from '@/lib/free-sources/poly-pizza'
import { getSession } from '@/lib/auth-server'
import { PLUGIN_CATALOG, getEnabledPlugins } from '@/lib/plugins/catalog'

export const dynamic = 'force-dynamic'

type ExternalModel = {
  sourceId: string
  source: 'polyhaven' | 'polypizza'
  name: string
  description: string | null
  glbUrl: string
  thumbnailUrl: string | null
  license: string
  attribution: string | null
  tags: string[]
  category: string | null
  polyCount: number | null
}

async function fetchPolyHaven(q: string, limit: number, page: number, baseUrl: string): Promise<ExternalModel[]> {
  const all = await listPolyHavenModels()
  const lower = q.toLowerCase()
  const offset = page * limit

  const matches = Object.entries(all)
    .filter(([, asset]) => {
      return (
        asset.name.toLowerCase().includes(lower) ||
        asset.tags.some((t) => t.toLowerCase().includes(lower))
      )
    })
    .slice(offset, offset + limit)

  const settled = await Promise.allSettled(
    matches.map(async ([id, asset]) => {
      const files = await getPolyHavenFiles(id)
      // Verify GLTF exists before returning proxy URL
      const hasGltf = getBestGltfUrl(files) !== null
      if (!hasGltf) return null
      // Use server-side proxy that patches texture paths to avoid CDN 404s
      const glbUrl = `${baseUrl}/api/proxy/polyhaven?id=${encodeURIComponent(id)}&res=2k`
      const result: ExternalModel = {
        sourceId: id,
        source: 'polyhaven',
        name: asset.name,
        description: null,
        glbUrl,
        thumbnailUrl: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?width=256`,
        license: 'CC0',
        attribution: null,
        tags: asset.tags,
        category: asset.categories[0] ?? null,
        polyCount: null,
      }
      return result
    })
  )

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<ExternalModel> => r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value)
}

async function fetchPolyPizza(q: string, limit: number, page: number): Promise<ExternalModel[]> {
  const { results } = await searchPolyPizza(q, { limit, page })

  return results.reduce<ExternalModel[]>((acc, model: PolyPizzaModel) => {
    const glbUrl = getBestGlbUrl(model)
    if (!glbUrl) return acc
    acc.push({
      sourceId: model.ID,
      source: 'polypizza',
      name: model.Title,
      description: model.Description ?? null,
      glbUrl,
      thumbnailUrl: model.Thumbnail ?? null,
      license: model.Licence,
      attribution: model.Creator?.Username ?? null,
      tags: model.Tags ?? [],
      category: model.Category ?? null,
      polyCount: model['Tri Count'] ?? null,
    })
    return acc
  }, [])
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const source = searchParams.get('source') ?? 'all'
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') ?? '24', 10)))
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10))

  if (!q) {
    return NextResponse.json({ results: [], sources: [] })
  }

  // Check which plugins the user has enabled — gates which external sources are searched.
  // Free-tier plugins are accessible by default (no explicit enable needed).
  // Pro/Team plugins require an explicit enable in plugin prefs.
  const session = await getSession()
  const enabledPlugins = session ? getEnabledPlugins(session.pluginPrefs) : null
  const isFreePlugin = (id: string) =>
    (PLUGIN_CATALOG.find((p) => p.id === id)?.requiredPlan ?? 'free') === 'free'

  const pluginEnabled = (id: string) => {
    if (enabledPlugins === null) return true        // no session → open
    if (enabledPlugins.length === 0) return isFreePlugin(id) // uninitialized prefs → free plugins on
    return enabledPlugins.includes(id)              // initialized prefs → respect exactly
  }

  const origin = request.nextUrl.origin

  const wantHaven = (source === 'polyhaven' || source === 'all') && pluginEnabled('aruct:plugin-polyhaven')
  const wantPizza = (source === 'polypizza' || source === 'all') && pluginEnabled('aruct:plugin-polypizza')

  const [havenResult, pizzaResult] = await Promise.allSettled([
    wantHaven ? fetchPolyHaven(q, limit, page, origin) : Promise.resolve(null),
    wantPizza ? fetchPolyPizza(q, limit, page) : Promise.resolve(null),
  ])

  const results: ExternalModel[] = []
  const sources: string[] = []
  const unconfigured: string[] = []
  const disabled: string[] = []

  // Track which sources were skipped due to plugin not being enabled
  if ((source === 'polyhaven' || source === 'all') && !wantHaven) disabled.push('polyhaven')
  if ((source === 'polypizza' || source === 'all') && !wantPizza) disabled.push('polypizza')

  if (havenResult.status === 'fulfilled' && havenResult.value !== null) {
    results.push(...havenResult.value)
    if (havenResult.value.length > 0) sources.push('polyhaven')
  }

  if (pizzaResult.status === 'fulfilled' && pizzaResult.value !== null) {
    results.push(...pizzaResult.value)
    if (pizzaResult.value.length > 0) sources.push('polypizza')
  } else if (pizzaResult.status === 'rejected' && wantPizza) {
    console.error('[external] polypizza failed:', (pizzaResult.reason as Error)?.message ?? pizzaResult.reason)
    unconfigured.push('polypizza')
  }

  const havenCount = havenResult.status === 'fulfilled' && havenResult.value ? havenResult.value.length : 0
  const pizzaCount = pizzaResult.status === 'fulfilled' && pizzaResult.value ? pizzaResult.value.length : 0
  const hasMore = havenCount >= limit || pizzaCount >= limit

  return NextResponse.json({ results, sources, unconfigured, disabled, hasMore })
}
