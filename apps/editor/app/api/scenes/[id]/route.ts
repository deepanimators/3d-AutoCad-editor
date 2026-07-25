import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { apiGraphSchema } from '@/lib/graph-schema'
import {
  guardSceneApiRequest,
  sceneApiJson,
  sceneApiPreflight,
  withSceneApiHeaders,
} from '@/lib/scene-api-security'
import { getSceneOperations } from '@/lib/scene-store-server'
import { getSession } from '@/lib/auth-server'
import { getSceneRole, canWrite, canDelete } from '@/lib/permissions'
import { logAction } from '@/lib/audit'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

const putSceneSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  graph: apiGraphSchema,
  thumbnailUrl: z.string().url().nullable().optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
})

const patchSceneSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  isPublic: z.boolean().optional(),
  showScansPublic: z.boolean().optional(),
  showGuidesPublic: z.boolean().optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
}).refine(
  (d) => d.name !== undefined || d.isPublic !== undefined || d.showScansPublic !== undefined || d.showGuidesPublic !== undefined,
  { message: 'At least one field must be provided' },
)

export function OPTIONS(request: NextRequest) {
  return sceneApiPreflight(request)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const { id } = await params
  const operations = await getSceneOperations()
  try {
    const scene = await operations.loadStoredScene(id)
    if (!scene) {
      return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
    }
    return sceneApiJson(request, scene, {
      headers: { ETag: `"${scene.version}"` },
    })
  } catch (error) {
    return handleStoreError(request, error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request, { skipAuth: true })
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canWrite(role)) return sceneApiJson(request, { error: 'forbidden' }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: 'body must be valid JSON' },
      { status: 400 },
    )
  }

  const parsed = putSceneSchema.safeParse(body)
  if (!parsed.success) {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const ifMatch = parseIfMatch(request.headers.get('If-Match'))
  const expectedVersion = ifMatch ?? parsed.data.expectedVersion

  const operations = await getSceneOperations()
  try {
    const existing = await operations.loadStoredScene(id)
    if (!existing) {
      return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
    }
    const meta = await operations.saveScene({
      id,
      name: parsed.data.name ?? existing.name,
      projectId: existing.projectId,
      ownerId: existing.ownerId,
      graph: parsed.data.graph as never,
      thumbnailUrl:
        parsed.data.thumbnailUrl === undefined ? existing.thumbnailUrl : parsed.data.thumbnailUrl,
      expectedVersion: expectedVersion ?? existing.version,
    })
    await logAction({ userId: session.id, action: 'scene.update', resourceType: 'scene', resourceId: id, request })
    return sceneApiJson(request, meta, {
      headers: { ETag: `"${meta.version}"` },
    })
  } catch (error) {
    return handleStoreError(request, error, { includeCurrentVersionFor: id })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request, { skipAuth: true })
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canDelete(role)) return sceneApiJson(request, { error: 'forbidden' }, { status: 403 })

  const ifMatch = parseIfMatch(request.headers.get('If-Match'))

  const operations = await getSceneOperations()
  try {
    const removed = await operations.deleteStoredScene(id, { expectedVersion: ifMatch })
    if (!removed) {
      return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
    }
    await logAction({ userId: session.id, action: 'scene.delete', resourceType: 'scene', resourceId: id, request })
    return withSceneApiHeaders(request, new NextResponse(null, { status: 204 }))
  } catch (error) {
    return handleStoreError(request, error, { includeCurrentVersionFor: id })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request, { skipAuth: true })
  if (guard) return guard

  const session = await getSession()
  if (!session) return sceneApiJson(request, { error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canWrite(role)) return sceneApiJson(request, { error: 'forbidden' }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: 'body must be valid JSON' },
      { status: 400 },
    )
  }

  const parsed = patchSceneSchema.safeParse(body)
  if (!parsed.success) {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const ifMatch = parseIfMatch(request.headers.get('If-Match'))
  const expectedVersion = ifMatch ?? parsed.data.expectedVersion

  const operations = await getSceneOperations()
  try {
    // Handle visibility-only updates directly via DB (store interface only has rename)
    const { name, isPublic, showScansPublic, showGuidesPublic } = parsed.data
    if (isPublic !== undefined || showScansPublic !== undefined || showGuidesPublic !== undefined) {
      const visibilityPatch: Record<string, boolean> = {}
      if (isPublic !== undefined) visibilityPatch.isPublic = isPublic
      if (showScansPublic !== undefined) visibilityPatch.showScansPublic = showScansPublic
      if (showGuidesPublic !== undefined) visibilityPatch.showGuidesPublic = showGuidesPublic
      await db.update(scenes).set(visibilityPatch).where(eq(scenes.id, id))
      if (!name) {
        const [updated] = await db.select().from(scenes).where(eq(scenes.id, id))
        if (!updated) return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
        return sceneApiJson(request, { id: updated.id, isPublic: updated.isPublic, showScansPublic: updated.showScansPublic, showGuidesPublic: updated.showGuidesPublic })
      }
    }
    if (name) {
      const meta = await operations.renameStoredScene(id, name, { expectedVersion })
      return sceneApiJson(request, meta, {
        headers: { ETag: `"${meta.version}"` },
      })
    }
    return sceneApiJson(request, { ok: true })
  } catch (error) {
    return handleStoreError(request, error, { includeCurrentVersionFor: id })
  }
}

/**
 * Parses an `If-Match` header value per RFC 7232. Accepts `"<version>"` or
 * weak `W/"<version>"` forms. Returns `undefined` when the header is absent,
 * the wildcard `*`, or unparseable as a non-negative integer.
 */
function parseIfMatch(raw: string | null): number | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (trimmed === '*') return undefined
  const match = trimmed.match(/^(?:W\/)?"([^"]+)"$/)
  const inner = match ? match[1] : trimmed
  if (!inner) return undefined
  const n = Number(inner)
  if (!(Number.isFinite(n) && Number.isInteger(n)) || n < 0) return undefined
  return n
}

async function handleStoreError(
  request: NextRequest,
  error: unknown,
  opts: { includeCurrentVersionFor?: string } = {},
): Promise<NextResponse> {
  const code = (error as { code?: string })?.code
  if (code === 'version_conflict') {
    let currentVersion: number | undefined
    if (opts.includeCurrentVersionFor) {
      try {
        const operations = await getSceneOperations()
        const current = await operations.loadStoredScene(opts.includeCurrentVersionFor)
        currentVersion = current?.version
      } catch {
        // Best-effort; skip reporting currentVersion on secondary failure.
      }
    }
    return sceneApiJson(
      request,
      currentVersion === undefined
        ? { error: 'version_conflict' }
        : { error: 'version_conflict', currentVersion },
      { status: 409 },
    )
  }
  if (code === 'not_found') {
    return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
  }
  if (code === 'too_large') {
    return sceneApiJson(request, { error: 'too_large' }, { status: 413 })
  }
  if (code === 'invalid') {
    return sceneApiJson(request, { error: 'invalid' }, { status: 400 })
  }
  const message = error instanceof Error ? error.message : 'unexpected_error'
  return sceneApiJson(request, { error: 'internal_error', message }, { status: 500 })
}
