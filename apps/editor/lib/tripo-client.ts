const TRIPO_API = 'https://api.tripo3d.ai/v2/openapi'

export type TripoTaskType = 'text_to_model' | 'image_to_model'

export type TripoTaskStatus = 'queued' | 'processing' | 'success' | 'failed'

export type TripoTask = {
  task_id: string
  status: TripoTaskStatus
  progress?: number
  output?: {
    model: string
    pbr_model?: string
  }
}

export async function createTripoTask(
  type: TripoTaskType,
  params: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.TRIPO_API_KEY
  if (!apiKey) throw new Error('TRIPO_API_KEY not set')

  const res = await fetch(`${TRIPO_API}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ type, ...params }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Tripo API error ${res.status}: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return data.data.task_id as string
}

export async function pollTripoTask(taskId: string): Promise<TripoTask> {
  const apiKey = process.env.TRIPO_API_KEY
  if (!apiKey) throw new Error('TRIPO_API_KEY not set')

  const res = await fetch(`${TRIPO_API}/task/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!res.ok) throw new Error(`Tripo API error ${res.status}`)
  const data = await res.json()
  return data.data as TripoTask
}

export async function waitForTripoTask(
  taskId: string,
  opts?: { intervalMs?: number; timeoutMs?: number }
): Promise<TripoTask> {
  const interval = opts?.intervalMs ?? 3000
  const timeout = opts?.timeoutMs ?? 120_000
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    const task = await pollTripoTask(taskId)
    if (task.status === 'success') return task
    if (task.status === 'failed') throw new Error(`Tripo task ${taskId} failed`)
    await new Promise((r) => setTimeout(r, interval))
  }

  throw new Error(`Tripo task ${taskId} timed out after ${timeout}ms`)
}
