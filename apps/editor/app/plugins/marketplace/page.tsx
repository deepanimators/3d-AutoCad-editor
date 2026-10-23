import { db } from '@/lib/db/client'
import { pluginRegistry } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { MarketplaceClient } from './marketplace-client'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plugin Marketplace — Aruct' }

export default async function MarketplacePage() {
  const plugins = await db
    .select()
    .from(pluginRegistry)
    .where(eq(pluginRegistry.status, 'approved'))
    .orderBy(pluginRegistry.installCount)
    .limit(200)

  return <MarketplaceClient initialPlugins={plugins} />
}
