/**
 * Proxy for Poly Haven GLTF files.
 * Fetches the GLTF, patches all relative URI references (textures + bin buffers)
 * to absolute URLs using the Poly Haven files API include map, then returns
 * the modified GLTF. Three.js then loads each asset from the correct Poly Haven CDN path.
 *
 * Usage: GET /api/proxy/polyhaven?id={slug}&res=2k
 */
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PH_API = 'https://api.polyhaven.com'
const UA = 'AructEditor/1.0 (https://aruct.com)'

type IncludeEntry = { url: string; size: number }

type PHFilesResponse = {
  gltf?: Record<string, {
    gltf?: {
      url?: string
      size?: number
      include?: Record<string, IncludeEntry>
    }
  }>
  [key: string]: unknown
}

type GltfDocument = {
  images?: Array<{ uri?: string; [k: string]: unknown }>
  buffers?: Array<{ uri?: string; [k: string]: unknown }>
  [k: string]: unknown
}

const RES_PRIORITY = ['2k', '1k', '4k', '8k'] as const

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')?.trim()
  const reqRes = searchParams.get('res') ?? '2k'

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  // Fetch files manifest
  let filesData: PHFilesResponse
  try {
    const filesRes = await fetch(`${PH_API}/files/${id}`, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 3600 },
    })
    if (!filesRes.ok) return NextResponse.json({ error: 'upstream_files_error', status: filesRes.status }, { status: 502 })
    filesData = (await filesRes.json()) as PHFilesResponse
  } catch {
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 })
  }

  const gltfFormats = filesData.gltf
  if (!gltfFormats) {
    return NextResponse.json({ error: 'no_gltf_format' }, { status: 404 })
  }

  // Pick best resolution
  const resolutions = [reqRes, ...RES_PRIORITY].filter((v, i, a) => a.indexOf(v) === i)
  let gltfUrl: string | undefined
  let includeMap: Record<string, IncludeEntry> = {}

  for (const res of resolutions) {
    const entry = gltfFormats[res]?.gltf
    if (!entry) continue
    const url = entry.url ?? Object.values(entry.include ?? {}).find((_, k) => String(k).endsWith('.gltf'))?.url
    if (url) {
      gltfUrl = url
      includeMap = entry.include ?? {}
      break
    }
  }

  if (!gltfUrl) {
    return NextResponse.json({ error: 'gltf_url_not_found' }, { status: 404 })
  }

  // Fetch the GLTF JSON
  let gltf: GltfDocument
  try {
    const gltfRes = await fetch(gltfUrl, { headers: { 'User-Agent': UA } })
    if (!gltfRes.ok) return NextResponse.json({ error: 'gltf_fetch_error', status: gltfRes.status }, { status: 502 })
    gltf = (await gltfRes.json()) as GltfDocument
  } catch {
    return NextResponse.json({ error: 'gltf_parse_error' }, { status: 502 })
  }

  // Patch images[].uri relative → absolute using include map
  if (Array.isArray(gltf.images)) {
    gltf.images = gltf.images.map((img) => {
      if (!img.uri || img.uri.startsWith('http')) return img
      const absolute = includeMap[img.uri]?.url
      return absolute ? { ...img, uri: absolute } : img
    })
  }

  // Patch buffers[].uri relative → absolute
  if (Array.isArray(gltf.buffers)) {
    gltf.buffers = gltf.buffers.map((buf) => {
      if (!buf.uri || buf.uri.startsWith('http')) return buf
      const absolute = includeMap[buf.uri]?.url
      return absolute ? { ...buf, uri: absolute } : buf
    })
  }

  return new NextResponse(JSON.stringify(gltf), {
    headers: {
      'Content-Type': 'model/gltf+json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
