# Editor Sidebar Scroll — Investigation & Fix

## Problem

Settings panel sidebar had no scroll. Content cut off at bottom of screen. No way to reach settings below the fold.

---

## Root Cause

`packages/editor/src/components/ui/sidebar/app-sidebar.tsx` — `SidebarContent` had `overflow-hidden`:

```tsx
// Before (broken)
<SidebarContent className={cn('no-scrollbar flex flex-1 flex-col overflow-hidden')}>
```

`overflow-hidden` clips children. No scroll possible regardless of content height.

Secondary issue: `flex-1` without `min-h-0` causes flex children to overflow their container in column flex layouts (flex items default `min-height: auto`, which ignores parent constraints).

---

## Fix

```tsx
// After (fixed)
<SidebarContent className={cn('no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto')}>
```

Changes:
- `overflow-hidden` → `overflow-y-auto` — enables vertical scroll
- Added `min-h-0` — allows flex child to shrink below intrinsic height so scroll works

---

## File changed

`packages/editor/src/components/ui/sidebar/app-sidebar.tsx` line 98

This is in `packages/editor` (shared package), so fix applies to all embedders of the editor, not just `apps/editor`.
