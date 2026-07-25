import { randomUUID } from 'node:crypto'
import { db } from './db/client'
import { auditLog } from './db/schema'

export async function logAction(params: {
  userId: string
  orgId?: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: unknown
  request?: Request
}) {
  await db.insert(auditLog).values({
    id: randomUUID(),
    userId: params.userId,
    orgId: params.orgId ?? null,
    action: params.action,
    resourceType: params.resourceType ?? null,
    resourceId: params.resourceId ?? null,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    ipAddress: params.request?.headers.get('x-forwarded-for') ?? null,
  })
}
