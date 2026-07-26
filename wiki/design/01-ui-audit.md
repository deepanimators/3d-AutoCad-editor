# UI Audit — Current State Problems

> Investigation of the Aruct Editor interface as of 2026-07-26.
> Screenshots reference: `ace.tucnow.in` live editor.

---

## 1. Critical Structural Bugs

### 1.1 Editor Hardcodes Dark Mode — Light Mode Broken

**File:** `packages/editor/src/components/editor/editor-layout-v2.tsx`  
**Root class:** `dark flex h-full w-full flex-col bg-sidebar text-foreground`

The `dark` class is **hardcoded** on the editor root. This means:
- User toggles light mode in AppSidebar → ThemeProvider updates `<html>` → editor ignores it
- Editor is **always dark** regardless of user preference
- The dark/light toggle in the sidebar does nothing for the editor experience

**Fix:** Remove `dark` from the className. Let `ThemeProvider` (next-themes) control the `dark` class on `<html>`. The editor inherits it automatically.

---

### 1.2 Two Completely Separate Visual Shells

**Shell A — AppShell** (public pages: `/scenes`, `/pricing`, `/account`):
```
┌─────────────────────────────────┐
│ AppSidebar (w-60, bg-sidebar)   │
│ ┌─────────────────────────────┐ │
│ │ Logo (h-14)                 │ │
│ │ Nav items                   │ │
│ │ User footer                 │ │
│ └─────────────────────────────┘ │
│ + MobileShellClient (h-12 mob)  │
└─────────────────────────────────┘
```

**Shell B — EditorLayoutV2** (editor page `/`):
```
┌──────────────────────────────────────────────┐
│ [DARK FORCED] [NO HEADER] [NO BRAND ANCHOR]  │
│ IconRail (w-11) │ ResizablePanel │ Canvas    │
│                 │                │           │
│ + Floating top toolbar (absolute top-3)      │
│ + Floating bottom toolbar (in canvas)        │
└──────────────────────────────────────────────┘
```

These share zero visual chrome. No top bar, no shared logo position, no consistent background. Users jumping from `/scenes` to the editor enter a **completely different visual environment**.

---

### 1.3 Bitmap Icons in Icon Rail

**File:** `apps/editor/app/page.tsx` — SIDEBAR_TABS config  
**Icons:** `/icons/scene.webp`, `/icons/build.webp`, `/icons/couch.webp`, `/icons/settings.webp`

- `.webp` bitmaps don't scale with `devicePixelRatio` above 1x
- No dark/light adaptation — same image in both modes
- `h-8 w-8` (32px) rendered in a `h-9 w-9` (36px) button — awkward sizing
- Inconsistent with the rest of the app which uses Lucide SVG icons

---

## 2. Layout & Hierarchy Problems

### 2.1 No Visual Hierarchy in the Editor

Every element has the same visual weight:
- Left panel, top toolbar, bottom toolbar, context shortcut panel — all use dark floating cards with no clear primary/secondary hierarchy
- The canvas (the actual work surface) competes visually with the surrounding UI chrome

### 2.2 Four Disconnected Floating Zones

From the screenshot:
1. **Top-center pill**: `"Local editor — scenes are not saved"` + Open/Create buttons — different radius from toolbar
2. **Top-right bar**: Stack / Full height / Display / Preview / Avatar — looks like browser extension UI
3. **Bottom-center toolbar**: Selection/draw tools in a floating pill — the best-designed element
4. **Bottom-right context panel**: Keyboard shortcut chip grid — appears detached, no spatial relationship to the tool that triggered it

No consistent `border-radius`, `shadow`, `backdrop-blur`, or `border` token ties these together.

### 2.3 Right Column Decoration Is Too Heavy

**File:** `packages/editor/src/components/editor/editor-layout-v2.tsx`
```js
style={{
  borderTopLeftRadius: 16px,
  boxShadow: '-4px -2px 16px rgba(0,0,0,0.08), -1px 0 4px rgba(0,0,0,0.04)'
}}
```

The canvas has a rounded top-left corner + custom shadow — it signals "I'm a card floating over something." But the left panel is the same `bg-sidebar` dark tone. There's nothing to float over. The decoration is visual noise.

### 2.4 Canvas Background Has No Design Intent

Canvas background: browser default `#E8E8E8` equivalent (rendered by Three.js). No consideration for:
- Light vs dark mode (same gray in both)
- Grid contrast when drawing
- Visual breathing room around the 3D scene

---

## 3. Responsive Issues

### 3.1 Mobile Is a Different App

| Viewport | What loads |
|---|---|
| `>= 768px` | AppSidebar (`w-60 hidden md:flex`) |
| `< 768px` | MobileShellClient (`h-12 sticky top-0 md:hidden`) + drawer |

On mobile, the entire sidebar is replaced by a completely different component. The nav items, logo, user footer — all duplicated in `mobile-shell-client.tsx`. Any change to nav items must be made in two places.

### 3.2 Editor Has No Responsive Adaptation

`EditorLayoutMobile` is a separate component path (referenced but not read). The icon rail (w-11) disappears on mobile. There's no graceful collapse — it's a full swap, not a responsive adaptation.

### 3.3 No Tablet State

Between 768px and 1024px, the app renders the full desktop layout. The `w-60` sidebar + full icon rail + full panel is cramped on a 768px viewport. No intermediate collapsed/icon-only sidebar state.

---

## 4. Typography Problems

### 4.1 Barlow at Small Sizes

Barlow is a semi-condensed geometric sans. At 11-13px (the size most UI labels run), it becomes difficult to read due to:
- Narrow letter-spacing by default
- Light weights (300, 400) have low x-height at small sizes
- Feels "military/industrial" not "professional/creative"

### 4.2 Inconsistent Size Usage

| Location | Size | Class |
|---|---|---|
| Nav items | `text-sm` (14px) | — |
| Admin label | `text-[10px]` | uppercase tracking-widest |
| User name | `text-xs` | — |
| User email | `text-[11px]` | — |
| Toolbar buttons | `text-xs` | — |

Three different non-standard sizes (`text-[10px]`, `text-[11px]`, `text-sm`) in the sidebar footer alone. No type scale system.

### 4.3 Letter-Spacing Applied Inline

Logo uses `style={{ letterSpacing: '-0.02em' }}` inline. This belongs in a design token or a utility class (`tracking-tight` = -0.025em is close enough).

---

## 5. Color & Theme Problems

### 5.1 Dark Mode Neutrals Have No Color Character

```css
/* Dark backgrounds */
--background: oklch(0.10 0 0);   /* Pure neutral black */
--sidebar:    oklch(0.12 0 0);   /* Pure neutral dark */
--card:       oklch(0.14 0 0);   /* Pure neutral */
```

All `C = 0` (zero chroma) = pure gray. Dark mode feels flat and generic. A slight cool/indigo chroma tint (`C = 0.008–0.012`) would give it depth and align with the brand's blue-violet identity.

### 5.2 Light Mode Backgrounds Are Pure White

```css
--background: oklch(0.995 0.002 100);  /* Near-white, slightly warm */
--card:       oklch(1.0 0 0);          /* Pure white */
```

Pure white cards on a near-white background have insufficient contrast. Surfaces need differentiation: background → panel → card should each step down slightly.

### 5.3 Border Uses No Chroma in Light Mode

```css
--border: oklch(0.90 0 0);  /* Pure gray border */
```

Borders with `C = 0` look "photocopied." A tiny brand chroma tint (`C = 0.004–0.006, H = 264`) would give borders a refined architectural quality.

---

## 6. Summary — Problem Priority

| # | Problem | Impact | Effort |
|---|---|---|---|
| 1 | Editor hardcodes `dark` class — light mode broken | High | Low (1 line) |
| 2 | Two disconnected visual shells | High | High |
| 3 | Bitmap icons in icon rail | Medium | Medium |
| 4 | No unified top bar across shells | High | High |
| 5 | Four floating zones with no shared token | Medium | Medium |
| 6 | Mobile duplicates desktop nav | Medium | Medium |
| 7 | Dark mode zero-chroma surfaces | Low | Low |
| 8 | No tablet/intermediate breakpoint | Medium | Medium |
| 9 | Barlow readability at small sizes | Low | Medium |
| 10 | Canvas bg no theme awareness | Low | Low |
