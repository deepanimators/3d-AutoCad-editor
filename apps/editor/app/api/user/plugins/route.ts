import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { PLUGIN_CATALOG, getEnabledPlugins } from '@/lib/plugins/catalog'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [user] = await db.select({ pluginPrefs: users.pluginPrefs }).from(users).where(eq(users.id, session.id))
  const enabled = getEnabledPlugins(user?.pluginPrefs ?? '[]')

  return NextResponse.json({ enabled })
}

const schema = z.object({
  pluginId: z.string().min(1),
  enabled: z.boolean(),
})

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { pluginId, enabled } = parsed.data

  const plugin = PLUGIN_CATALOG.find((p) => p.id === pluginId)
  if (!plugin) return NextResponse.json({ error: 'plugin_not_found' }, { status: 404 })
  if (plugin.builtIn) return NextResponse.json({ error: 'cannot_toggle_builtin' }, { status: 400 })

  const planRank: Record<string, number> = { free: 0, pro: 1, team: 2 }
  if ((planRank[plugin.requiredPlan] ?? 0) > (planRank[session.plan] ?? 0)) {
    return NextResponse.json({ error: 'plan_upgrade_required', requiredPlan: plugin.requiredPlan }, { status: 403 })
  }

  const [user] = await db.select({ pluginPrefs: users.pluginPrefs }).from(users).where(eq(users.id, session.id))
  const current = getEnabledPlugins(user?.pluginPrefs ?? '[]')

  const next = enabled
    ? Array.from(new Set([...current, pluginId]))
    : current.filter((id) => id !== pluginId)

  await db.update(users).set({ pluginPrefs: JSON.stringify(next) }).where(eq(users.id, session.id))

  return NextResponse.json({ enabled: next })
}
