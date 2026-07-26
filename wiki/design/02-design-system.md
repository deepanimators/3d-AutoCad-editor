# Design System — Aruct Editor

> Full specification: branding, colors, typography, spacing, elevation, icons, and motion.
> Built on top of the existing OKLch token system in `apps/editor/app/globals.css`.

---

## 1. Brand Identity

### 1.1 Name & Positioning

**Brand name:** Aruct  
**Product name:** Aruct Editor  
**Tagline:** Build spaces. Think in 3D.

**Personality axes:**
- Precise but not cold
- Professional but not corporate
- Modern but not trendy
- Creative but not chaotic

**Competitive reference:**
| Tool | Personality | What to borrow |
|---|---|---|
| Figma | Clean, flat, tool-first | Panel organization, icon consistency |
| Spline | Dark, immersive, creative | Canvas depth, brand confidence |
| SketchUp Web | Neutral, architectural | Tool clarity, spatial vocabulary |
| Linear | Ultra-refined, dark-first | Token discipline, density |

---

### 1.2 Logo Mark

**Current:** `AructMark` SVG component — geometric stroke shape, `strokeWidth="1.75"`, adaptive to `currentColor`.

**What's good:** Already vector, already theme-aware via `currentColor`, clean geometric approach.

**Recommended refinements:**
- Ensure mark reads at 16px (favicon size) — test with a 16x16 export
- `strokeWidth` should scale: use `strokeWidth="1.5"` for sizes ≥ 20px, consider filled version for ≤ 16px
- Logo lockup: mark + wordmark at `gap-2.5` (10px) — current value is correct ✅
- Wordmark: `font-semibold` (600 weight) + `tracking-tight` — current is correct ✅

**Logo usage zones:**
| Context | Size | Treatment |
|---|---|---|
| AppSidebar | 20px mark + `text-sm` wordmark | Full lockup |
| Editor top bar | 20px mark + `text-sm` wordmark | Full lockup |
| Mobile header | 20px mark + `text-sm` wordmark | Full lockup |
| Favicon | 16px mark only | Filled variant |
| OG image | 40px mark + `text-2xl` wordmark | Centered |

---

## 2. Color System

### 2.1 Principles

1. **OKLch throughout** — perceptually uniform, dark/light modes produce equal-contrast pairs
2. **Chroma discipline** — backgrounds near-zero chroma, UI accents low chroma, brand high chroma
3. **Brand tint** — all neutrals carry a hairline `H=264` (indigo) chroma to feel cohesive
4. **Three surface layers** — background → panel/sidebar → card/popover, each step +0.025L apart

### 2.2 Full Token Specification

#### Light Mode Surfaces
```css
--background:        oklch(0.985 0.003 80);   /* Warm off-white, blueprint paper */
--panel:             oklch(0.975 0.003 264);  /* Panel bg — slight indigo tint */
--card:              oklch(0.995 0.002 264);  /* Card/popover bg */
--card-foreground:   oklch(0.12 0.010 264);  /* Near-black with indigo ink feel */
--popover:           oklch(0.998 0.001 264);
--popover-foreground: oklch(0.12 0.010 264);
```

#### Light Mode Text
```css
--foreground:        oklch(0.12 0.010 264);  /* Primary text — dark indigo-tinted */
--muted-foreground:  oklch(0.52 0.008 264);  /* Secondary text */
--placeholder:       oklch(0.68 0.005 264);  /* Input placeholder */
```

#### Light Mode Borders & Inputs
```css
--border:            oklch(0.87 0.006 264);  /* Subtle indigo-tinted border */
--border-strong:     oklch(0.78 0.010 264);  /* Focus rings, active borders */
--input:             oklch(0.93 0.004 264);  /* Input background */
--ring:              oklch(0.55 0.22 264);   /* Focus ring = brand color */
```

#### Dark Mode Surfaces  
```css
--background:        oklch(0.09 0.012 264);  /* Deep dark — blueprint night */
--panel:             oklch(0.12 0.010 264);  /* Panel bg */
--card:              oklch(0.15 0.008 264);  /* Card/popover bg */
--card-foreground:   oklch(0.96 0.005 80);  /* Warm white text */
--popover:           oklch(0.17 0.007 264);
--popover-foreground: oklch(0.96 0.005 80);
```

#### Dark Mode Text
```css
--foreground:        oklch(0.96 0.005 80);   /* Warm white */
--muted-foreground:  oklch(0.58 0.006 264);  /* Dim text */
--placeholder:       oklch(0.42 0.005 264);  /* Dark placeholder */
```

#### Dark Mode Borders
```css
--border:            oklch(1 0 0 / 0.09);   /* Keep existing — works well ✅ */
--border-strong:     oklch(1 0 0 / 0.18);   /* Strong border */
--input:             oklch(1 0 0 / 0.12);   /* Keep existing ✅ */
--ring:              oklch(0.72 0.18 264);  /* Keep existing ✅ */
```

#### Brand (Both Modes — Same as Current ✅)
```css
/* Light */
--brand:             oklch(0.55 0.22 264);  /* ✅ keep */
--brand-hover:       oklch(0.48 0.22 264);  /* ✅ keep */
--brand-muted:       oklch(0.92 0.07 264);  /* Slightly deeper than current */
--brand-foreground:  oklch(1.0 0 0);        /* ✅ keep */

/* Dark */
--brand:             oklch(0.72 0.18 264);  /* ✅ keep */
--brand-hover:       oklch(0.78 0.16 264);  /* ✅ keep */
--brand-muted:       oklch(0.20 0.08 264);  /* Slightly more chroma */
--brand-foreground:  oklch(0.10 0 0);       /* ✅ keep */
```

#### Sidebar (Editor-specific)
```css
/* Light */
--sidebar:                    oklch(0.975 0.004 264);  /* Same as --panel */
--sidebar-foreground:         oklch(0.12 0.010 264);
--sidebar-accent:             oklch(0.90 0.07 264);    /* Active item bg */
--sidebar-accent-foreground:  oklch(0.40 0.18 264);    /* Active item text */
--sidebar-border:             oklch(0.87 0.006 264);

/* Dark */
--sidebar:                    oklch(0.11 0.011 264);   /* Panel bg */
--sidebar-foreground:         oklch(0.96 0.005 80);
--sidebar-accent:             oklch(0.20 0.07 264);
--sidebar-accent-foreground:  oklch(0.72 0.18 264);
--sidebar-border:             oklch(1 0 0 / 0.08);     /* ✅ keep */
```

#### Semantic Colors (Keep Existing, Minor Adjustments)
```css
/* Success — same as current ✅ */
--success:          oklch(0.52 0.17 145);
--success-muted:    oklch(0.94 0.05 145);

/* Warning — same as current ✅ */
--warning:          oklch(0.62 0.18 55);
--warning-muted:    oklch(0.96 0.05 55);

/* Destructive — same as current ✅ */
--destructive:      oklch(0.58 0.24 27);

/* Purple — keep for plan badges ✅ */
--purple:           oklch(0.52 0.22 300);
--purple-muted:     oklch(0.94 0.05 300);
```

### 2.3 Canvas Background (Editor-specific)

```css
/* Used as Three.js scene background */
--canvas-bg-light: oklch(0.92 0.004 80);   /* Warm light gray */
--canvas-bg-dark:  oklch(0.11 0.010 264);  /* Deep dark indigo */
```

---

## 3. Typography

### 3.1 Current State Assessment

**Barlow** (loaded via Google Fonts) is the primary typeface. Assessment:
- ✅ Wide weight range (300–900)
- ✅ Good Latin coverage
- ⚠️ Semi-condensed default feels narrow at small sizes
- ⚠️ Not optimized for tool UI density
- ✅ Works — no urgent need to replace

**Recommendation:** Keep Barlow but define explicit weights and a formal type scale. The problem isn't the font — it's the lack of system.

### 3.2 Type Scale

```
Size   │ px  │ lh  │ weight │ Usage
───────┼─────┼─────┼────────┼──────────────────────────────
2xs    │ 10  │ 1.4 │ 500    │ Plan badges, legal/meta labels
xs     │ 11  │ 1.4 │ 400    │ Timestamps, input hints, tooltips
sm     │ 12  │ 1.5 │ 400    │ Most UI labels, sidebar nav, toolbar
base   │ 14  │ 1.6 │ 400    │ Body text, panel content
lg     │ 16  │ 1.5 │ 500    │ Section headings inside panels
xl     │ 20  │ 1.3 │ 600    │ Page headings (/scenes, /pricing)
2xl    │ 24  │ 1.2 │ 700    │ Hero display text
3xl    │ 32  │ 1.1 │ 700    │ Large marketing headings
```

### 3.3 Weight Usage Rules

| Weight | Name | Usage |
|---|---|---|
| 400 | Regular | Body, descriptions, secondary labels |
| 500 | Medium | UI controls, nav items, card titles |
| 600 | Semibold | Page headings, CTA buttons, plan names |
| 700 | Bold | Logo wordmark, hero headings |

Current code uses `font-bold` (700) for nav items — this is too heavy. Should be `font-medium` (500).

### 3.4 Letter-Spacing Rules

| Context | Token | Value |
|---|---|---|
| Body text | default | 0em |
| UI labels (sm) | `tracking-normal` | 0em |
| UPPERCASE labels | `tracking-widest` | 0.08em |
| Logo wordmark | `tracking-tight` | -0.025em |
| Display headings | `tracking-tighter` | -0.04em |

Remove all inline `style={{ letterSpacing: '...' }}` — replace with Tailwind tracking utilities.

---

## 4. Spacing & Sizing

### 4.1 Base Grid: 4px

All spacing must be multiples of 4px. Odd values like `py-2.5` (10px) should be avoided unless necessary for optical alignment.

### 4.2 Component Spacing Reference

```
Component          │ Padding        │ Gap
───────────────────┼────────────────┼──────────────
Sidebar nav item   │ px-3 py-2      │ gap-2 (8px)
Toolbar button     │ p-2 (8px)      │ —
Icon rail button   │ p-2 (8px)      │ gap-1 (4px)
Card               │ p-4 (16px)     │ gap-3 (12px)
Panel section      │ px-3 py-4      │ gap-2 (8px)
Dialog             │ p-6 (24px)     │ gap-4 (16px)
Top bar            │ px-4 h-12      │ gap-3 (12px)
```

### 4.3 Layout Widths

| Token | Value | Usage |
|---|---|---|
| `--sidebar-width` | 240px (w-60) | Public page sidebar |
| `--rail-width` | 48px (w-12) | Editor icon rail |
| `--panel-width-default` | 280px | Editor resizable panel |
| `--panel-width-min` | 240px | Panel collapse threshold |
| `--panel-width-max` | 800px | Panel max |
| `--topbar-height` | 48px (h-12) | Unified top bar |
| `--content-max-width` | 1280px | Public page max-width |

---

## 5. Border Radius

Simplify from computed variants to explicit named scale:

```css
--radius-xs:  3px;   /* Checkboxes, radio buttons, small badges */
--radius-sm:  5px;   /* Inputs, small buttons, chips */
--radius-md:  8px;   /* Default — cards, large buttons, panels */
--radius-lg:  12px;  /* Dialogs, sheet headers, search bars */
--radius-xl:  16px;  /* Large sheets, hero sections */
--radius-full: 9999px; /* Pills — use sparingly and intentionally */
```

Current `--radius: 0.5rem` (8px) = `--radius-md`. Keep as default.

---

## 6. Elevation (Simplified)

Current: 6 levels with complex stacked shadows. Most UI only needs 3 meaningful levels.

### 6.1 New 3-Level System

```css
/* Level 1 — Subtle, for panels and cards */
--el-1: 0 0 0 1px var(--border), 0 1px 3px oklch(0 0 0 / 0.06);

/* Level 2 — Medium, for dropdowns, tooltips, popovers */
--el-2: 0 0 0 1px var(--border), 0 4px 16px oklch(0 0 0 / 0.10), 0 1px 4px oklch(0 0 0 / 0.06);

/* Level 3 — Heavy, for modals and command palette */
--el-3: 0 0 0 1px var(--border), 0 12px 40px oklch(0 0 0 / 0.16), 0 4px 12px oklch(0 0 0 / 0.08);
```

**Dark mode overrides:**
```css
.dark {
  --el-1: 0 0 0 1px var(--border), inset 0 1px 0 oklch(1 0 0 / 0.04), 0 1px 3px oklch(0 0 0 / 0.20);
  --el-2: 0 0 0 1px var(--border), inset 0 1px 0 oklch(1 0 0 / 0.05), 0 8px 24px oklch(0 0 0 / 0.30);
  --el-3: 0 0 0 1px var(--border), inset 0 1px 0 oklch(1 0 0 / 0.06), 0 20px 60px oklch(0 0 0 / 0.40);
}
```

Usage:
| `el-1` | Cards, panels, sidebar |
| `el-2` | Dropdowns, tooltips, context menus |
| `el-3` | Modals, command palette, sheets |

Remove `el-4` and `el-5` — too heavy, creates "floating app" aesthetic that's outdated.

---

## 7. Icons

### 7.1 Icon System

**Primary library:** Lucide React (already in use) — continue  
**Size scale:**

| Context | Size | Stroke width |
|---|---|---|
| Toolbar buttons | 16px (w-4 h-4) | 1.5 |
| Nav items, icon rail | 18px (w-4.5 h-4.5) | 1.5 |
| Section headings | 20px (w-5 h-5) | 1.5 |
| Hero / empty states | 32px (w-8 h-8) | 1.25 |

### 7.2 Replace Bitmap Icons in Icon Rail

**Current problem:** Icon rail tabs use `.webp` images from `SIDEBAR_TABS` config.

**Solution:** Replace with Lucide SVG icons. Use the existing `mobileIcon` pattern but apply it everywhere.

```tsx
// Current (webp)
icon: <Image src="/icons/build.webp" className="h-8 w-8" ... />

// Replacement (SVG, theme-aware)
icon: <Hammer className="h-5 w-5" />
```

The `mobileIcon` field already has SVG icons — reuse them as the primary icon source.

---

## 8. Motion & Animation

### 8.1 Principles
- Transitions communicate state change, not personality
- Duration: fast (100ms) for micro-interactions, medium (150ms) for panels/drawers
- No animations without purpose

### 8.2 Duration Tokens

```css
--duration-instant: 0ms;     /* No animation — keyboard-driven interactions */
--duration-fast:    100ms;   /* Hover states, opacity toggles */
--duration-base:    150ms;   /* Panel resize, sidebar collapse */
--duration-slow:    250ms;   /* Drawer open/close, modal enter */
```

### 8.3 Easing

```css
--ease-default: cubic-bezier(0.2, 0, 0, 1);     /* Apple-like: fast start, soft end */
--ease-enter:   cubic-bezier(0.0, 0.0, 0.2, 1); /* Elements entering the screen */
--ease-exit:    cubic-bezier(0.4, 0.0, 1, 1);   /* Elements leaving the screen */
--ease-spring:  cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Springy: tooltips, badges */
```

---

## 9. Flat & Elegant: Principles Applied

The user wants "flat and more elegant." Specifically this means:

### 9.1 Remove Decorative Layering
- No `borderRadius` on the canvas container (the 16px top-left radius on right column)
- No heavy multi-layer box shadows on structural elements
- Flat panels separated by a single 1px border, not by shadows

### 9.2 Use Borders as Structure
```css
/* Structural dividers */
border-r border-border   /* Sidebar from canvas */
border-b border-border   /* Top bar from content */
```

Shadows only on floating elements (popovers, tooltips, modals) — elements that are truly above the surface.

### 9.3 Reduce Chrome
- Remove backdrop blur from structural elements (sidebar, icon rail) — blur is for floating overlays
- Keep `backdrop-blur-md` on toolbars (they are floating overlays above the canvas) ✅
- Remove `backdrop-blur-sm` from mobile header (it's a structural element, not a floating one)

### 9.4 Color Discipline
- Background and panels should be near-identical — subtle distinction, not heavy contrast
- Only one "pop" color per screen: brand color for CTAs and active states
- No gradient fills on structural UI elements
