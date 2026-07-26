const POLY_PIZZA_API = 'https://api.poly.pizza/v1'

export type PolyPizzaModel = {
  ID: string
  Title: string
  Description?: string
  Creator?: string
  License: string
  Files: {
    GLTF?: string
    GLB?: string
    OBJ?: string
    FBX?: string
  }
  Thumbnail?: string
  TriangleCount?: number
  Tags?: string[]
  Category?: string
}

export type PolyPizzaSearchResult = {
  results: PolyPizzaModel[]
  total: number
}

export async function searchPolyPizza(
  query: string,
  options?: { category?: string; license?: string; limit?: number }
): Promise<PolyPizzaSearchResult> {
  const apiKey = process.env.POLY_PIZZA_API_KEY
  if (!apiKey) throw new Error('POLY_PIZZA_API_KEY not set')

  const params = new URLSearchParams({
    q: query,
    ...(options?.category && { category: options.category }),
    ...(options?.license && { license: options.license }),
    ...(options?.limit && { limit: String(options.limit) }),
  })

  const res = await fetch(`${POLY_PIZZA_API}/search?${params}`, {
    headers: { 'X-Api-Key': apiKey },
  })
  if (!res.ok) throw new Error(`Poly Pizza API error: ${res.status}`)
  return res.json()
}

export function getBestGlbUrl(model: PolyPizzaModel): string | null {
  return model.Files.GLB ?? model.Files.GLTF ?? null
}
