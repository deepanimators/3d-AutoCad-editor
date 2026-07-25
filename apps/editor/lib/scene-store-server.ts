import type { SceneOperations } from '@aruct/mcp/operations'
import type { SceneStore } from '@aruct/mcp/storage'

/**
 * Per-process singleton. The factory is async because backend modules are
 * dynamically imported — we cache the in-flight promise so concurrent calls
 * during a cold start share a single instantiation.
 *
 * When DATABASE_URL is set the Neon Postgres store is used; otherwise falls
 * back to the local SQLite store from @aruct/mcp.
 */
let cachedStore: Promise<SceneStore> | null = null
let cachedOperations: Promise<SceneOperations> | null = null

export function getSceneStore(): Promise<SceneStore> {
  if (!cachedStore) {
    cachedStore = (async (): Promise<SceneStore> => {
      if (process.env.DATABASE_URL) {
        const { PgSceneStore } = await import('./db/pg-scene-store')
        return new PgSceneStore()
      }
      const mod = (await import('@aruct/mcp/storage')) as {
        createSceneStore: (env?: NodeJS.ProcessEnv) => Promise<SceneStore>
      }
      return mod.createSceneStore(process.env)
    })()
  }
  return cachedStore
}

export function getSceneOperations(): Promise<SceneOperations> {
  if (!cachedOperations) {
    cachedOperations = (async () => {
      const store = await getSceneStore()
      const mod = (await import('@aruct/mcp/operations')) as {
        createSceneOperations: (options: { store: SceneStore }) => SceneOperations
      }
      return mod.createSceneOperations({ store })
    })()
  }
  return cachedOperations
}

/**
 * Test-only helper to reset the cached singleton. Not exported for production
 * callers.
 */
export function __resetSceneStoreForTests(): void {
  cachedStore = null
  cachedOperations = null
}
