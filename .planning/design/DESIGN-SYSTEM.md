# Aruct Editor — Design System

> Complete brand identity, design tokens, typography, color, and component patterns.
> This document is the source of truth for all UI decisions.

---

## 1. Brand Identity

### Name & Positioning

**Product name:** Aruct Editor  
**Full form:** Arch Construct Editor  
**Tagline:** *Build in three dimensions.*  
**Category:** Professional 3D architectural editor  
**Audience:** Architects, interior designers, space planners, AEC professionals  
**Positioning:** The precision tool for spatial design — fast, modern, accessible

---

### Brand Personality

| Axis | We are | We are not |
|---|---|---|
| Tone | Precise, confident | Cold, corporate |
| Aesthetic | Minimal, technical | Sterile, featureless |
| Energy | Purposeful | Trendy |
| Voice | Direct, expert | Jargon-heavy |

Think: a well-designed set of drawing instruments — every element placed for a reason, no noise.

---

### Logo System

#### Logomark concept — "The Section Cut"

An architectural section cut is the fundamental act of understanding a building: you cut through it and see inside. The Aruct mark captures this as a geometric cube bisected by a horizontal line — the 3D object becoming a floor plan.

```
Logomark (SVG concept):

  ┌──────────────┐
  │   ┌──────┐   │   ←  3D box (isometric cube outline)
  │   │  ─ ─ │   │   ←  horizontal section-cut line bisects it
  │   └──────┘   │
  └──────────────┘
```

**Construction rules:**
- Geometric, constructed entirely from straight lines and 45° diagonals
- Single-weight stroke (2px at 24px size)
- Works at 16px (favicon) — the top isometric cube face becomes a diamond
- Must render in monochrome first; colour is additive only
- Clear space: 0.5× logomark height on all sides

**Logomark variants:**
1. `mark` — cube mark only (favicon, avatar, app icon)
2. `wordmark` — mark + "Aruct" in Barlow 700
3. `full` — mark + "Aruct Editor" (two-line) for sidebar header

**SVG implementation path:**
- Primary file: `/apps/editor/public/logo/mark.svg`
- Full: `/apps/editor/public/logo/full.svg`
- Dark variant: `/apps/editor/public/logo/mark-dark.svg` (white stroke)
- Favicon: `/apps/editor/public/favicon.svg`

**Typography in logo:**
- Wordmark: Barlow 700, letter-spacing: -0.02em
- No special treatment — the mark carries the identity

---

### Brand Color — Blueprint Indigo

The primary brand colour references architectural blueprints: the prussian blue of technical drawings. It signals precision and craft without being aggressive.

```
Primary brand:  oklch(0.55 0.22 264)
                ≈ #4F46E5 (indigo-600 equivalent)

Dark mode:      oklch(0.72 0.18 264)
                ≈ #818CF8 (indigo-400 equivalent)
```

Used for: primary CTAs, active nav states, focus rings, "Most Popular" badges, Pro plan accents, links.

Never used for: backgrounds (except pill chips), decorative flourishes, the viewport area (3D canvas must remain neutral).

---

## 2. Color System

### Philosophy
- Light mode: warm white base, feels like paper/drafting surface
- Dark mode: deep charcoal, feels like a professional tool (dark-first for the editor)
- One brand hue (indigo) for all interactive/semantic blue moments
- Semantic colours for status only (success, warning, destructive)
- Achromatic scale for surfaces, borders, text

### Token Definitions

#### Light Mode
```css
:root {
  /* Surfaces */
  --background:           oklch(0.995 0.002 100);  /* warm off-white, paper-like */
  --surface:              oklch(1.0   0     0);     /* pure white (cards, panels) */
  --surface-raised:       oklch(0.99  0     0);     /* modal/popover bg */

  /* Foreground */
  --foreground:           oklch(0.14  0     0);     /* near-black */
  --foreground-secondary: oklch(0.45  0     0);     /* secondary text */
  --foreground-muted:     oklch(0.60  0     0);     /* placeholder, metadata */
  --foreground-disabled:  oklch(0.75  0     0);     /* disabled state */

  /* Brand (Blueprint Indigo) */
  --brand:                oklch(0.55  0.22  264);   /* primary CTA, links */
  --brand-hover:          oklch(0.48  0.22  264);   /* hover state */
  --brand-muted:          oklch(0.93  0.06  264);   /* chip bg, pill bg */
  --brand-foreground:     oklch(1.0   0     0);     /* text on brand bg */

  /* Borders */
  --border:               oklch(0.90  0     0);     /* default border */
  --border-strong:        oklch(0.80  0     0);     /* emphasized border */
  --border-focus:         oklch(0.55  0.22  264);   /* focus ring = brand */

  /* Input */
  --input:                oklch(0.93  0     0);

  /* Semantic: Success */
  --success:              oklch(0.52  0.17  145);   /* green-600 */
  --success-muted:        oklch(0.94  0.05  145);   /* green-100 */
  --success-foreground:   oklch(1.0   0     0);

  /* Semantic: Warning */
  --warning:              oklch(0.62  0.18  55);    /* amber-600 */
  --warning-muted:        oklch(0.96  0.05  55);    /* amber-50 */
  --warning-foreground:   oklch(0.25  0     0);

  /* Semantic: Destructive */
  --destructive:          oklch(0.58  0.24  27);    /* red */
  --destructive-muted:    oklch(0.96  0.05  27);
  --destructive-foreground: oklch(1.0  0     0);

  /* Semantic: Purple (Team plan) */
  --purple:               oklch(0.52  0.22  300);
  --purple-muted:         oklch(0.94  0.05  300);
  --purple-foreground:    oklch(1.0   0     0);

  /* Sidebar */
  --sidebar:              oklch(0.98  0     0);
  --sidebar-foreground:   oklch(0.14  0     0);
  --sidebar-border:       oklch(0.91  0     0);
  --sidebar-accent:       oklch(0.93  0.04  264);   /* brand-tinted active bg */
  --sidebar-accent-fg:    oklch(0.55  0.22  264);   /* brand text on active */

  /* Radius */
  --radius:               0.5rem;       /* 8px — tighter than current 10px */
  --radius-sm:            0.25rem;      /* 4px */
  --radius-md:            0.5rem;       /* 8px */
  --radius-lg:            0.75rem;      /* 12px */
  --radius-xl:            1rem;         /* 16px */
  --radius-2xl:           1.5rem;       /* 24px */
  --radius-full:          9999px;
}
```

#### Dark Mode
```css
.dark {
  /* Surfaces */
  --background:           oklch(0.10  0     0);     /* ~#141414 */
  --surface:              oklch(0.14  0     0);     /* ~#1E1E1E */
  --surface-raised:       oklch(0.17  0     0);     /* modals/popovers */

  /* Foreground */
  --foreground:           oklch(0.97  0     0);
  --foreground-secondary: oklch(0.70  0     0);
  --foreground-muted:     oklch(0.52  0     0);
  --foreground-disabled:  oklch(0.38  0     0);

  /* Brand */
  --brand:                oklch(0.72  0.18  264);   /* lighter for dark bg */
  --brand-hover:          oklch(0.78  0.16  264);
  --brand-muted:          oklch(0.20  0.06  264);
  --brand-foreground:     oklch(0.10  0     0);

  /* Borders */
  --border:               oklch(1.0   0     0  / 0.09);
  --border-strong:        oklch(1.0   0     0  / 0.18);
  --border-focus:         oklch(0.72  0.18  264);

  /* Input */
  --input:                oklch(1.0   0     0  / 0.12);

  /* Semantic: Success */
  --success:              oklch(0.72  0.17  145);
  --success-muted:        oklch(0.18  0.06  145);
  --success-foreground:   oklch(0.10  0     0);

  /* Semantic: Warning */
  --warning:              oklch(0.75  0.16  55);
  --warning-muted:        oklch(0.20  0.06  55);
  --warning-foreground:   oklch(0.10  0     0);

  /* Semantic: Destructive */
  --destructive:          oklch(0.70  0.19  22);
  --destructive-muted:    oklch(0.18  0.06  22);
  --destructive-foreground: oklch(0.10  0     0);

  /* Semantic: Purple */
  --purple:               oklch(0.70  0.20  300);
  --purple-muted:         oklch(0.18  0.06  300);
  --purple-foreground:    oklch(0.10  0     0);

  /* Sidebar */
  --sidebar:              oklch(0.12  0     0);
  --sidebar-foreground:   oklch(0.97  0     0);
  --sidebar-border:       oklch(1.0   0     0  / 0.08);
  --sidebar-accent:       oklch(0.20  0.06  264);
  --sidebar-accent-fg:    oklch(0.72  0.18  264);
}
```

### Colour Usage Rules

```
CTA Buttons (primary):   bg-brand text-brand-foreground
CTA hover:               bg-brand-hover
Ghost/secondary:         border-border hover:bg-accent
Destructive:             bg-destructive text-destructive-foreground
Active nav item:         bg-sidebar-accent text-sidebar-accent-fg
Focus rings:             ring-border-focus (brand colour)
Plan badge — Free:       bg-muted text-foreground-muted
Plan badge — Pro:        bg-brand-muted text-brand
Plan badge — Team:       bg-purple-muted text-purple
Admin badge:             bg-warning-muted text-warning
Success states:          text-success / bg-success-muted
Promo tags:              bg-success-muted text-success
```

---

## 3. Typography

### Font Stack

```
Display / Headings:  Barlow 600–800, tracking tight (-0.02em to -0.03em)
UI Body:             Barlow 400–600
Code / Coords:       Geist Mono (variable)
Decorative:          Geist Pixel Square (splash screens, loader only)
```

### Type Scale

| Token | Size | Line-height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 11px | 16px | 400 | Metadata, timestamps, badges |
| `text-sm` | 13px | 20px | 400/500 | Body, nav labels, form labels |
| `text-base` | 15px | 24px | 400 | Card body, descriptions |
| `text-lg` | 17px | 28px | 500/600 | Section headers, panel titles |
| `text-xl` | 20px | 28px | 600/700 | Page subtitles |
| `text-2xl` | 24px | 32px | 700 | Page titles (scenes, account) |
| `text-3xl` | 30px | 36px | 700 | Feature headers, pricing price |
| `text-4xl` | 36px | 44px | 800 | Hero headlines |

**Barlow weight mapping:**
- `font-normal` (400) — body, secondary
- `font-medium` (500) — labels, emphasis
- `font-semibold` (600) — section headers, active nav
- `font-bold` (700) — page titles, CTA labels
- `font-extrabold` (800) — hero/display only

### Font Implementation

```css
/* globals.css addition */
@theme {
  --font-display: var(--font-barlow), ui-sans-serif;
  --font-sans:    var(--font-barlow), var(--font-geist-sans), ui-sans-serif;
  --font-mono:    var(--font-geist-mono), ui-monospace;
}
```

```tsx
/* layout.tsx addition */
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],  /* add 800 */
  variable: '--font-barlow',
  display: 'swap',
})
```

---

## 4. Spacing & Layout

### Spacing Scale (4px base grid)

```
0.5 →  2px    micro separators
1   →  4px    icon gap, tight padding
1.5 →  6px    compact component padding
2   →  8px    small component internal pad
3   →  12px   input padding, badge pad
4   →  16px   panel padding, card gap
5   →  20px   section gap
6   →  24px   card padding
8   →  32px   page section gap
10  →  40px   large section spacing
12  →  48px   page top padding
16  →  64px   hero section spacing
```

### Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ AppShell (min-h-screen flex)                               │
│ ┌───────────┐ ┌─────────────────────────────────────────┐ │
│ │ Sidebar   │ │ Main content                             │ │
│ │ 240px     │ │ max-w-[1280px] mx-auto px-6 (mobile: 4) │ │
│ │ fixed     │ │                                          │ │
│ │ (mobile:  │ │                                          │ │
│ │ drawer)   │ │                                          │ │
│ └───────────┘ └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Breakpoints:**

| bp | px | Use |
|---|---|---|
| `sm` | 640 | Mobile → tablet transition |
| `md` | 768 | Sidebar becomes visible |
| `lg` | 1024 | Full desktop layout |
| `xl` | 1280 | Content max-width cap |

**Mobile layout (< md = 768px):**
- Sidebar hidden by default
- Hamburger button in sticky top bar (h-12, border-b)
- Sidebar opens as an overlay drawer (slide from left)
- Close on backdrop click or ESC

---

## 5. Component Patterns

### Buttons

```
Variants:
  primary   — bg-brand text-brand-foreground             (CTA)
  secondary — border border-border hover:bg-accent       (default action)
  ghost     — hover:bg-accent hover:text-foreground      (icon buttons)
  danger    — bg-destructive text-destructive-foreground (delete/cancel)
  link      — text-brand underline-offset-4 hover:underline

Sizes:
  sm   — h-7  px-3  text-xs  rounded-md
  md   — h-9  px-4  text-sm  rounded-md   (default)
  lg   — h-11 px-6  text-sm  rounded-lg

State:
  disabled — opacity-40 cursor-not-allowed
  loading  — inline spinner, label stays (no width jump)
  focus    — ring-2 ring-border-focus ring-offset-2
```

**Key change:** Replace `bg-foreground text-background` CTA buttons with `bg-brand text-brand-foreground`. This removes the jarring inversion and gives brand consistency.

---

### Navigation Sidebar (AppSidebar)

```
Width:     240px (md+)
Mobile:    slide-over drawer
Structure:
  ┌─────────────────────────────┐
  │  Logo + wordmark  (h-14)    │
  │  border-b                   │
  ├─────────────────────────────┤
  │  Open Editor CTA (rounded)  │
  │  border-b                   │
  ├─────────────────────────────┤
  │  Nav items (flex-1)         │
  │  px-3 py-4 space-y-0.5     │
  │                             │
  │  [icon] Label    ← active: bg-sidebar-accent
  │                             │
  │  — separator —              │
  │  [icon] Admin item (amber)  │
  ├─────────────────────────────┤
  │  User footer    (border-t)  │
  │  Name / email               │
  │  Plan badge                 │
  │  Upgrade CTA (if free)      │
  │  Sign out                   │
  │  — separator —              │
  │  Theme toggle (sun/moon)    │
  └─────────────────────────────┘
```

**Active state change:** Replace `bg-accent` (grey) with `bg-sidebar-accent` (brand-tinted indigo) + `text-sidebar-accent-fg` (brand colour). Active items are unmistakable.

---

### Scene Cards

```
┌────────────────────────────────┐
│  [thumbnail 16:9 rounded-lg]  │
│  Shadow on hover               │
├────────────────────────────────┤
│  Scene Name          [•••]    │
│  3 nodes  ·  Updated 2d ago   │
└────────────────────────────────┘

Hover: shadow-md, thumbnail slight scale(1.02)
Transition: all 150ms ease
```

---

### Plan Badge (Pill)

```
Free:  bg-muted          text-foreground-muted   border-border
Pro:   bg-brand-muted    text-brand              border-brand/20
Team:  bg-purple-muted   text-purple             border-purple/20

Size: px-2 py-0.5 text-[10px] font-bold rounded-full
```

---

### Theme Toggle

```tsx
// Add to AppSidebar footer
<button
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm 
             text-muted-foreground hover:bg-accent hover:text-foreground w-full"
>
  <Sun className="h-4 w-4 dark:hidden" />
  <Moon className="h-4 w-4 hidden dark:block" />
  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
</button>
```

---

### Input Fields

```
Base: rounded-md border border-border bg-background px-3 py-2 text-sm
Focus: ring-2 ring-border-focus ring-offset-1 outline-none
Error: border-destructive focus:ring-destructive
Disabled: opacity-50 cursor-not-allowed
```

---

### Empty States

**Scene grid empty:**
```
┌────────────────────────────────────────────┐
│                                            │
│         [Cube outline illustration         │
│          — 64×64 — muted stroke]           │
│                                            │
│      No scenes yet                         │
│      Start with a blank canvas or          │
│      explore starter templates.            │
│                                            │
│      [Create scene]   [Browse templates]   │
│                                            │
└────────────────────────────────────────────┘
Border: border-dashed border-border/60 rounded-xl p-16 text-center
```

---

## 6. Elevation & Shadows

The existing `styles/elevation.css` is excellent — keep it. Add the following Tailwind utilities to reference it:

```css
/* Use existing --shadow-* tokens via elevation classes */
.el-0  { box-shadow: none; }
.el-1  { box-shadow: var(--shadow-1); }
.el-2  { box-shadow: var(--shadow-2); }
.el-3  { box-shadow: var(--shadow-3); }
.el-4  { box-shadow: var(--shadow-4); }
.el-5  { box-shadow: var(--shadow-5); }
```

**Elevation assignment:**
| Element | Level |
|---|---|
| Page background | 0 |
| Sidebar, panels | 1 |
| Cards | 2 |
| Dropdown menus | 3 |
| Sticky toolbars | 4 |
| Modals, dialogs | 5 |

---

## 7. Dark/Light Mode Toggle — Implementation

### Step 1: Install next-themes
```bash
pnpm add next-themes --filter @aruct/editor-app
```

### Step 2: Wrap layout
```tsx
// apps/editor/app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${barlow.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientBootstrap>{children}</ClientBootstrap>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 3: Theme toggle button
Add to `AppSidebar` footer (above sign out) using `useTheme()` from `next-themes`.

### Step 4: Persist preference
`next-themes` handles localStorage automatically.

---

## 8. Responsive Mobile Navigation

### Pattern: Slide-over drawer

```tsx
// AppSidebar mobile variant
// - Hidden on < md
// - Triggered by hamburger in sticky top bar
// - Overlay: bg-background/80 backdrop-blur-sm
// - Drawer: fixed left-0 top-0 h-full w-72 bg-background shadow-xl z-50
// - Animated: translate-x-[-100%] → translate-x-0 (200ms ease)
// - Close: backdrop click, ESC, or nav item click (mobile)
```

**Top bar for mobile:**
```tsx
// Only shown on < md
<header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/95 backdrop-blur px-4 md:hidden">
  <button onClick={openDrawer}>
    <Menu className="h-5 w-5" />
  </button>
  <div className="flex-1 flex justify-center">
    <Logo />
  </div>
  <div className="w-8" /> {/* balance space */}
</header>
```

---

## 9. Pricing Page — Design

### Current problems
- Hardcoded `bg-blue-600` — not themed
- Three-column grid at md (768px) is too narrow
- "Most Popular" badge floats above card but uses arbitrary blue

### Target design
```
┌─────────────────────────────────────────────────┐
│  Simple, transparent pricing                    │
│  Start free. Upgrade when you're ready to scale.│
├─────────────────────────────────────────────────┤
│  [Toggle: Monthly / Annual]   (future)          │
├──────────┬──────────────────┬───────────────────┤
│  FREE    │  PRO             │  TEAM             │
│          │  ★ Most Popular  │                   │
│  $0      │  $29/mo          │  $79/mo           │
│  /month  │                  │                   │
│          │  Ring of brand   │                   │
│          │  colour, shadow  │                   │
├──────────┴──────────────────┴───────────────────┤
│  All plans include 14-day free trial            │
└─────────────────────────────────────────────────┘
```

**Key changes:**
- "Most Popular" badge: `bg-brand text-brand-foreground` instead of `bg-blue-600`
- Highlighted plan: `border-brand` ring + `el-3` shadow — no `bg-foreground` inversion
- Promo tag: `bg-success-muted text-success`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (starts stacking at sm not md)

---

## 10. Login / Signup — Design

### Current: functional but plain

### Target improvements
1. Split-panel on desktop (md+): left panel = branding/illustration, right = form
2. Mobile: full-screen form (current approach is fine)
3. Brand colour on primary submit button
4. Subtle grid/blueprint background on left panel

```
Desktop layout:

┌─────────────────────────────────────────────────────────┐
│  Left panel (40%)          │  Right panel (60%)         │
│  bg-brand                  │  bg-background             │
│                            │                            │
│  [Logo mark]               │  Sign in                   │
│  Aruct Editor              │  to Aruct Editor           │
│                            │                            │
│  "Build in three           │  [Continue with Google]    │
│   dimensions."             │  [Continue with GitHub]    │
│                            │                            │
│  [Blueprint grid           │  ── or ──                  │
│   subtle pattern]          │                            │
│                            │  Email ____________        │
│                            │  Password __________       │
│                            │  [Sign in]                 │
└─────────────────────────────────────────────────────────┘
```

Left panel pattern: an SVG grid of light lines (like graph paper / blueprint) at 5% opacity on brand bg.

---

## 11. Implementation Priority Order

### P0 — Blocking UX (do first)
1. `ThemeProvider` + dark/light toggle in sidebar
2. Replace `bg-foreground` buttons with `bg-brand` (CTA buttons only)
3. Mobile sidebar drawer + sticky mobile header
4. Fix `--brand` token in `globals.css` CSS variables

### P1 — Brand (high ROI)
5. Logo SVG (mark + wordmark) in public/logo/
6. Replace `<Box />` icon with new logomark in AppSidebar
7. Fix all hardcoded colour classes → semantic tokens
8. Active nav state → brand-tinted background
9. Plan badges → semantic colour tokens

### P2 — Polish (visible quality)
10. Card hover micro-interaction (shadow lift + scale)
11. Empty state illustration for scenes page
12. Login split-panel layout on desktop
13. Barlow 800 weight for hero headings
14. `max-w-[1280px] mx-auto` content container on wide screens

### P3 — Delight
15. Page transitions (Framer Motion or CSS)
16. Sidebar nav hover — subtle transform + colour shift
17. Blueprint grid background on login/pricing left panel
18. Subtle shimmer skeleton on scene card loading

---

## 12. File Structure

```
apps/editor/
  public/
    logo/
      mark.svg          ← new logomark (SVG)
      full.svg          ← mark + wordmark
      mark-dark.svg     ← white version
    favicon.svg         ← update from mark.svg

  app/
    globals.css         ← add brand tokens (--brand, --success, etc.)
    layout.tsx          ← add ThemeProvider, Barlow 800

  components/
    app-sidebar.tsx     ← theme toggle, brand logo, active nav fix
    app-shell.tsx       ← mobile header + drawer
    theme-toggle.tsx    ← new: sun/moon button component
```

---

## 13. Reference: Comparable Brands

| Brand | What to borrow | What to avoid |
|---|---|---|
| **Figma** | Left-icon-rail pattern, property inspector precision | Their purple (use indigo instead) |
| **Linear** | Aggressive whitespace, sharp component edges | Their monochrome-only approach (we need brand colour) |
| **Spline** | Dark-native editor, gradient marketing | Their particle/blob aesthetic (too trendy) |
| **Arc browser** | Rounded sidebar, theme awareness | Their rainbow sidebar (too playful) |
| **Vercel dashboard** | Clean data tables, muted/foreground text hierarchy | Their exclusive dark mode |

---

## 14. Quick Reference Cheatsheet

```
Brand colour:       #4F46E5 (light) / #818CF8 (dark)
Background:         #FAFAF8 (light) / #141414 (dark)
Surface:            #FFFFFF (light) / #1E1E1E (dark)
Border:             #E5E5E5 (light) / rgba(255,255,255,0.09) (dark)
Foreground:         #222222 (light) / #F8F8F8 (dark)
Muted text:         #777777 (light) / #858585 (dark)

Font display:       Barlow 700–800, -0.03em
Font body:          Barlow 400–600
Font mono:          Geist Mono

Border radius:      8px base, 12px card, 4px sm, 16px xl, full pill
Base unit:          4px grid

Primary button:     bg-brand text-white, rounded-md h-9 px-4 text-sm font-semibold
Sidebar width:      240px (fixed), drawer on mobile
Content max-width:  1280px centered
```
