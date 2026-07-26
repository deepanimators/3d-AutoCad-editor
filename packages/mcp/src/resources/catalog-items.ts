import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SceneOperations } from '../operations'
import { fetchExternalCatalogItems, MCP_CATALOG_ITEMS } from '../tools/asset-catalog'

export type CatalogOptions = {
  /** Base URL of the host app's catalog API. GET `<catalogApiUrl>/api/items` is called to fetch additional items. */
  catalogApiUrl?: string
  /** Bearer token forwarded to the catalog API when set. */
  catalogAuthToken?: string
}

/**
 * `aruct://catalog/items` — small built-in item catalog for standalone MCP.
 *
 * The editor UI owns the full catalog. MCP intentionally keeps a dependency-free
 * subset so headless agents can still place realistic furniture and fixtures.
 *
 * When `catalogApiUrl` is provided (or `ARUCT_CATALOG_API_URL` env var is set),
 * external items fetched from `<catalogApiUrl>/api/items` are merged after the
 * built-in entries. External items that share an id with a built-in item are
 * skipped so the built-in catalog always wins on conflicts.
 */
export function registerCatalogItems(
  server: McpServer,
  _bridge: SceneOperations,
  catalog?: CatalogOptions,
): void {
  const catalogApiUrl = catalog?.catalogApiUrl ?? process.env.ARUCT_CATALOG_API_URL
  const catalogAuthToken = catalog?.catalogAuthToken

  server.registerResource(
    'catalog-items',
    'aruct://catalog/items',
    {
      title: 'Item catalog',
      description:
        'Dependency-free catalog subset of placeable items available in standalone MCP mode.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const externalItems = catalogApiUrl
        ? await fetchExternalCatalogItems(catalogApiUrl, catalogAuthToken)
        : []

      const builtInIds = new Set(MCP_CATALOG_ITEMS.map((item) => item.id))
      const merged = [
        ...MCP_CATALOG_ITEMS,
        ...externalItems.filter((item) => !builtInIds.has(item.id)),
      ]

      const payload = {
        status: 'ok' as const,
        items: merged,
        note: 'Standalone MCP catalog subset; host applications can still expose a larger catalog separately.',
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(payload),
          },
        ],
      }
    },
  )
}
