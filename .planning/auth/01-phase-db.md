# Phase 0: Database Migration — SQLite → Neon Postgres

## Goal

Replace the per-process SQLite store with a cloud Postgres database (Neon) that:
1. Works in Vercel serverless (connection pooling via Neon's serverless driver)
2. Has a `users` table (auth foundation for Phase 1)
3. Adds `owner_id` to scenes (RBAC foundation for Phase 2)
4. Preserves existing scene API surface (`GET/POST/PUT/PATCH/DELETE /api/scenes`)

## Why Now (Before Auth)

Auth requires a user table. The user table must be in the same DB as scenes (for foreign keys). 
Do this migration first so Phase 1 can simply add tables to an already-running Postgres setup.

---

## Dependencies to Install

```bash
# In apps/editor (or root for monorepo-wide use)
bun add drizzle-orm @neondatabase/serverless
bun add -D drizzle-kit
```

---

## New Environment Variables

```bash
# .env.local (Vercel: add to project env vars)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Keep for local dev fallback (optional)
PASCAL_DB_PATH="~/.pascal/data/pascal.db"
```

---

## Drizzle Schema

Create `apps/editor/lib/db/schema.ts`:

```typescript
import { pgTable, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'

// ── Scenes ───────────────────────────────────────────────────────────────────
export const scenes = pgTable('scenes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  projectId: text('project_id'),
  graph: text('graph').notNull(),           // JSON blob (same as current SQLite)
  thumbnailUrl: text('thumbnail_url'),
  version: integer('version').notNull().default(1),
  ownerId: text('owner_id'),               // null = legacy/anonymous; FK added in Phase 1
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Scene = typeof scenes.$inferSelect
export type NewScene = typeof scenes.$inferInsert
```

> `users` table is intentionally absent here — Better Auth creates it in Phase 1.
> `ownerId` is nullable so migrated scenes don't break before auth is live.

---

## Drizzle Config

Create `apps/editor/drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

---

## DB Client

Create `apps/editor/lib/db/client.ts`:

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

---

## New SceneStore Implementation

Create `apps/editor/lib/db/scene-store-pg.ts` — replaces `packages/mcp` SQLite store for the app:

```typescript
import { eq, desc, and } from 'drizzle-orm'
import { db } from './client'
import { scenes } from './schema'
import { generateSceneId } from '@pascal-app/mcp/storage'  // reuse slug generator

export async function listScenes(opts: { projectId?: string; ownerId?: string; limit?: number }) {
  const conditions = []
  if (opts.projectId) conditions.push(eq(scenes.projectId, opts.projectId))
  if (opts.ownerId) conditions.push(eq(scenes.ownerId, opts.ownerId))

  return db
    .select({
      id: scenes.id,
      name: scenes.name,
      projectId: scenes.projectId,
      thumbnailUrl: scenes.thumbnailUrl,
      version: scenes.version,
      createdAt: scenes.createdAt,
      updatedAt: scenes.updatedAt,
    })
    .from(scenes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(scenes.updatedAt))
    .limit(opts.limit ?? 50)
}

export async function loadScene(id: string) {
  const [scene] = await db.select().from(scenes).where(eq(scenes.id, id))
  return scene ?? null
}

export async function saveScene(data: {
  id?: string
  name: string
  projectId?: string | null
  graph: unknown
  thumbnailUrl?: string | null
  ownerId?: string | null
  expectedVersion?: number
}) {
  const id = data.id ?? generateSceneId()

  if (data.id) {
    // Upsert with optimistic concurrency
    const existing = await loadScene(data.id)
    if (existing && data.expectedVersion !== undefined && existing.version !== data.expectedVersion) {
      throw Object.assign(new Error('version_conflict'), { code: 'version_conflict' })
    }
    const newVersion = (existing?.version ?? 0) + 1
    await db
      .insert(scenes)
      .values({ id, name: data.name, projectId: data.projectId ?? null, graph: JSON.stringify(data.graph), thumbnailUrl: data.thumbnailUrl ?? null, ownerId: data.ownerId ?? null, version: newVersion })
      .onConflictDoUpdate({
        target: scenes.id,
        set: { name: data.name, graph: JSON.stringify(data.graph), thumbnailUrl: data.thumbnailUrl ?? null, version: newVersion, updatedAt: new Date() },
      })
    return { id, version: newVersion }
  }

  await db.insert(scenes).values({ id, name: data.name, projectId: data.projectId ?? null, graph: JSON.stringify(data.graph), thumbnailUrl: data.thumbnailUrl ?? null, ownerId: data.ownerId ?? null, version: 1 })
  return { id, version: 1 }
}

export async function deleteScene(id: string) {
  await db.delete(scenes).where(eq(scenes.id, id))
}
```

---

## Updated Scene API Route

`apps/editor/app/api/scenes/route.ts` — change `getSceneOperations()` calls to use the new Postgres functions:

```typescript
// Replace: const operations = await getSceneOperations()
// With direct imports from the new store:
import { listScenes, saveScene } from '@/lib/db/scene-store-pg'
```

The existing `guardSceneApiRequest` middleware stays unchanged — it still validates the static API token for programmatic/MCP access.

---

## Migration Steps

### Step 1 — Set up Neon
1. Create project at `neon.tech`
2. Copy connection string → add to Vercel env vars as `DATABASE_URL`
3. Add to `.env.local` for local dev

### Step 2 — Run initial migration
```bash
cd apps/editor
bun drizzle-kit generate  # generates SQL in lib/db/migrations/
bun drizzle-kit migrate   # applies to Neon
```

### Step 3 — Data migration (if existing SQLite scenes matter)
```bash
# Export existing scenes to JSON
bun run scripts/migrate-sqlite-to-pg.ts
```

Write a one-shot script that reads the SQLite DB via `better-sqlite3` and inserts into Neon.

### Step 4 — Update environment
Add to Vercel project:
```
DATABASE_URL = postgresql://...
```
Remove `PASCAL_DB_PATH` from Vercel (keep only in local `.env.local` if you want local SQLite fallback).

### Step 5 — Deploy and smoke test
- `GET /api/scenes` returns empty array (new DB)
- `POST /api/scenes` creates a scene
- `GET /api/scenes/:id` retrieves it

---

## Verify Success

- [ ] `bun drizzle-kit migrate` exits 0
- [ ] `GET /api/scenes` responds 200 on production
- [ ] `POST /api/scenes` creates scene, stored in Neon
- [ ] `PUT /api/scenes/:id` with wrong `expectedVersion` returns 409
- [ ] Scene list on `/scenes` page loads without error

---

## What Stays the Same

- Scene API URL structure unchanged (`/api/scenes`, `/api/scenes/[id]`)
- `PASCAL_SCENE_API_TOKEN` auth for programmatic access unchanged
- `packages/mcp` SQLite store unchanged — still used when MCP server runs locally (separate process)
- No frontend changes required in Phase 0
