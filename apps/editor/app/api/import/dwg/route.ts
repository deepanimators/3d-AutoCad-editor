import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { canImportDwg } from '@/lib/feature-gates'
import { parseDwg, dwgToSceneFragment } from '@/lib/dwg/dwg-parser'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_EXTENSIONS = new Set(['.dwg'])

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canImportDwg(session)) {
    return NextResponse.json({ error: 'Pro plan required to import DWG files' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  const nameLower = file.name.toLowerCase()
  const ext = nameLower.slice(nameLower.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: 'Only .dwg files are accepted by this endpoint. For .dxf files use /api/import/dxf.' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 413 })
  }

  const buffer = await file.arrayBuffer()

  let result: ReturnType<typeof parseDwg>
  try {
    result = parseDwg(buffer)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected parse error'
    return NextResponse.json({ error: `DWG parse failed: ${message}` }, { status: 422 })
  }

  if (result.version === 'unknown') {
    return NextResponse.json(
      { error: result.warnings[0] ?? 'Unsupported DWG version', warnings: result.warnings },
      { status: 415 },
    )
  }

  const fragment = dwgToSceneFragment(result)

  return NextResponse.json({
    version: result.version,
    units: result.units,
    layers: result.layers,
    entityCount: result.entities.length,
    extMin: result.extMin,
    extMax: result.extMax,
    warnings: result.warnings,
    sceneFragment: fragment,
  })
}
