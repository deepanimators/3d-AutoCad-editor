/**
 * Aruct → IFC export.
 *
 * Writes a minimal but valid IFC 2x3 STEP file as plain text. The IFC STEP
 * format is line-based: each entity is  "#N = IFCENTITYTYPE(params...);"
 * We hand-build the string so we depend only on the web-ifc types already
 * present in the package — we do NOT use the web-ifc write API, which is
 * low-level and changes between minor releases.
 */

import type { AnyNode } from '@aruct/core'
import type { AructSceneGraph } from './index'

export interface AructToIfcOptions {
  projectName?: string
  projectDescription?: string
}

// IFC GlobalId: 22-char base64 encoding (IFC GUID encoding table)
const IFC_GUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'

function makeIfcGuid(): string {
  // Generate 22 chars from the IFC GUID alphabet (not a real UUID, but valid)
  let result = ''
  for (let i = 0; i < 22; i++) {
    result += IFC_GUID_CHARS[Math.floor(Math.random() * IFC_GUID_CHARS.length)]
  }
  return result
}

// Format a number for IFC output (no trailing zeros issues)
function fmt(n: number): string {
  // IFC needs real literals — avoid exponential notation
  if (!isFinite(n)) return '0.'
  const s = n.toPrecision(8)
  // Ensure there is always a decimal point (IFC REAL type)
  return s.includes('.') || s.includes('E') ? s : `${s}.`
}

function ifcStr(s: string): string {
  // Escape single-quotes inside IFC strings
  return `'${s.replace(/'/g, "''")}'`
}

function ifcBool(b: boolean): string {
  return b ? '.T.' : '.F.'
}

class IfcWriter {
  private lines: string[] = []
  private nextId = 1
  private encoder = new TextEncoder()

  id(): number {
    return this.nextId++
  }

  line(id: number, entity: string, ...args: string[]): void {
    this.lines.push(`#${id}=${entity}(${args.join(',')});`)
  }

  header(projectName: string): void {
    const now = new Date()
    const ts = now.toISOString().replace(/[-:]/g, '').split('.')[0]
    this.lines.push(
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('Aruct IFC Export'),'2;1');`,
      `FILE_NAME('export.ifc','${ts}',('Aruct'),('Aruct'),'Aruct Editor','Aruct Editor','');`,
      `FILE_SCHEMA(('IFC2X3'));`,
      'ENDSEC;',
      'DATA;',
    )
  }

  footer(): void {
    this.lines.push('ENDSEC;', 'END-ISO-10303-21;')
  }

  toBytes(): Uint8Array {
    return this.encoder.encode(this.lines.join('\n') + '\n')
  }
}

export function exportSceneToIfc(
  sceneGraph: AructSceneGraph,
  options?: AructToIfcOptions,
): Uint8Array {
  const projectName = options?.projectName ?? 'Aruct Export'
  const projectDescription = options?.projectDescription ?? ''
  const w = new IfcWriter()
  const nodes = sceneGraph.nodes

  w.header(projectName)

  // ── Shared geometry primitives ──────────────────────────────────────────

  // World coordinate system
  const originPtId = w.id()
  w.line(originPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')

  const zAxisId = w.id()
  w.line(zAxisId, 'IFCDIRECTION', '(0.,0.,1.)')

  const xAxisId = w.id()
  w.line(xAxisId, 'IFCDIRECTION', '(1.,0.,0.)')

  const worldAxis2Id = w.id()
  w.line(worldAxis2Id, 'IFCAXIS2PLACEMENT3D', `#${originPtId}`, `#${zAxisId}`, `#${xAxisId}`)

  const worldContextId = w.id()
  w.line(
    worldContextId,
    'IFCGEOMETRICREPRESENTATIONCONTEXT',
    `'Model'`,
    `'Model'`,
    '3',
    '1.E-05',
    `#${worldAxis2Id}`,
    '$',
  )

  // ── IFC hierarchy ───────────────────────────────────────────────────────

  // Units
  const unitAssignId = w.id()
  const siUnitMetre = w.id()
  w.line(siUnitMetre, 'IFCSIUNIT', '*', '.LENGTHUNIT.', '$', '.METRE.')
  const siUnitArea = w.id()
  w.line(siUnitArea, 'IFCSIUNIT', '*', '.AREAUNIT.', '$', '.SQUARE_METRE.')
  const siUnitVol = w.id()
  w.line(siUnitVol, 'IFCSIUNIT', '*', '.VOLUMEUNIT.', '$', '.CUBIC_METRE.')
  const siUnitAngle = w.id()
  w.line(siUnitAngle, 'IFCSIUNIT', '*', '.PLANEANGLEUNIT.', '$', '.RADIAN.')
  w.line(unitAssignId, 'IFCUNITASSIGNMENT', `(#${siUnitMetre},#${siUnitArea},#${siUnitVol},#${siUnitAngle})`)

  // Project
  const projectId = w.id()
  w.line(
    projectId,
    'IFCPROJECT',
    ifcStr(makeIfcGuid()),
    '$',
    ifcStr(projectName),
    projectDescription ? ifcStr(projectDescription) : '$',
    '$',
    '$',
    '$',
    `(#${worldContextId})`,
    `#${unitAssignId}`,
  )

  // Site
  const siteAxisId = w.id()
  w.line(siteAxisId, 'IFCAXIS2PLACEMENT3D', `#${originPtId}`, '$', '$')
  const sitePlacementId = w.id()
  w.line(sitePlacementId, 'IFCLOCALPLACEMENT', '$', `#${siteAxisId}`)
  const siteId = w.id()
  w.line(
    siteId,
    'IFCSITE',
    ifcStr(makeIfcGuid()),
    '$',
    ifcStr('Default Site'),
    '$',
    '$',
    `#${sitePlacementId}`,
    '$',
    '$',
    '.ELEMENT.',
    '$',
    '$',
    '$',
    '$',
    '$',
  )

  // Building
  const buildingAxisId = w.id()
  w.line(buildingAxisId, 'IFCAXIS2PLACEMENT3D', `#${originPtId}`, '$', '$')
  const buildingPlacementId = w.id()
  w.line(buildingPlacementId, 'IFCLOCALPLACEMENT', `#${sitePlacementId}`, `#${buildingAxisId}`)
  const buildingId = w.id()
  w.line(
    buildingId,
    'IFCBUILDING',
    ifcStr(makeIfcGuid()),
    '$',
    ifcStr(projectName),
    '$',
    '$',
    `#${buildingPlacementId}`,
    '$',
    '$',
    '.ELEMENT.',
    '$',
    '$',
    '$',
  )

  // Project → Site → Building aggregation
  const projSiteRelId = w.id()
  w.line(
    projSiteRelId,
    'IFCRELAGGREGATES',
    ifcStr(makeIfcGuid()),
    '$',
    '$',
    '$',
    `#${projectId}`,
    `(#${siteId})`,
  )
  const siteBldgRelId = w.id()
  w.line(
    siteBldgRelId,
    'IFCRELAGGREGATES',
    ifcStr(makeIfcGuid()),
    '$',
    '$',
    '$',
    `#${siteId}`,
    `(#${buildingId})`,
  )

  // ── Building storeys (one per LevelNode) ────────────────────────────────

  const levelNodes: AnyNode[] = Object.values(nodes).filter((n) => n.type === 'level')
  // Sort by level index
  levelNodes.sort((a, b) => {
    const la = (a as { level?: number }).level ?? 0
    const lb = (b as { level?: number }).level ?? 0
    return la - lb
  })

  // Map from Aruct node id → IFC storey entity id + placement id
  const storeyById = new Map<string, { storeyId: number; placementId: number }>()

  const storeyEntityIds: number[] = []

  for (const lvl of levelNodes) {
    const elevation =
      (lvl.metadata as { elevation?: number } | undefined)?.elevation ?? 0

    const ptId = w.id()
    w.line(ptId, 'IFCCARTESIANPOINT', `(0.,0.,${fmt(elevation)})`)
    const axId = w.id()
    w.line(axId, 'IFCAXIS2PLACEMENT3D', `#${ptId}`, '$', '$')
    const plId = w.id()
    w.line(plId, 'IFCLOCALPLACEMENT', `#${buildingPlacementId}`, `#${axId}`)
    const stId = w.id()
    w.line(
      stId,
      'IFCBUILDINGSTOREY',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((lvl as { name?: string }).name ?? `Level ${(lvl as { level?: number }).level ?? 0}`),
      '$',
      '$',
      `#${plId}`,
      '$',
      '$',
      '.ELEMENT.',
      fmt(elevation),
    )
    storeyEntityIds.push(stId)
    storeyById.set(lvl.id, { storeyId: stId, placementId: plId })
  }

  // If there are no level nodes create a default storey
  if (storeyEntityIds.length === 0) {
    const ptId = w.id()
    w.line(ptId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const axId = w.id()
    w.line(axId, 'IFCAXIS2PLACEMENT3D', `#${ptId}`, '$', '$')
    const plId = w.id()
    w.line(plId, 'IFCLOCALPLACEMENT', `#${buildingPlacementId}`, `#${axId}`)
    const stId = w.id()
    w.line(
      stId,
      'IFCBUILDINGSTOREY',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr('Ground Floor'),
      '$',
      '$',
      `#${plId}`,
      '$',
      '$',
      '.ELEMENT.',
      '0.',
    )
    storeyEntityIds.push(stId)
    // Map all elements to this default storey
    storeyById.set('__default__', { storeyId: stId, placementId: plId })
  }

  // Building → storeys aggregation
  const bldgStoreyRelId = w.id()
  const storeyRefs = storeyEntityIds.map((id) => `#${id}`).join(',')
  w.line(
    bldgStoreyRelId,
    'IFCRELAGGREGATES',
    ifcStr(makeIfcGuid()),
    '$',
    '$',
    '$',
    `#${buildingId}`,
    `(${storeyRefs})`,
  )

  // ── Element nodes, grouped by storey for IfcRelContainedInSpatialStructure ─

  // storeyId → list of IFC element entity ids contained
  const storeyContainedElements = new Map<number, number[]>()
  for (const stId of storeyEntityIds) {
    storeyContainedElements.set(stId, [])
  }

  /** Find the IFC storey id for an Aruct node. */
  function resolveStoreyId(node: AnyNode): { storeyId: number; placementId: number } {
    // Walk up parentId chain to find a LevelNode
    let current: AnyNode | undefined = node
    for (let guard = 0; guard < 20 && current; guard++) {
      if (current.type === 'level') {
        const info = storeyById.get(current.id)
        if (info) return info
      }
      const parentId = (current as { parentId?: string | null }).parentId
      if (!parentId) break
      current = nodes[parentId]
    }
    // Also check metadata.levelId
    const levelId = (node.metadata as { levelId?: string } | undefined)?.levelId
    if (levelId) {
      const info = storeyById.get(levelId)
      if (info) return info
    }
    // Default: first storey
    if (storeyEntityIds[0]) {
      return storeyContainedElements.has(storeyEntityIds[0])
        ? { storeyId: storeyEntityIds[0], placementId: 0 }
        : { storeyId: storeyEntityIds[0], placementId: 0 }
    }
    const defaultInfo = storeyById.get('__default__')
    return defaultInfo ?? { storeyId: storeyEntityIds[0] ?? 0, placementId: 0 }
  }

  function addToStorey(storeyId: number, elementId: number): void {
    const arr = storeyContainedElements.get(storeyId)
    if (arr) arr.push(elementId)
    else storeyContainedElements.set(storeyId, [elementId])
  }

  // Helper: create a local placement at (x, y, z) relative to building
  function makePlacement(x: number, y: number, z: number): number {
    const ptId = w.id()
    w.line(ptId, 'IFCCARTESIANPOINT', `(${fmt(x)},${fmt(y)},${fmt(z)})`)
    const axId = w.id()
    w.line(axId, 'IFCAXIS2PLACEMENT3D', `#${ptId}`, '$', '$')
    const plId = w.id()
    w.line(plId, 'IFCLOCALPLACEMENT', `#${buildingPlacementId}`, `#${axId}`)
    return plId
  }

  // Helper: create a wall placement oriented along start→end
  function makeWallPlacement(
    sx: number,
    sy: number,
    elevation: number,
    dx: number,
    dy: number,
  ): number {
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const ptId = w.id()
    w.line(ptId, 'IFCCARTESIANPOINT', `(${fmt(sx)},${fmt(sy)},${fmt(elevation)})`)
    // RefDirection is the wall's X axis (along the wall)
    const xDirId = w.id()
    w.line(xDirId, 'IFCDIRECTION', `(${fmt(ux)},${fmt(uy)},0.)`)
    const axId = w.id()
    w.line(axId, 'IFCAXIS2PLACEMENT3D', `#${ptId}`, '$', `#${xDirId}`)
    const plId = w.id()
    w.line(plId, 'IFCLOCALPLACEMENT', `#${buildingPlacementId}`, `#${axId}`)
    return plId
  }

  // ── Walls ───────────────────────────────────────────────────────────────

  const wallNodes = Object.values(nodes).filter((n) => n.type === 'wall')
  for (const node of wallNodes) {
    const wall = node as {
      id: string
      name?: string
      start: [number, number]
      end: [number, number]
      thickness?: number
      height?: number
      parentId?: string | null
    }

    const sx = wall.start[0]
    const sy = wall.start[1]
    const ex = wall.end[0]
    const ey = wall.end[1]
    const dx = ex - sx
    const dy = ey - sy
    const length = Math.hypot(dx, dy)
    if (length < 1e-6) continue

    const thickness = wall.thickness ?? 0.1
    const height = wall.height ?? 3.0

    // Elevation: resolve from parent level
    let elevation = 0
    const { storeyId } = resolveStoreyId(node)
    const lvlNode = levelNodes.find((l) => {
      const info = storeyById.get(l.id)
      return info?.storeyId === storeyId
    })
    if (lvlNode) {
      elevation = (lvlNode.metadata as { elevation?: number } | undefined)?.elevation ?? 0
    }

    const plId = makeWallPlacement(sx, sy, elevation, dx, dy)

    // Axis representation: 2D line along wall
    const axisPt1Id = w.id()
    w.line(axisPt1Id, 'IFCCARTESIANPOINT', `(0.,0.)`)
    const axisPt2Id = w.id()
    w.line(axisPt2Id, 'IFCCARTESIANPOINT', `(${fmt(length)},0.)`)
    const axisPolyId = w.id()
    w.line(axisPolyId, 'IFCPOLYLINE', `(#${axisPt1Id},#${axisPt2Id})`)
    const axisRepId = w.id()
    w.line(
      axisRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Axis'`,
      `'Curve2D'`,
      `(#${axisPolyId})`,
    )

    // Body: extruded rectangle (thickness × height, extruded along Z)
    const profileId = w.id()
    const profileOriginId = w.id()
    w.line(profileOriginId, 'IFCCARTESIANPOINT', `(${fmt(length / 2)},0.)`)
    const profileDirId = w.id()
    w.line(profileDirId, 'IFCDIRECTION', '(1.,0.)')
    const profileAxis2dId = w.id()
    w.line(profileAxis2dId, 'IFCAXIS2PLACEMENT2D', `#${profileOriginId}`, `#${profileDirId}`)
    w.line(profileId, 'IFCRECTANGLEPROFILEDEF', `'AREA'`, '$', `#${profileAxis2dId}`, fmt(length), fmt(thickness))

    const extrudeDirId = w.id()
    w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
    const extrudeAxisPtId = w.id()
    w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const extrudeAxisId = w.id()
    w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
    const solidId = w.id()
    w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(height))

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )

    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${axisRepId},#${bodyRepId})`)

    const wallEntityId = w.id()
    w.line(
      wallEntityId,
      'IFCWALLSTANDARDCASE',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr(wall.name ?? 'Wall'),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
    )

    addToStorey(storeyId, wallEntityId)
  }

  // ── Doors ───────────────────────────────────────────────────────────────

  const doorNodes = Object.values(nodes).filter((n) => n.type === 'door')
  for (const node of doorNodes) {
    const door = node as {
      id: string
      name?: string
      width?: number
      height?: number
      position?: [number, number, number]
      parentId?: string | null
    }

    const width = door.width ?? 0.9
    const height = door.height ?? 2.1
    const pos = door.position ?? [0, 0, 0]

    const { storeyId } = resolveStoreyId(node)

    // Place door at its absolute position (simplified — doesn't account for wall rotation)
    let worldX = pos[0]
    let worldY = pos[2] ?? 0 // pos[2] is Z in Aruct, but doors are on walls
    let worldZ = 0

    // If parent is a wall, get the wall's position
    const parentId = (node as { parentId?: string | null }).parentId
    if (parentId && nodes[parentId]?.type === 'wall') {
      const parentWall = nodes[parentId] as {
        start: [number, number]
        end: [number, number]
      }
      const sx = parentWall.start[0]
      const sy = parentWall.start[1]
      const ex = parentWall.end[0]
      const ey = parentWall.end[1]
      const dx = ex - sx
      const dy = ey - sy
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len
      const along = pos[0]
      worldX = sx + ux * along
      worldY = sy + uy * along
      worldZ = 0
    }

    const plId = makePlacement(worldX, worldY, worldZ)

    const solidId = w.id()
    const profileId = w.id()
    const profileOriginId = w.id()
    w.line(profileOriginId, 'IFCCARTESIANPOINT', `(0.,0.)`)
    const profileAxisId = w.id()
    w.line(profileAxisId, 'IFCAXIS2PLACEMENT2D', `#${profileOriginId}`, '$')
    w.line(profileId, 'IFCRECTANGLEPROFILEDEF', `'AREA'`, '$', `#${profileAxisId}`, fmt(width), fmt(0.2))
    const extrudeDirId = w.id()
    w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
    const extrudeAxisPtId = w.id()
    w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const extrudeAxisId = w.id()
    w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
    w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(height))

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )
    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${bodyRepId})`)

    const doorEntityId = w.id()
    w.line(
      doorEntityId,
      'IFCDOOR',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((door.name as string | undefined) ?? 'Door'),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
      fmt(height),
      fmt(width),
    )

    addToStorey(storeyId, doorEntityId)
  }

  // ── Windows ─────────────────────────────────────────────────────────────

  const windowNodes = Object.values(nodes).filter((n) => n.type === 'window')
  for (const node of windowNodes) {
    const win = node as {
      id: string
      name?: string
      width?: number
      height?: number
      position?: [number, number, number]
      parentId?: string | null
    }

    const width = win.width ?? 1.0
    const height = win.height ?? 1.2
    const pos = win.position ?? [0, 0, 0]

    const { storeyId } = resolveStoreyId(node)

    let worldX = pos[0]
    let worldY = pos[2] ?? 0
    let worldZ = (pos[1] ?? 0) - height / 2 // sill height

    const parentId = (node as { parentId?: string | null }).parentId
    if (parentId && nodes[parentId]?.type === 'wall') {
      const parentWall = nodes[parentId] as {
        start: [number, number]
        end: [number, number]
      }
      const sx = parentWall.start[0]
      const sy = parentWall.start[1]
      const ex = parentWall.end[0]
      const ey = parentWall.end[1]
      const dx = ex - sx
      const dy = ey - sy
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len
      const along = pos[0]
      worldX = sx + ux * along
      worldY = sy + uy * along
      worldZ = (pos[1] ?? 0) - height / 2
    }

    const plId = makePlacement(worldX, worldY, worldZ)

    const solidId = w.id()
    const profileId = w.id()
    const profileOriginId = w.id()
    w.line(profileOriginId, 'IFCCARTESIANPOINT', `(0.,0.)`)
    const profileAxisId = w.id()
    w.line(profileAxisId, 'IFCAXIS2PLACEMENT2D', `#${profileOriginId}`, '$')
    w.line(profileId, 'IFCRECTANGLEPROFILEDEF', `'AREA'`, '$', `#${profileAxisId}`, fmt(width), fmt(0.1))
    const extrudeDirId = w.id()
    w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
    const extrudeAxisPtId = w.id()
    w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const extrudeAxisId = w.id()
    w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
    w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(height))

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )
    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${bodyRepId})`)

    const winEntityId = w.id()
    w.line(
      winEntityId,
      'IFCWINDOW',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((win.name as string | undefined) ?? 'Window'),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
      fmt(height),
      fmt(width),
    )

    addToStorey(storeyId, winEntityId)
  }

  // ── Slabs ───────────────────────────────────────────────────────────────

  const slabNodes = Object.values(nodes).filter((n) => n.type === 'slab')
  for (const node of slabNodes) {
    const slab = node as {
      id: string
      name?: string
      polygon?: [number, number][]
      elevation?: number
      parentId?: string | null
    }

    const polygon = slab.polygon
    if (!polygon || polygon.length < 3) continue

    const elevation = slab.elevation ?? 0
    const thickness = (node.metadata as { thickness?: number } | undefined)?.thickness ?? 0.2
    const { storeyId } = resolveStoreyId(node)

    const plId = makePlacement(0, 0, elevation)

    // Build polyline from polygon points
    const ptIds: number[] = []
    for (const [px, py] of polygon) {
      const ptId = w.id()
      w.line(ptId, 'IFCCARTESIANPOINT', `(${fmt(px)},${fmt(py)})`)
      ptIds.push(ptId)
    }
    // Close the polygon
    ptIds.push(ptIds[0]!)
    const polyId = w.id()
    w.line(polyId, 'IFCPOLYLINE', `(${ptIds.map((id) => `#${id}`).join(',')})`)

    const curveProfileId = w.id()
    w.line(curveProfileId, 'IFCARBITRARYCLOSEDPROFILEDEF', `'AREA'`, '$', `#${polyId}`)

    const extrudeDirId = w.id()
    w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,-1.)')
    const extrudeAxisPtId = w.id()
    w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const extrudeAxisId = w.id()
    w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
    const solidId = w.id()
    w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${curveProfileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(thickness))

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )
    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${bodyRepId})`)

    const slabEntityId = w.id()
    w.line(
      slabEntityId,
      'IFCSLAB',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((slab.name as string | undefined) ?? 'Slab'),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
      `'.FLOOR.'`,
    )

    addToStorey(storeyId, slabEntityId)
  }

  // ── Roofs ────────────────────────────────────────────────────────────────

  const roofNodes = Object.values(nodes).filter((n) => n.type === 'roof')
  for (const node of roofNodes) {
    const roof = node as {
      id: string
      name?: string
      elevation?: number
      parentId?: string | null
    }

    const elevation = roof.elevation ?? 0
    const polygon = (node.metadata as { polygon?: [number, number][] } | undefined)?.polygon
    const roofHeight = (node.metadata as { height?: number } | undefined)?.height ?? 0.3
    const { storeyId } = resolveStoreyId(node)

    const plId = makePlacement(0, 0, elevation)

    let solidId: number

    if (polygon && polygon.length >= 3) {
      const ptIds: number[] = []
      for (const [px, py] of polygon) {
        const ptId = w.id()
        w.line(ptId, 'IFCCARTESIANPOINT', `(${fmt(px)},${fmt(py)})`)
        ptIds.push(ptId)
      }
      ptIds.push(ptIds[0]!)
      const polyId = w.id()
      w.line(polyId, 'IFCPOLYLINE', `(${ptIds.map((id) => `#${id}`).join(',')})`)
      const profileId = w.id()
      w.line(profileId, 'IFCARBITRARYCLOSEDPROFILEDEF', `'AREA'`, '$', `#${polyId}`)
      const extrudeDirId = w.id()
      w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
      const extrudeAxisPtId = w.id()
      w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
      const extrudeAxisId = w.id()
      w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
      solidId = w.id()
      w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(roofHeight))
    } else {
      // Fallback: small placeholder box
      const profileOriginId = w.id()
      w.line(profileOriginId, 'IFCCARTESIANPOINT', `(0.,0.)`)
      const profileAxisId = w.id()
      w.line(profileAxisId, 'IFCAXIS2PLACEMENT2D', `#${profileOriginId}`, '$')
      const profileId = w.id()
      w.line(profileId, 'IFCRECTANGLEPROFILEDEF', `'AREA'`, '$', `#${profileAxisId}`, '5.', '5.')
      const extrudeDirId = w.id()
      w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
      const extrudeAxisPtId = w.id()
      w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
      const extrudeAxisId = w.id()
      w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
      solidId = w.id()
      w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, fmt(roofHeight))
    }

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )
    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${bodyRepId})`)

    const roofEntityId = w.id()
    w.line(
      roofEntityId,
      'IFCROOF',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((roof.name as string | undefined) ?? 'Roof'),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
      `'.FLAT_ROOF.'`,
    )

    addToStorey(storeyId, roofEntityId)
  }

  // ── Other nodes → IfcBuildingElementProxy ───────────────────────────────

  const handledTypes = new Set(['site', 'building', 'level', 'wall', 'door', 'window', 'slab', 'roof'])
  const otherNodes = Object.values(nodes).filter((n) => !handledTypes.has(n.type))

  for (const node of otherNodes) {
    const { storeyId } = resolveStoreyId(node)
    const plId = makePlacement(0, 0, 0)

    // Minimal shape: a 0.1m cube placeholder
    const profileOriginId = w.id()
    w.line(profileOriginId, 'IFCCARTESIANPOINT', `(0.,0.)`)
    const profileAxisId = w.id()
    w.line(profileAxisId, 'IFCAXIS2PLACEMENT2D', `#${profileOriginId}`, '$')
    const profileId = w.id()
    w.line(profileId, 'IFCRECTANGLEPROFILEDEF', `'AREA'`, '$', `#${profileAxisId}`, '0.1', '0.1')
    const extrudeDirId = w.id()
    w.line(extrudeDirId, 'IFCDIRECTION', '(0.,0.,1.)')
    const extrudeAxisPtId = w.id()
    w.line(extrudeAxisPtId, 'IFCCARTESIANPOINT', '(0.,0.,0.)')
    const extrudeAxisId = w.id()
    w.line(extrudeAxisId, 'IFCAXIS2PLACEMENT3D', `#${extrudeAxisPtId}`, '$', '$')
    const solidId = w.id()
    w.line(solidId, 'IFCEXTRUDEDAREASOLID', `#${profileId}`, `#${extrudeAxisId}`, `#${extrudeDirId}`, '0.1')

    const bodyRepId = w.id()
    w.line(
      bodyRepId,
      'IFCSHAPEREPRESENTATION',
      `#${worldContextId}`,
      `'Body'`,
      `'SweptSolid'`,
      `(#${solidId})`,
    )
    const prodRepId = w.id()
    w.line(prodRepId, 'IFCPRODUCTDEFINITIONSHAPE', '$', '$', `(#${bodyRepId})`)

    const proxyId = w.id()
    w.line(
      proxyId,
      'IFCBUILDINGELEMENTPROXY',
      ifcStr(makeIfcGuid()),
      '$',
      ifcStr((node as { name?: string }).name ?? node.type),
      '$',
      '$',
      `#${plId}`,
      `#${prodRepId}`,
      '$',
      '$',
    )

    addToStorey(storeyId, proxyId)
  }

  // ── IfcRelContainedInSpatialStructure for each storey ───────────────────

  for (const [storeyId, elementIds] of storeyContainedElements) {
    if (elementIds.length === 0) continue
    const relId = w.id()
    w.line(
      relId,
      'IFCRELCONTAINEDINSPATIALSTRUCTURE',
      ifcStr(makeIfcGuid()),
      '$',
      '$',
      '$',
      `(${elementIds.map((id) => `#${id}`).join(',')})`,
      `#${storeyId}`,
    )
  }

  w.footer()
  return w.toBytes()
}
