const POLY_PIZZA_API = 'https://api.poly.pizza/v1.1'

export type PolyPizzaModel = {
  ID: string
  Title: string
  Description?: string
  Attribution: string
  Thumbnail?: string
  Download: string
  'Tri Count': number
  Creator: { Username: string; DPURL?: string }
  Category?: string
  Tags?: string[]
  Licence: string
  Animated?: boolean
}

export type PolyPizzaSearchResult = {
  results: PolyPizzaModel[]
  total: number
}

export async function searchPolyPizza(
  query: string,
  options?: { limit?: number }
): Promise<PolyPizzaSearchResult> {
  const apiKey = process.env.POLY_PIZZA_API_KEY
  if (!apiKey) throw new Error('POLY_PIZZA_API_KEY not set')

  const params = new URLSearchParams()
  if (options?.limit) params.set('Limit', String(options.limit))

  const qs = params.toString()
  const url = `${POLY_PIZZA_API}/search/${encodeURIComponent(query)}${qs ? '?' + qs : ''}`

  const res = await fetch(url, {
    headers: { 'x-auth-token': apiKey },
  })
  if (!res.ok) throw new Error(`Poly Pizza API error: ${res.status} ${await res.text()}`)
  return res.json()
}

export function getBestGlbUrl(model: PolyPizzaModel): string | null {
  return model.Download ?? null
}
