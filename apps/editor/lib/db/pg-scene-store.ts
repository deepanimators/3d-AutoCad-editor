import { createHash } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type {
  SceneListOptions,
  SceneMeta,
  SceneMutateOptions,
  SceneSaveOptions,
  SceneStore,
  SceneWithGraph,
} from '@aruct/mcp/storage'
import {
  SceneNotFoundError,
  SceneVersionConflictError,
  generateSlug,
  isValidSlug,
  sanitizeSlug,
} from '@aruct/mcp/storage'
import { db } from './client'
import { scenes, type SceneRow } from './schema'

const DEFAULT_MAX_SCENE_BYTES = 10 * 1024 * 1024

function hashGraphJson(json: string): string {
  return createHash('sha256').update(json).digest('hex')
}

function editorUrl(id: string): string {
  return `/editor/${id}`
}

function rowToMeta(row: SceneRow): SceneMeta {
  const url = editorUrl(row.id)
  return {
    id: row.id,
    name: row.name,
    projectId: row.projectId ?? null,
    ownerId: row.ownerId ?? null,
    thumbnailUrl: row.thumbnailUrl ?? null,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    sizeBytes: row.sizeBytes,
    nodeCount: row.nodeCount,
    graphHash: row.graphHash ?? undefined,
    editorUrl: url,
    url,
    published: true,
  }
}

function resolveId(opts: SceneSaveOptions): string {
  if (opts.id) {
    if (isValidSlug(opts.id)) return opts.id
    return sanitizeSlug(opts.id)
  }
  return generateSlug()
}

export class PgSceneStore implements SceneStore {
  readonly backend = 'supabase' as const

  async save(opts: SceneSaveOptions): Promise<SceneMeta> {
    const graphJson = JSON.stringify(opts.graph)
    const sizeBytes = Buffer.byteLength(graphJson, 'utf8')

    if (sizeBytes > DEFAULT_MAX_SCENE_BYTES) {
      const { SceneTooLargeError } = await import('@aruct/mcp/storage')
      throw new SceneTooLargeError(`Scene too large: ${sizeBytes} bytes`)
    }

    const graphHash = hashGraphJson(graphJson)
    const nodeCount = Object.keys((opts.graph as { nodes?: Record<string, unknown> }).nodes ?? {}).length

    const id = resolveId(opts)

    // Check for existing scene to handle versioning
    const [existing] = await db
      .select({ version: scenes.version })
      .from(scenes)
      .where(eq(scenes.id, id))

    if (existing) {
      if (opts.expectedVersion !== undefined && existing.version !== opts.expectedVersion) {
        throw new SceneVersionConflictError()
      }
      const newVersion = existing.version + 1
      const now = new Date().toISOString()
      await db
        .update(scenes)
        .set({
          name: opts.name,
          projectId: opts.projectId ?? null,
          ownerId: opts.ownerId ?? null,
          graphJson,
          thumbnailUrl: opts.thumbnailUrl ?? null,
          version: newVersion,
          sizeBytes,
          nodeCount,
          graphHash,
          updatedAt: now,
        })
        .where(eq(scenes.id, id))

      const [updated] = await db.select().from(scenes).where(eq(scenes.id, id))
      return rowToMeta(updated!)
    }

    // Insert new scene
    const now = new Date().toISOString()
    await db.insert(scenes).values({
      id,
      name: opts.name,
      projectId: opts.projectId ?? null,
      ownerId: opts.ownerId ?? null,
      graphJson,
      thumbnailUrl: opts.thumbnailUrl ?? null,
      version: 1,
      sizeBytes,
      nodeCount,
      graphHash,
      createdAt: now,
      updatedAt: now,
    })

    const [inserted] = await db.select().from(scenes).where(eq(scenes.id, id))
    return rowToMeta(inserted!)
  }

  async load(id: string): Promise<SceneWithGraph | null> {
    const [row] = await db.select().from(scenes).where(eq(scenes.id, id))
    if (!row) return null

    let graph: unknown
    try {
      graph = JSON.parse(row.graphJson)
    } catch {
      const { SceneInvalidError } = await import('@aruct/mcp/storage')
      throw new SceneInvalidError(`Scene ${id} has invalid graph JSON`)
    }

    return {
      ...rowToMeta(row),
      graph: graph as SceneWithGraph['graph'],
    }
  }

  async list(opts?: SceneListOptions): Promise<SceneMeta[]> {
    const conditions = []
    if (opts?.projectId) conditions.push(eq(scenes.projectId, opts.projectId))
    if (opts?.ownerId) conditions.push(eq(scenes.ownerId, opts.ownerId))

    const rows = await db
      .select({
        id: scenes.id,
        name: scenes.name,
        projectId: scenes.projectId,
        ownerId: scenes.ownerId,
        thumbnailUrl: scenes.thumbnailUrl,
        version: scenes.version,
        sizeBytes: scenes.sizeBytes,
        nodeCount: scenes.nodeCount,
        graphHash: scenes.graphHash,
        graphJson: scenes.graphJson,
        isPublic: scenes.isPublic,
        createdAt: scenes.createdAt,
        updatedAt: scenes.updatedAt,
      })
      .from(scenes)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(scenes.updatedAt))
      .limit(opts?.limit ?? 100)

    return rows.map(rowToMeta)
  }

  async delete(id: string, opts?: SceneMutateOptions): Promise<boolean> {
    if (opts?.expectedVersion !== undefined) {
      const [row] = await db
        .select({ version: scenes.version })
        .from(scenes)
        .where(eq(scenes.id, id))
      if (!row) return false
      if (row.version !== opts.expectedVersion) {
        throw new SceneVersionConflictError()
      }
    }

    const result = await db.delete(scenes).where(eq(scenes.id, id)).returning({ id: scenes.id })
    return result.length > 0
  }

  async rename(id: string, newName: string, opts?: SceneMutateOptions): Promise<SceneMeta> {
    const [row] = await db.select().from(scenes).where(eq(scenes.id, id))
    if (!row) throw new SceneNotFoundError()

    if (opts?.expectedVersion !== undefined && row.version !== opts.expectedVersion) {
      throw new SceneVersionConflictError()
    }

    const newVersion = row.version + 1
    await db
      .update(scenes)
      .set({ name: newName, version: newVersion, updatedAt: new Date().toISOString() })
      .where(eq(scenes.id, id))

    const [updated] = await db.select().from(scenes).where(eq(scenes.id, id))
    return rowToMeta(updated!)
  }
}
