import { boolean, integer, text, timestamp, pgTable, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),                         // Firebase UID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  image: text('image'),
  plan: text('plan', { enum: ['free', 'pro', 'team'] }).notNull().default('free'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  planExpiresAt: timestamp('plan_expires_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert

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
  showScansPublic: boolean('show_scans_public').notNull().default(true),
  showGuidesPublic: boolean('show_guides_public').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export type SceneRow = typeof scenes.$inferSelect
export type NewSceneRow = typeof scenes.$inferInsert

// Phase 2: Scene collaborators (inviting others to view/edit a scene)
export const sceneCollaborators = pgTable('scene_collaborators', {
  id: text('id').primaryKey(),
  sceneId: text('scene_id').notNull(),
  userId: text('user_id'),
  email: text('email'),
  role: text('role', { enum: ['editor', 'viewer'] }).notNull(),
  invitedAt: timestamp('invited_at', { mode: 'string' }).notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at', { mode: 'string' }),
}, (t) => [unique().on(t.sceneId, t.userId)])

export type SceneCollaboratorRow = typeof sceneCollaborators.$inferSelect

// Phase 4: Audit log
export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  orgId: text('org_id'),
  userId: text('user_id'),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export type AuditLogRow = typeof auditLog.$inferSelect
