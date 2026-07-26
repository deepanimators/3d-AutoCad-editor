import { type NextRequest, NextResponse } from 'next/server'
import {
  listPolyHavenModels,
  getPolyHavenFiles,
  getBestGltfUrl,
} from '@/lib/free-sources/poly-haven'
import { searchPolyPizza, getBestGlbUrl } from '@/lib/free-sources/poly-pizza'
import type { PolyPizzaModel } from '@/lib/free-sources/poly-pizza'

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

async function fetchPolyHaven(q: string, limit: number): Promise<ExternalModel[]> {
  const all = await listPolyHavenModels()
  const lower = q.toLowerCase()

  const matches = Object.entries(all)
    .filter(([, asset]) => {
      return (
        asset.name.toLowerCase().includes(lower) ||
        asset.tags.some((t) => t.toLowerCase().includes(lower))
      )
    })
    .slice(0, limit)

  const settled = await Promise.allSettled(
    matches.map(async ([id, asset]) => {
      const files = await getPolyHavenFiles(id)
      const glbUrl = getBestGltfUrl(files)
      if (!glbUrl) return null
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

async function fetchPolyPizza(q: string, limit: number): Promise<ExternalModel[]> {
  const { results } = await searchPolyPizza(q, { limit })

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
      license: model.License,
      attribution: model.Creator ?? null,
      tags: model.Tags ?? [],
      category: model.Category ?? null,
      polyCount: model.TriangleCount ?? null,
    })
    return acc
  }, [])
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const source = searchParams.get('source') ?? 'all'
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') ?? '24', 10)))

  if (!q) {
    return NextResponse.json({ results: [], sources: [] })
  }

  const wantHaven = source === 'polyhaven' || source === 'all'
  const wantPizza = source === 'polypizza' || source === 'all'

  const [havenResult, pizzaResult] = await Promise.allSettled([
    wantHaven ? fetchPolyHaven(q, limit) : Promise.resolve(null),
    wantPizza ? fetchPolyPizza(q, limit) : Promise.resolve(null),
  ])

  const results: ExternalModel[] = []
  const sources: string[] = []

  if (havenResult.status === 'fulfilled' && havenResult.value !== null) {
    results.push(...havenResult.value)
    sources.push('polyhaven')
  }

  if (pizzaResult.status === 'fulfilled' && pizzaResult.value !== null) {
    results.push(...pizzaResult.value)
    sources.push('polypizza')
  } else if (
    pizzaResult.status === 'rejected' &&
    pizzaResult.reason instanceof Error &&
    pizzaResult.reason.message === 'POLY_PIZZA_API_KEY not set'
  ) {
    // silently skip — API key not configured
  }

  return NextResponse.json({ results, sources })
}
