import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { z } from 'zod'
import { createTripoTask, waitForTripoTask } from '@/lib/tripo-client'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const schema = z.object({
  prompt: z.string().min(1).max(500),
  modelVersion: z.string().default('v2.5'),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { prompt, modelVersion } = parsed.data

  const taskId = await createTripoTask('text_to_model', {
    prompt,
    model_version: modelVersion,
  })

  const task = await waitForTripoTask(taskId)

  const modelUrl = task.output?.model
  if (!modelUrl) {
    return NextResponse.json({ error: 'No model output' }, { status: 500 })
  }

  void (async () => {
    try {
      await db.insert(globalModels).values({
        id: crypto.randomUUID(),
        slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + task.task_id.slice(-6),
        name: prompt.slice(0, 100),
        description: `AI-generated from prompt: "${prompt}"`,
        source: 'tripo3d',
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
