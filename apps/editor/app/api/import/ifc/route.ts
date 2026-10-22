import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { canImportDwg } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

// IFC files are binary — 200 MB is a generous upper bound for large buildings.
const MAX_SIZE = 200 * 1024 * 1024

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // IFC import is a pro feature, same gate as DXF/DWG import.
  if (!canImportDwg(session)) {
    return NextResponse.json(
      { error: 'Pro plan required to import IFC files' },
      { status: 403 },
    )
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
  if (!nameLower.endsWith('.ifc') && !nameLower.endsWith('.ifczip')) {
    return NextResponse.json(
      { error: 'Unsupported file type. Only .ifc files are accepted.' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 200 MB limit' }, { status: 413 })
  }

  // Load the raw bytes.
  const buffer = await file.arrayBuffer()
  const ifcData = new Uint8Array(buffer)

  // Resolve the web-ifc wasm directory. The converter calls
  // `ifcApi.SetWasmPath('/', true)` which looks for `web-ifc-node.wasm` at
  // the filesystem root — correct for browser public/ but wrong for a Node.js
  // server route. We monkey-patch SetWasmPath on the prototype before calling
  // the converter so it finds the wasm inside the installed package instead.
  let webIfcWasmDir: string
  try {
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    const webIfcPkgPath: string = require.resolve('web-ifc/package.json')
    const { dirname, join } = await import('path')
    webIfcWasmDir = join(dirname(webIfcPkgPath), '/').replaceAll('\\', '/')
  } catch {
    return NextResponse.json(
      {
        error:
          'web-ifc is not installed. Run: npm install web-ifc inside apps/editor, then restart the dev server.',
        hint: 'The @aruct/ifc-converter package requires web-ifc as a peer dependency.',
      },
      { status: 501 },
    )
  }

  // Dynamically import web-ifc and @aruct/ifc-converter to keep them out of
  // the edge bundle. The monkey-patch must happen before any IfcAPI is
  // constructed, so we import web-ifc first and patch, then import the
  // converter (which re-uses the same module instance from the require cache).
  let convertIfcToAruct: typeof import('@aruct/ifc-converter').convertIfcToAruct
  try {
    const WebIFC = await import('web-ifc')
    // Override SetWasmPath so the converter finds the wasm at the resolved
    // package directory rather than '/'.
    const OrigSetWasmPath = WebIFC.IfcAPI.prototype.SetWasmPath
    WebIFC.IfcAPI.prototype.SetWasmPath = function (
      this: InstanceType<typeof WebIFC.IfcAPI>,
      _path: string,
      _absolute?: boolean,
    ) {
      OrigSetWasmPath.call(this, webIfcWasmDir, true)
    }
    ;({ convertIfcToAruct } = await import('@aruct/ifc-converter'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Failed to load IFC converter', detail: msg },
      { status: 500 },
    )
  }

  let sceneGraph: Awaited<ReturnType<typeof convertIfcToAruct>>
  try {
    sceneGraph = await convertIfcToAruct(ifcData, undefined, { simplify: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'IFC parse failed', detail: msg },
      { status: 422 },
    )
  }

  const { nodes, rootNodeIds } = sceneGraph

  // Build a preview summary of what was found, so the client can show it
  // before the user commits to importing.
  const counts: Record<string, number> = {}
  for (const node of Object.values(nodes)) {
    counts[node.type] = (counts[node.type] ?? 0) + 1
  }

  return NextResponse.json({
    nodes,
    rootNodeIds,
    preview: {
      walls: counts.wall ?? 0,
      floors: counts.slab ?? 0,
      doors: counts.door ?? 0,
      windows: counts.window ?? 0,
      columns: counts.column ?? 0,
      stairs: counts.stair ?? 0,
      roofs: counts.roof ?? 0,
      levels: counts.level ?? 0,
      buildings: counts.building ?? 0,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    },
  })
}
