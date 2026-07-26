import { boolean, integer, text, timestamp, pgTable, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),                         // Firebase UID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  image: text('image'),
  plan: text('plan', { enum: ['free', 'pro', 'team'] }).notNull().default('free'),
  role: text('role').notNull().default('user'),        // 'user' | 'admin' | custom roles
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  razorpayCustomerId: text('razorpay_customer_id'),
  razorpaySubscriptionId: text('razorpay_subscription_id'),
  paymentGateway: text('payment_gateway', { enum: ['stripe', 'razorpay'] }),
  subscriptionStatus: text('subscription_status'),
  planExpiresAt: timestamp('plan_expires_at', { mode: 'string' }),
  aiGenerationsThisMonth: integer('ai_generations_this_month').notNull().default(0),
  aiGenerationsResetAt: timestamp('ai_generations_reset_at', { mode: 'string' }),
  visionCallsThisMonth: integer('vision_calls_this_month').notNull().default(0),
  visionCallsResetAt: timestamp('vision_calls_reset_at', { mode: 'string' }),
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
  orgId: text('org_id'),
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

// Phase 4A: Team workspaces
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  ownerId: text('owner_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export type OrgRow = typeof organizations.$inferSelect
export type NewOrgRow = typeof organizations.$inferInsert

export const orgMembers = pgTable('org_members', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'member'] }).notNull().default('member'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (t) => [unique().on(t.orgId, t.userId)])

export type OrgMemberRow = typeof orgMembers.$inferSelect
export type NewOrgMemberRow = typeof orgMembers.$inferInsert

export const orgInvitations = pgTable('org_invitations', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  token: text('token').notNull().unique(),
  status: text('status', { enum: ['pending', 'accepted', 'expired'] }).notNull().default('pending'),
  invitedBy: text('invited_by').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export type OrgInvitationRow = typeof orgInvitations.$inferSelect
export type NewOrgInvitationRow = typeof orgInvitations.$inferInsert

// Sprint 1: Coupons & promo codes
export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  gateway: text('gateway', { enum: ['stripe', 'razorpay', 'both'] }).notNull(),
  stripePromoCodeId: text('stripe_promo_code_id'),
  stripeCouponId: text('stripe_coupon_id'),
  razorpayOfferId: text('razorpay_offer_id'),
  discountType: text('discount_type', { enum: ['percent', 'fixed'] }).notNull(),
  discountValue: integer('discount_value').notNull(),
  duration: text('duration', { enum: ['once', 'repeating', 'forever'] }).notNull(),
  durationInMonths: integer('duration_in_months'),
  appliesToPlans: text('applies_to_plans').notNull(),   // JSON: ['pro-monthly','team-monthly']
  originalPriceCents: integer('original_price_cents'),
  promoPriceCents: integer('promo_price_cents'),
  maxRedemptions: integer('max_redemptions'),
  redemptionCount: integer('redemption_count').notNull().default(0),
  active: boolean('active').notNull().default(true),
  expiresAt: timestamp('expires_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export type CouponRow = typeof coupons.$inferSelect
export type NewCouponRow = typeof coupons.$inferInsert

// Sprint 2: Plan display config (editable by admin without changing Stripe prices)
export const planConfig = pgTable('plan_config', {
  id: text('id').primaryKey(),
  planKey: text('plan_key', { enum: ['free', 'pro', 'team'] }).notNull().unique(),
  displayName: text('display_name').notNull(),
  displayPriceCents: integer('display_price_cents').notNull(),
  currency: text('currency').notNull().default('usd'),
  priceSuffix: text('price_suffix').notNull().default('/month'),
  stripePriceId: text('stripe_price_id'),
  stripeYearlyPriceId: text('stripe_yearly_price_id'),
  razorpayPlanId: text('razorpay_plan_id'),
  razorpayYearlyPlanId: text('razorpay_yearly_plan_id'),
  features: text('features').notNull(),                 // JSON array of feature strings
  highlight: boolean('highlight').notNull().default(false),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export type PlanConfigRow = typeof planConfig.$inferSelect
export type NewPlanConfigRow = typeof planConfig.$inferInsert

// Sprint 3: Custom roles with granular permissions
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  permissions: text('permissions').notNull(),           // JSON: ['view_all_users','manage_coupons']
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export type RoleRow = typeof roles.$inferSelect
export type NewRoleRow = typeof roles.$inferInsert

// Custom team asset catalog — GLB objects shared within a workspace
export const customItems = pgTable('custom_items', {
  id: text('id').primaryKey(),
  orgId: text('org_id'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  glbUrl: text('glb_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  tags: text('tags').notNull().default('[]'),
  category: text('category', { enum: ['furniture', 'kitchen', 'bathroom', 'structure', 'other'] }).notNull().default('other'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export type CustomItemRow = typeof customItems.$inferSelect
export type NewCustomItemRow = typeof customItems.$inferInsert
