import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { z } from 'zod'
import { createTripoTask, waitForTripoTask } from '@/lib/tripo-client'
import { db } from '@/lib/db/client'
import { globalModels, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getEnabledPlugins } from '@/lib/plugins/catalog'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const schema = z.object({
  prompt: z.string().min(1).max(500),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plugin is enabled for this user
  const [userRow] = await db.select({ pluginPrefs: users.pluginPrefs }).from(users).where(eq(users.id, session.id))
  const enabledPlugins = getEnabledPlugins(userRow?.pluginPrefs ?? '[]')
  if (!enabledPlugins.includes('aruct:plugin-ai-gen')) {
    return NextResponse.json({ error: 'AI Generation plugin not enabled' }, { status: 403 })
  }

  if (!process.env.TRIPO_API_KEY) {
    return NextResponse.json({ error: 'AI generation not configured' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { prompt } = parsed.data

  // model_version is required by Tripo API; format: v{major}.{minor}-{YYYYMMDD}
  const modelVersion = process.env.TRIPO_MODEL_VERSION ?? 'v2.5-20250123'

  let taskId: string
  try {
    taskId = await createTripoTask('text_to_model', { prompt, model_version: modelVersion })
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err)
    console.error('[tripo/generate] createTripoTask failed:', msg)
    return NextResponse.json({ error: `Failed to start generation: ${msg}` }, { status: 502 })
  }

  let task
  try {
    task = await waitForTripoTask(taskId)
  } catch (err) {
    console.error('[tripo/generate] waitForTripoTask failed:', err)
    return NextResponse.json({ error: 'Generation failed or timed out', taskId }, { status: 502 })
  }

  const modelUrl = task.output?.model
  if (!modelUrl) {
    return NextResponse.json({ error: 'No model output from generation' }, { status: 500 })
  }

  void (async () => {
    try {
      await db.insert(globalModels).values({
        id: crypto.randomUUID(),
        slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + task.task_id.slice(-6),
        name: prompt.slice(0, 100),
        description: `AI-generated from prompt: "${prompt}"`,
        source: 'mine',
        sourceId: task.task_id,
        sourceUrl: modelUrl,
        license: 'CC0',
        attribution: null,
        s3Key: modelUrl,
        s3Thumbnail: null,
        tags: JSON.stringify(['ai-generated', 'tripo3d']),
        category: null,
        addedBy: session.id,
      })
    } catch {}
  })()

  return NextResponse.json({
    taskId: task.task_id,
    glbUrl: modelUrl,
    pbrGlbUrl: task.output?.pbr_model,
  })
}
