const POLYHAVEN_API = 'https://api.polyhaven.com'
const USER_AGENT = 'AructEditor/1.0 (https://aruct.com)'

export type PolyHavenAsset = {
  id: string
  name: string
  categories: string[]
  tags: string[]
  type: number // 2 = models
}

export type PolyHavenFile = {
  gltf: {
    [resolution: string]: {
      gltf: {
        include: Record<string, { url: string; size: number }>
        url?: string
        size?: number
      }
    }
  }
}

export async function listPolyHavenModels(): Promise<Record<string, PolyHavenAsset>> {
  const res = await fetch(`${POLYHAVEN_API}/assets?type=models`, {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Poly Haven API error: ${res.status}`)
  return res.json()
}

export async function getPolyHavenFiles(id: string): Promise<PolyHavenFile> {
  const res = await fetch(`${POLYHAVEN_API}/files/${id}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`Poly Haven files API error: ${res.status}`)
  return res.json()
}

export function getBestGltfUrl(files: PolyHavenFile): string | null {
  const gltf = files.gltf
  if (!gltf) return null
  for (const res of ['2k', '1k', '4k']) {
    const entry = gltf[res]?.gltf
    if (entry) {
      if (entry.url) return entry.url
      const gltfFile = Object.entries(entry.include ?? {}).find(([k]) => k.endsWith('.gltf'))
      if (gltfFile) return gltfFile[1].url
    }
  }
  return null
}
