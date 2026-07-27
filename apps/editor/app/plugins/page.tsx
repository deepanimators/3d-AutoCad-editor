import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { PLUGIN_CATALOG, getEnabledPlugins, canUsePlugin } from '@/lib/plugins/catalog'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PluginsClient } from './plugins-client'

export const dynamic = 'force-dynamic'

export default async function PluginsPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/plugins')

  const [user] = await db.select({ pluginPrefs: users.pluginPrefs }).from(users).where(eq(users.id, session.id))
  const enabled = getEnabledPlugins(user?.pluginPrefs ?? '[]')

  const plugins = PLUGIN_CATALOG.map((p) => ({
    ...p,
    isEnabled: p.builtIn || enabled.includes(p.id),
    canEnable: canUsePlugin(p, session.plan as 'free' | 'pro' | 'team'),
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-bold text-3xl text-foreground">Plugins</h1>
          <p className="mt-2 text-muted-foreground">
            Extend the editor with additional tools, catalogs, and integrations.
          </p>
        </div>
        <PluginsClient plugins={plugins} userPlan={session.plan as 'free' | 'pro' | 'team'} />
      </div>
    </div>
  )
}
