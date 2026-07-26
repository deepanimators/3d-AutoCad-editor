import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SceneOperations } from '../operations'
import { registerAgentGuide } from './agent-guide'
import { type CatalogOptions, registerCatalogItems } from './catalog-items'
import { registerConstraints } from './constraints'
import { registerSceneCurrent } from './scene-current'
import { registerSceneSummary } from './scene-summary'

export type { CatalogOptions }

/**
 * Registers all MCP resources exposed by `@aruct/mcp`.
 *
 * Resources:
 * - `aruct://scene/current`          — application/json, full snapshot
 * - `aruct://scene/current/summary`  — text/markdown, human summary
 * - `aruct://catalog/items`          — application/json, host-supplied catalog
 * - `aruct://constraints/{levelId}`  — application/json, per-level constraints
 * - `aruct://agent-guide`            — text/markdown, MCP-first agent guide
 * - `aruct://agent/guide`            — text/markdown, legacy alias
 */
export function registerResources(
  server: McpServer,
  operations: SceneOperations,
  catalog?: CatalogOptions,
): void {
  registerAgentGuide(server, operations)
  registerSceneCurrent(server, operations)
  registerSceneSummary(server, operations)
  registerCatalogItems(server, operations, catalog)
  registerConstraints(server, operations)
}
