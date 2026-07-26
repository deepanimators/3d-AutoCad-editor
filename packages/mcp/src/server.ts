import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SceneBridge } from './bridge/scene-bridge'
import { createSceneOperations, type SceneOperations } from './operations'
import { registerPrompts } from './prompts'
import { registerResources } from './resources'
import type { SceneStore } from './storage/types'
import { registerTools } from './tools'
import { registerVisionTools } from './tools/vision'

export type CreateAructMcpServerOptions = {
  bridge: SceneBridge
  operations?: SceneOperations
  /** Required for persistence tools. Hosted apps and CLIs inject their own store. */
  store?: SceneStore
  name?: string
  version?: string
  /** Base URL of the host app's catalog API (e.g. "https://app.example.com").
   * The server will GET `<catalogApiUrl>/api/items` and merge the results with
   * the built-in MCP catalog. Falls back to `process.env.ARUCT_CATALOG_API_URL`. */
  catalogApiUrl?: string
  /** Bearer token forwarded to the catalog API when set. */
  catalogAuthToken?: string
}

export function createAructMcpServer(opts: CreateAructMcpServerOptions): McpServer {
  const server = new McpServer({
    name: opts.name ?? 'aruct-mcp',
    version: opts.version ?? '0.1.0',
  })
  const operations =
    opts.operations ?? createSceneOperations({ bridge: opts.bridge, store: opts.store })
  registerTools(server, operations)
  registerVisionTools(server, operations)
  registerResources(server, operations, {
    catalogApiUrl: opts.catalogApiUrl,
    catalogAuthToken: opts.catalogAuthToken,
  })
  registerPrompts(server, operations)
  return server
}
