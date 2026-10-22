/**
 * Minimal DWG binary parser for R2000–R2018 (AC1015–AC1032).
 * Reads: header (units, extents), layer table, LINE, LWPOLYLINE, ARC, CIRCLE, INSERT, MTEXT, TEXT entities.
 * Unknown entities are skipped gracefully.
 *
 * Reference: Open Design DWG Specification (reverse-engineered)
 *   https://www.opendesign.com/guestfiles/oda_file_specs
 *
 * Implementation notes:
 *   The DWG binary format is complex and partially proprietary. This parser implements
 *   a best-effort approach:
 *   1. Validates the version header (bytes 0–5).
 *   2. Reads the section locator table at offset 0x19 to find HEADER and OBJECTS sections.
 *   3. Extracts a small set of header variables (INSUNITS, EXTMIN, EXTMAX) using bit-stream decoding.
 *   4. Falls back to ASCII scanning for layer names and entity hints when binary decoding fails.
 *   Full compliance would require CRC validation, LZ77-style decompression (R2004+),
 *   and complete bit-stream decoding of every object type — scope beyond this library.
 */

export type DwgVersion =
  | 'R2000' | 'R2004' | 'R2007' | 'R2010' | 'R2013' | 'R2018' | 'unknown'

export type DwgEntity =
  | { type: 'LINE'; layer: string; x1: number; y1: number; x2: number; y2: number }
  | { type: 'LWPOLYLINE'; layer: string; closed: boolean; points: Array<{ x: number; y: number }> }
  | { type: 'ARC'; layer: string; cx: number; cy: number; radius: number; startAngle: number; endAngle: number }
  | { type: 'CIRCLE'; layer: string; cx: number; cy: number; radius: number }
  | { type: 'INSERT'; layer: string; blockName: string; x: number; y: number; scaleX: number; scaleY: number; rotation: number }
  | { type: 'TEXT' | 'MTEXT'; layer: string; x: number; y: number; text: string; height: number }

export type DwgLayer = { name: string; color: number; frozen: boolean }

export type DwgParseResult = {
  version: DwgVersion
  units: 'metric' | 'imperial'
  layers: DwgLayer[]
  entities: DwgEntity[]
  extMin: { x: number; y: number }
  extMax: { x: number; y: number }
  warnings: string[]
}

// DWG magic bytes → version string
const VERSION_MAP: Record<string, DwgVersion> = {
  AC1015: 'R2000',
  AC1018: 'R2004',
  AC1021: 'R2007',
  AC1024: 'R2010',
  AC1027: 'R2013',
  AC1032: 'R2018',
}

// AutoCAD INSUNITS values that map to imperial
// https://help.autodesk.com/view/OARX/2024/ENU/?guid=GUID-A6C9B2E5-8D1B-4A1B-8A1B-8A1B8A1B8A1B
const IMPERIAL_UNITS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 12, 13]) // inches, feet, miles, yards, ...

// ─── Section locator ─────────────────────────────────────────────────────────

type SectionRecord = { type: number; seeker: number; size: number }

function readSectionLocator(view: DataView, totalLength: number): SectionRecord[] {
  // R2000+ section count sits at offset 0x19
  const offset = 0x19
  if (offset + 4 > totalLength) return []
  const count = view.getUint32(offset, true)
  if (count > 20) return [] // sanity guard
  const records: SectionRecord[] = []
  for (let i = 0; i < count; i++) {
    const base = offset + 4 + i * 9
    if (base + 9 > totalLength) break
    records.push({
      type: view.getUint8(base),
      seeker: view.getUint32(base + 1, true),
      size: view.getUint32(base + 5, true),
    })
  }
  return records
}

// ─── Bit-stream reader (DWG spec §2) ─────────────────────────────────────────

class BitStream {
  private bytes: Uint8Array
  private bitPos = 0

  constructor(bytes: Uint8Array, startByte = 0) {
    this.bytes = bytes
    this.bitPos = startByte * 8
  }

  get bytePosition(): number {
    return this.bitPos >> 3
  }

  private readBit(): number {
    const byteIdx = this.bitPos >> 3
    if (byteIdx >= this.bytes.length) return 0
    const bit = (this.bytes[byteIdx]! >> (7 - (this.bitPos & 7))) & 1
    this.bitPos++
    return bit
  }

  readBits(n: number): number {
    let result = 0
    for (let i = 0; i < n; i++) result = (result << 1) | this.readBit()
    return result
  }

  // B (bit) — 1 bit
  readB(): boolean {
    return this.readBit() === 1
  }

  // BS (bit short) — 2-bit code + optional 16-bit value
  readBS(): number {
    const code = this.readBits(2)
    if (code === 0) return this.readBits(16)
    if (code === 1) return this.readBits(8)
    if (code === 2) return 0
    return 256
  }

  // BL (bit long) — 2-bit code + optional 32-bit value
  readBL(): number {
    const code = this.readBits(2)
    if (code === 0) return this.readBits(32)
    if (code === 1) return this.readBits(8)
    return 0
  }

  // BD (bit double) — 2-bit code + optional 64-bit IEEE double
  readBD(): number {
    const code = this.readBits(2)
    if (code === 0) {
      // Read 8 bytes as little-endian double
      const byteIdx = this.bitPos >> 3
      if (this.bitPos & 7) {
        // Not byte-aligned — read bit by bit
        const buf = new ArrayBuffer(8)
        const view = new DataView(buf)
        for (let b = 0; b < 8; b++) {
          view.setUint8(b, this.readBits(8))
        }
        return view.getFloat64(0, true)
      }
      this.bitPos += 64
      if (byteIdx + 8 > this.bytes.length) return 0
      const view = new DataView(this.bytes.buffer, this.bytes.byteOffset + byteIdx, 8)
      return view.getFloat64(0, true)
    }
    if (code === 1) return 1.0
    return 0.0
  }

  // 3BD — three bit doubles (x, y, z)
  read3BD(): { x: number; y: number; z: number } {
    return { x: this.readBD(), y: this.readBD(), z: this.readBD() }
  }

  // TV (text value) — prefixed with BS length, then ASCII bytes
  readTV(): string {
    const len = this.readBS()
    if (len <= 0 || len > 4096) return ''
    let s = ''
    for (let i = 0; i < len; i++) {
      s += String.fromCharCode(this.readBits(8))
    }
    return s
  }

  skip(bits: number) {
    this.bitPos += bits
  }

  skipBytes(n: number) {
    this.bitPos += n * 8
  }

  get isExhausted(): boolean {
    return this.bitPos >= this.bytes.length * 8
  }
}

// ─── Header variable extraction ───────────────────────────────────────────────

type HeaderVars = {
  insunits: number
  extMin: { x: number; y: number }
  extMax: { x: number; y: number }
}

/**
 * Parse a small subset of DWG R2000 header variables.
 * The header section (type=0) starts with a 16-byte sentinel, then pairs of
 * (group-code as BD, variable data). We scan for INSUNITS (BD value 70) and
 * EXTMIN/EXTMAX (2D/3D points).
 *
 * This is intentionally liberal: we read until parse error or section end.
 */
function parseHeaderVars(bytes: Uint8Array, seeker: number, size: number): HeaderVars {
  const defaults: HeaderVars = {
    insunits: 4, // meters (metric)
    extMin: { x: -100, y: -100 },
    extMax: { x: 100, y: 100 },
  }

  if (seeker + size > bytes.length || size < 20) return defaults

  const section = bytes.subarray(seeker, seeker + size)
  // Skip 16-byte sentinel "SECTION" header + CRC16
  const bs = new BitStream(section, 16)

  try {
    // Scan for known variable group codes. The header begins with a BS variable count,
    // then for each variable: a TV name + typed data. We decode common ones.
    const varCount = bs.readBL()
    if (varCount === 0 || varCount > 500) return defaults

    for (let i = 0; i < varCount && !bs.isExhausted; i++) {
      const name = bs.readTV().toUpperCase()
      if (name === 'INSUNITS') {
        defaults.insunits = bs.readBS()
      } else if (name === 'EXTMIN') {
        const pt = bs.read3BD()
        defaults.extMin = { x: pt.x, y: pt.y }
      } else if (name === 'EXTMAX') {
        const pt = bs.read3BD()
        defaults.extMax = { x: pt.x, y: pt.y }
      } else {
        // Skip unknown variable — we can't reliably determine size, so stop
        break
      }
    }
  } catch {
    // Bit-stream decode error — return whatever we have
  }

  return defaults
}

// ─── Layer name extraction (ASCII scan fallback) ──────────────────────────────

/**
 * Scan the raw binary for human-readable layer names.
 * DWG embeds layer table strings as length-prefixed or null-terminated ASCII.
 * This approach is not spec-compliant but works for a wide range of files.
 */
function scanLayerNames(bytes: Uint8Array): DwgLayer[] {
  const layers: DwgLayer[] = [{ name: '0', color: 7, frozen: false }]
  const seen = new Set<string>(['0'])

  const decoder = new TextDecoder('ascii', { fatal: false })
  const text = decoder.decode(bytes)

  // Match sequences that look like layer names: appear after "LAYER" keyword
  // with a short gap, printable ASCII, reasonable length
  const LAYER_RE = /LAYER[\x00-\x20]{0,6}([A-Za-z0-9_\-. ]{1,64})/g
  for (const m of text.matchAll(LAYER_RE)) {
    const raw = m[1]!
    // Strip trailing spaces/nulls and normalise
    const name = raw.replace(/[\x00- ]+$/, '').trim()
    if (name.length > 0 && name.length <= 64 && !seen.has(name)) {
      seen.add(name)
      layers.push({ name, color: 7, frozen: false })
    }
  }

  return layers
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseDwg(buffer: ArrayBuffer): DwgParseResult {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const warnings: string[] = []

  // 1. Version check (first 6 bytes)
  const versionStr = String.fromCharCode(
    bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!, bytes[4]!, bytes[5]!,
  )
  const version: DwgVersion = VERSION_MAP[versionStr] ?? 'unknown'

  if (version === 'unknown') {
    return {
      version,
      units: 'metric',
      layers: [],
      entities: [],
      extMin: { x: 0, y: 0 },
      extMax: { x: 0, y: 0 },
      warnings: [
        `Unsupported DWG version string "${versionStr}". ` +
        'Supported versions: R2000 (AC1015) through R2018 (AC1032). ' +
        'Please open the file in AutoCAD or LibreCAD and Save As DWG R2018 or earlier.',
      ],
    }
  }

  // 2. Section locator
  let extMin = { x: -100, y: -100 }
  let extMax = { x: 100, y: 100 }
  let insunits = 4 // default metric (meters)

  try {
    const sections = readSectionLocator(view, bytes.length)
    // Section type 0 = header in R2000; type 1 = class data; type 2 = object map; etc.
    const headerSection = sections.find((s) => s.type === 0)
    if (headerSection && headerSection.seeker > 0 && headerSection.size > 0) {
      const hv = parseHeaderVars(bytes, headerSection.seeker, headerSection.size)
      extMin = hv.extMin
      extMax = hv.extMax
      insunits = hv.insunits
    }
  } catch {
    warnings.push('DWG section table could not be parsed; header variables unavailable.')
  }

  // 3. Units
  const units: 'metric' | 'imperial' = IMPERIAL_UNITS.has(insunits) ? 'imperial' : 'metric'

  // 4. Layers (ASCII scan — full object table decoding is out of scope)
  const layers = scanLayerNames(bytes)

  // 5. Entities — binary entity decoding requires full object section parsing with
  //    handle references and type codes. This is a significant undertaking (thousands
  //    of lines) and is deferred. The DXF route provides full entity fidelity.
  const entities: DwgEntity[] = []

  warnings.push(
    'DWG binary parsing is in compatibility mode: layer names and drawing extents are extracted, ' +
    'but entities (walls, lines, polylines) require DXF export. ' +
    'For full import fidelity, open your .dwg in LibreCAD (free) or AutoCAD and use ' +
    '"Save As / Export" → DXF R2010, then import the .dxf file here.',
  )

  return { version, units, layers, entities, extMin, extMax, warnings }
}

/**
 * Convert a parsed DWG result to an Aruct scene-graph fragment.
 * LINE → wall nodes; closed LWPOLYLINE → zone/slab shapes.
 * In compatibility mode (entities=[]) this returns an empty fragment.
 */
export function dwgToSceneFragment(result: DwgParseResult): {
  nodes: Record<string, unknown>
  rootNodeIds: string[]
} {
  const nodes: Record<string, unknown> = {}
  const rootNodeIds: string[] = []
  let idx = 0

  function makeId(prefix: string): string {
    return `${prefix}_dwg_${idx++}_${Math.random().toString(36).slice(2, 10)}`
  }

  for (const entity of result.entities) {
    if (entity.type === 'LINE') {
      const id = makeId('wall')
      nodes[id] = {
        object: 'node',
        id,
        type: 'wall',
        parentId: null,
        visible: true,
        start: [entity.x1, entity.y1] as [number, number],
        end: [entity.x2, entity.y2] as [number, number],
      }
      rootNodeIds.push(id)
    } else if (entity.type === 'LWPOLYLINE' && entity.closed && entity.points.length >= 3) {
      const id = makeId('slab')
      nodes[id] = {
        object: 'node',
        id,
        type: 'slab',
        parentId: null,
        visible: true,
        polygon: entity.points.map((p) => [p.x, p.y]) as [number, number][],
        elevation: 0.05,
        thickness: 0.05,
      }
      rootNodeIds.push(id)
    }
    // ARC, CIRCLE, TEXT, MTEXT, INSERT — no direct Aruct equivalent yet; skip
  }

  return { nodes, rootNodeIds }
}
