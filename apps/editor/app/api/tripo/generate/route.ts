import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { z } from 'zod'
import { createTripoTask, waitForTripoTask } from '@/lib/tripo-client'

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

  if (!task.output?.model) {
    return NextResponse.json({ error: 'No model output' }, { status: 500 })
  }

  return NextResponse.json({
    taskId: task.task_id,
    glbUrl: task.output.model,
    pbrGlbUrl: task.output.pbr_model,
  })
}
