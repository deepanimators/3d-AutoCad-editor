import { boolean, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core'

export const scenes = pgTable('scenes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  projectId: text('project_id'),
  ownerId: text('owner_id'),
  graphJson: text('graph_json').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  version: integer('version').notNull().default(1),
  sizeBytes: integer('size_bytes').notNull().default(0),
  nodeCount: integer('node_count').notNull().default(0),
  graphHash: text('graph_hash'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export type SceneRow = typeof scenes.$inferSelect
export type NewSceneRow = typeof scenes.$inferInsert
