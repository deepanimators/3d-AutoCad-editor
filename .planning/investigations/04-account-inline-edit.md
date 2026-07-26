# Account Page Inline Name Edit — Investigation & Implementation

## Problem

Account page (`/account`) showed user name as read-only text. No way to update display name from the UI. No API route existed.

---

## What Was Built

### API route

`apps/editor/app/api/account/profile/route.ts` — `PATCH /api/account/profile`

```ts
const schema = z.object({ name: z.string().min(1).max(100) })

// Auth: session from __session cookie
// Validates name with Zod
// Updates users.name + users.updatedAt via Drizzle
// Returns { name: string }
```

### Client changes

`apps/editor/app/account/account-client.tsx`

State added:
- `name` — displayed value
- `editingName` — toggle between display and edit mode
- `nameInput` — controlled input value
- `saving` — disables controls during fetch

UX:
- Pencil icon button next to name → shows inline `<input>`
- Check icon → saves (calls PATCH, updates local state)
- X icon → cancels (restores previous name)
- `Enter` key → saves
- `Escape` key → cancels
- Input auto-focuses on edit mode
- Optimistic update: UI shows new name immediately, rolls back on error

---

## No page reload required

Save → `PATCH /api/account/profile` → update local React state. Name persists in DB. Next page load reads updated name from session/DB.
