import { db } from './db/client'
import { scenes, sceneCollaborators } from './db/schema'
import { eq, and } from 'drizzle-orm'

const ALL_PERMISSIONS = [
  'view_all_users',
  'change_user_plan',
  'change_user_role',
  'view_audit_log',
  'impersonate_user',
  'manage_coupons',
  'manage_plan_config',
  'manage_roles',
  'access_admin',
] as const

export type Permission = typeof ALL_PERMISSIONS[number]
export { ALL_PERMISSIONS }

export function hasPermission(rolePermissions: string[], permission: Permission): boolean {
  if (rolePermissions.includes('all')) return true
  return rolePermissions.includes(permission)
}

export function isAdmin(role: string): boolean {
  return role === 'admin'
}

export type SceneRole = 'owner' | 'editor' | 'viewer' | null

export async function getSceneRole(userId: string, sceneId: string): Promise<SceneRole> {
  const [scene] = await db.select({ ownerId: scenes.ownerId }).from(scenes).where(eq(scenes.id, sceneId))
  if (!scene) return null
  if (scene.ownerId === userId) return 'owner'

  const [collab] = await db
    .select({ role: sceneCollaborators.role })
    .from(sceneCollaborators)
    .where(and(eq(sceneCollaborators.sceneId, sceneId), eq(sceneCollaborators.userId, userId)))

  return (collab?.role as 'editor' | 'viewer') ?? null
}

export function canRead(role: SceneRole): boolean {
  return role !== null
}

export function canWrite(role: SceneRole): boolean {
  return role === 'owner' || role === 'editor'
}

export function canDelete(role: SceneRole): boolean {
  return role === 'owner'
}

export function canShare(role: SceneRole): boolean {
  return role === 'owner'
}
