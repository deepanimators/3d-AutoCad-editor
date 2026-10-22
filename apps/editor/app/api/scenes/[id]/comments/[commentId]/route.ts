import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { scenes, sceneComments } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string; commentId: string }> }

const patchCommentSchema = z.object({
  text: z.string().min(1).max(5000).optional(),
  resolved: z.boolean().optional(),
}).refine(
  (d) => d.text !== undefined || d.resolved !== undefined,
  { message: 'At least one field must be provided' },
)

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id, commentId } = await params

  const [comment] = await db
    .select()
    .from(sceneComments)
    .where(and(eq(sceneComments.id, commentId), eq(sceneComments.sceneId, id)))

  if (!comment) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Only the comment author may update it
  if (comment.userId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = patchCommentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })

  const patch: { text?: string; resolved?: boolean; updatedAt: string } = {
    updatedAt: new Date().toISOString(),
  }
  if (parsed.data.text !== undefined) patch.text = parsed.data.text
  if (parsed.data.resolved !== undefined) patch.resolved = parsed.data.resolved

  const [updated] = await db
    .update(sceneComments)
    .set(patch)
    .where(eq(sceneComments.id, commentId))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id, commentId } = await params

  const [comment] = await db
    .select({ userId: sceneComments.userId })
    .from(sceneComments)
    .where(and(eq(sceneComments.id, commentId), eq(sceneComments.sceneId, id)))

  if (!comment) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Comment owner or scene owner may delete
  const isCommentOwner = comment.userId === session.id
  const isSceneOwner = await (async () => {
    if (session.role === 'admin') return true
    const [scene] = await db.select({ ownerId: scenes.ownerId }).from(scenes).where(eq(scenes.id, id))
    return scene?.ownerId === session.id
  })()

  if (!isCommentOwner && !isSceneOwner) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await db.delete(sceneComments).where(eq(sceneComments.id, commentId))
  return new NextResponse(null, { status: 204 })
}
