# Layout Redesign — One Unified Shell

> Goal: single visual shell across public pages + editor. Responsive. Theme-aware. Flat.

---

## 1. The Core Problem

Right now there are two apps:

**App A — Public Shell** (AppShell + AppSidebar):
```
[Logo + Nav sidebar w-60] | [Page content max-w-1280]
```

**App B — Editor Shell** (EditorLayoutV2, always dark):
```
[IconRail w-11] | [ResizablePanel] | [Canvas + floating toolbars]
```

They share no visual structure. When a user opens the editor from the `/scenes` page, the entire visual context resets. This is jarring and unprofessional.

---

## 2. Proposed: One Unified Shell

### 2.1 Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR  h-12  border-b  bg-background                         │
│ [AructMark + wordmark]  [Nav: Scenes / Pricing / Docs]  ──────  │
│                                       [Theme toggle] [Account] │
├──────────────────────────────────────────────────────────────────┤
│ CONTENT AREA  flex-1  overflow-auto                             │
│                                                                 │
│  PUBLIC PAGES: max-w-[1280px] mx-auto px-6 py-8                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ <children />                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  EDITOR PAGE: full-bleed, no max-width                          │
│  ┌────────┬───────────────────┬─────────────────────────────┐   │
│  │ Rail   │  Resizable Panel  │  Canvas                     │   │
│  │ w-12   │  280–800px        │  flex-1                     │   │
│  └────────┴───────────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key principle:** The top bar is always present. Public pages use it for navigation. The editor uses it too, but replaces the nav items with scene controls.

---

## 3. Top Bar Specification

### 3.1 Public Pages Top Bar

```
[AructMark h-5 w-5] [Aruct Editor text-sm font-semibold]
    gap-2.5                                gap-8 between sections
                   [Scenes] [Pricing] [Docs]
                                               [☀/🌙] [Avatar]
```

Height: `h-12` (48px)  
Padding: `px-4`  
Background: `bg-background border-b border-border`  
Typography: nav links `text-sm font-medium text-muted-foreground hover:text-foreground`

```tsx
<header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background px-4">
  <a href="/" className="flex items-center gap-2.5 text-foreground">
    <AructMark className="h-5 w-5" />
    <span className="text-sm font-semibold tracking-tight">Aruct Editor</span>
  </a>
  <nav className="ml-8 flex items-center gap-1">
    <TopBarLink href="/scenes">Scenes</TopBarLink>
    <TopBarLink href="/pricing">Pricing</TopBarLink>
    <TopBarLink href="/docs">Docs</TopBarLink>
  </nav>
  <div className="ml-auto flex items-center gap-2">
    <ThemeToggle />
    <UserButton />
  </div>
</header>
```

### 3.2 Editor Top Bar

The editor replaces nav links with:

```
[Logo]   [< Back]   [Scene Name ▾]   ───   [3D | 2D | Split]   ───   [Display ▾] [Preview] [Account]
```

```
left zone (logo + back + scene name) | center zone (view mode) | right zone (display + preview + account)
```

Height: `h-12` (48px) — same as public top bar  
Background: `bg-background border-b border-border` — same tokens

This means: when the user navigates between the editor and `/scenes`, the top bar is visually continuous. Only the content of the top bar changes.

---

## 4. Removing AppSidebar from Public Pages

**Current:** Public pages have a `w-60` left sidebar. This is redundant when a top bar exists.

**Proposed:** Drop the sidebar on public pages. Navigation moves entirely into the top bar. The left sidebar is an editor concept.

**What the sidebar currently contains:**
- Logo (→ top bar left)
- "Open Editor" CTA (→ top bar as button, or prominently on `/scenes`)
- Nav items: Scenes, Pricing, Billing, Account, Admin (→ top bar nav + dropdown for admin)
- User info + plan badge + theme toggle (→ top bar right)

All of this maps cleanly to a top bar. Nothing is lost.

**Exception:** If future pages need a secondary sidebar (e.g., settings pages with multiple sections), a local sidebar scoped to that route is fine. But the app-level sidebar is removed.

---

## 5. Editor Layout Fixes

### 5.1 Remove Hardcoded Dark Mode

**File:** `packages/editor/src/components/editor/editor-layout-v2.tsx`  
**Line:** `className="dark flex h-full w-full..."`

Remove `dark` from className. The `<html>` tag managed by `next-themes`'s `ThemeProvider` already applies `dark`. The editor then inherits it automatically.

```tsx
// Before
<div className="dark flex h-full w-full flex-col bg-sidebar text-foreground">

// After
<div className="flex h-full w-full flex-col bg-sidebar text-foreground">
```

### 5.2 Remove Right Column Decorative Radius and Shadow

**File:** `packages/editor/src/components/editor/editor-layout-v2.tsx`  
**Current:**
```js
style={{
  borderTopLeftRadius: 16,
  boxShadow: '-4px -2px 16px rgba(0,0,0,0.08), -1px 0 4px rgba(0,0,0,0.04)'
}}
```

Remove both. The canvas panel is not floating — it's flush. Structure via a `border-l border-border` instead, which is simpler and flat.

### 5.3 Icon Rail: SVG Icons

Replace `.webp` images in `SIDEBAR_TABS` with Lucide SVG icons. Use the `mobileIcon` value as the primary icon.

```tsx
// Before
icon: <Image src="/icons/build.webp" className="h-8 w-8" ... />

// After  
icon: <Hammer className="h-5 w-5" />,
```

Update `icon-rail.tsx` to render at consistent `h-5 w-5` (20px).

---

## 6. Responsive Layout

### 6.1 Breakpoint Strategy

```
Mobile       < 640px    sm
Tablet       640–1024px sm–lg  
Desktop      ≥ 1024px   lg
```

### 6.2 Behavior Table

| Zone | Mobile | Tablet | Desktop |
|---|---|---|---|
| Top bar | `h-12` full-width | `h-12` full-width | `h-12` full-width |
| Editor icon rail | Hidden, bottom nav | Icon-only w-12 | Icon rail w-12 |
| Editor panel | Bottom sheet (snap) | Slide-over drawer | Inline resizable |
| Canvas | Full screen | Full screen | flex-1 |
| Floating toolbar | Full-width at bottom | Centered at bottom | Centered at bottom |
| Top bar nav | Hidden, hamburger → drawer | Collapsed → `···` dropdown | Full nav links |

### 6.3 Mobile: One Header, One Approach

**Remove `MobileShellClient`** — it duplicates the logo and nav. Replace with responsive logic in the single `TopBar` component:

```tsx
function TopBar() {
  return (
    <header className="sticky top-0 z-40 h-12 border-b border-border bg-background">
      <div className="flex h-full items-center px-4">
        <Logo />
        
        {/* Desktop nav — hidden on mobile */}
        <nav className="ml-8 hidden md:flex items-center gap-1">
          <TopBarLink href="/scenes">Scenes</TopBarLink>
          <TopBarLink href="/pricing">Pricing</TopBarLink>
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <UserButton />
          
          {/* Mobile hamburger — hidden on desktop */}
          <MobileMenuButton className="md:hidden" />
        </div>
      </div>
    </header>
  )
}
```

Mobile nav lives in a single `<MobileDrawer>` opened by the hamburger. No duplicate component.

---

## 7. Floating Toolbar Consistency

Four floating elements in the editor need a shared visual token:

```css
/* Shared floating toolbar token */
.floating-bar {
  @apply inline-flex items-center rounded-xl border border-border 
         bg-background/90 shadow-[var(--el-2)] backdrop-blur-md;
}
```

Apply this class to:
1. Top-center info bar (save status + Open/Create)
2. Bottom-center tool picker
3. Context shortcut panel (bottom-right)
4. View mode toggle (3D/2D/Split)

**Move view mode toggle into the top bar** — it's navigation-level UI, not a floating overlay. Place it in the center zone of the editor top bar (see §3.2).

**Move keyboard shortcuts into a panel** — not a floating element. Put it in a dedicated bottom-right corner zone that's part of the editor layout, not an overlay.

---

## 8. File-by-File Change Summary

| File | Change | Priority |
|---|---|---|
| `packages/editor/src/components/editor/editor-layout-v2.tsx` | Remove `dark` from className | **Critical** |
| `packages/editor/src/components/editor/editor-layout-v2.tsx` | Remove `borderTopLeftRadius` + shadow on right column | High |
| `apps/editor/app/layout.tsx` | Add `<TopBar>` inside layout wrapper | High |
| `apps/editor/components/app-shell.tsx` | Remove `<AppSidebar>` — replace with `<TopBar>` | High |
| `apps/editor/components/app-sidebar.tsx` | Deprecate or repurpose for editor-only | High |
| `apps/editor/components/mobile-shell-client.tsx` | Remove — absorbed into `TopBar` responsive logic | High |
| `apps/editor/app/page.tsx` | Update `SIDEBAR_TABS` to use SVG icons | Medium |
| `packages/editor/src/components/ui/sidebar/icon-rail.tsx` | Update icon size to `h-5 w-5` | Medium |
| `apps/editor/app/globals.css` | Update dark mode neutrals to indigo-tinted | Low |
| `apps/editor/components/viewer-toolbar.tsx` | Move 3D/2D/Split into top bar; apply `floating-bar` class everywhere | Medium |

---

## 9. Dark Mode Canvas

Three.js scene background must respond to theme. Pass the CSS variable value as the clear color:

```tsx
// In Viewer component — read CSS variable on mount and theme change
const canvasBg = getComputedStyle(document.documentElement)
  .getPropertyValue('--canvas-bg')
  .trim()

renderer.setClearColor(canvasBg)
```

Add CSS variables:
```css
:root  { --canvas-bg: oklch(0.92 0.004 80); }
.dark  { --canvas-bg: oklch(0.11 0.010 264); }
```

---

## 10. Before/After Summary

| Dimension | Before | After |
|---|---|---|
| Shell count | 2 (AppShell + EditorLayout) | 1 (TopBar + content area) |
| Dark mode (editor) | Hardcoded always-dark | Follows system/user preference |
| Mobile nav | Duplicate component (MobileShellClient) | Single responsive TopBar |
| Icon rail icons | `.webp` bitmaps | Lucide SVG |
| Floating zones | 4 with inconsistent tokens | 2 (bottom toolbar + info bar), shared token |
| Canvas background | Static gray | Theme-aware CSS variable |
| Sidebar (public) | w-60 left sidebar | Removed — top bar nav |
| Right column | 16px radius + custom shadow | Flat, border-l only |
| Responsive | Hard swap at md: breakpoint | Gradual: 3-breakpoint layout |
