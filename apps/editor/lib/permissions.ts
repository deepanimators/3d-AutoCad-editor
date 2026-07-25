import { db } from './db/client'
import { scenes, sceneCollaborators } from './db/schema'
import { eq, and } from 'drizzle-orm'

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
