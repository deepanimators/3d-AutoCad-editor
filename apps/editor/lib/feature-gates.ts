import type { AppUser } from './auth-server'

type Plan = 'free' | 'pro' | 'team'

const PLAN_ORDER: Plan[] = ['free', 'pro', 'team']

function planAtLeast(user: AppUser, required: Plan): boolean {
  return PLAN_ORDER.indexOf(user.plan) >= PLAN_ORDER.indexOf(required)
}

export function isAdmin(user: AppUser): boolean {
  return user.role === 'admin'
}

export function isPlanActive(user: AppUser): boolean {
  if (!user.subscriptionStatus) return user.plan === 'free'
  return ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus)
}

export function canCreateScene(user: AppUser, currentCount: number): boolean {
  if (isAdmin(user)) return true
  if (planAtLeast(user, 'pro') && isPlanActive(user)) return true
  return currentCount < 5
}

export function canExportGLB(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function canExportIFC(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'team') && isPlanActive(user))
}

export function canShareScene(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function canUseMCP(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function canCollaborateRealtime(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'team') && isPlanActive(user))
}

export function getSceneLimit(user: AppUser): number | null {
  if (isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))) return null
  return 5
}

export function canUseAIGeneration(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function getAIGenerationLimit(user: AppUser): number | null {
  if (isAdmin(user)) return null
  if (planAtLeast(user, 'team') && isPlanActive(user)) return null
  if (planAtLeast(user, 'pro') && isPlanActive(user)) return 20
  return 0
}

export function canUseVision(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function getVisionLimit(user: AppUser): number | null {
  if (isAdmin(user)) return null
  if (planAtLeast(user, 'team') && isPlanActive(user)) return null
  if (planAtLeast(user, 'pro') && isPlanActive(user)) return 5
  return 0
}

export function canUploadCustomItems(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}

export function canAccessTeamCatalog(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'team') && isPlanActive(user))
}

export function canImportDwg(user: AppUser): boolean {
  return isAdmin(user) || (planAtLeast(user, 'pro') && isPlanActive(user))
}
