# Aruct Editor — Brand Guide

> Logo, colour swatches, typography specimens, and usage rules.
> Implementation details live in `DESIGN-SYSTEM.md`.

---

## Identity at a Glance

```
Name:         Aruct Editor
Full form:    Arch Construct Editor
Tagline:      Build in three dimensions.
Brand colour: Blueprint Indigo
Primary font: Barlow
Domain:       Tool for spatial design professionals
```

---

## Logo

### Concept — "The Section Cut"

An architectural section cut is the defining act of spatial understanding: slicing through a building to reveal its interior. The Aruct mark is a geometric cube bisected by a horizontal datum line — the 3D form becoming a floor plan at the cut. This captures the product's core duality: 3D design with 2D precision.

### Logomark (SVG)

The mark is a minimal isometric cube with a horizontal section-cut line crossing its face:

```
         ╱─────╲
        ╱       ╲
       ╱─────────╲    ← section-cut line (datum)
      │           │
      │           │
       ╲─────────╱

Size: 24×24px standard, 16×16px favicon (top-face diamond)
Stroke: 2px, round cap/join, no fill
Colour: foreground in context (white on dark, near-black on light)
```

**Construction rules:**
- All angles: 30° or 90° only (true isometric)
- Section line: full width, weight matches cube stroke
- Minimum size: 16px (favicon — simplify to top-face diamond)
- Clear space: 0.5× mark height on all four sides

### Wordmark

```
ARUCT EDITOR

Font: Barlow 700
Tracking: -0.02em
Case: Sentence case  →  "Aruct Editor" (not "ARUCT EDITOR")
Size ratio: Mark height = cap-height of wordmark
```

### Logo Variants

| Variant | When to use |
|---|---|
| Mark only | Favicon, app icon, avatar, watermark on 3D renders |
| Mark + "Aruct" | Sidebar header, loading screen, email header |
| Mark + "Aruct Editor" (stacked) | Marketing, OG images, README |
| Wordmark only | Text-only contexts (legal, tiny print) |

### Files to create

```
public/logo/
  mark.svg          24×24 stroke-based cube mark
  full.svg          mark + "Aruct Editor" horizontal lockup
  full-stacked.svg  mark + "Aruct" / "Editor" two-line lockup
  mark-dark.svg     white stroke version for dark backgrounds
  wordmark.svg      text only

public/
  favicon.svg       simplified 16×16 mark (top diamond face)
```

### Colour on logo

```
On light bg:     stroke = #222222 (foreground)
On dark bg:      stroke = #F8F8F8 (foreground-dark)
On brand bg:     stroke = #FFFFFF
Never:           Gradient fills on logo mark
Never:           Drop shadow on mark
```

---

## Colour Palette

### Primary Brand — Blueprint Indigo

```
Name:           Blueprint Indigo
Hex:            #4F46E5   (light mode)
Hex:            #818CF8   (dark mode — shifted for contrast)
OKLCH:          oklch(0.55 0.22 264)
Reference:      Prussian blue of architectural blueprints

Swatch:

  Light      Dark
  ████████   ████████
  #4F46E5    #818CF8
```

**Why indigo?**
Architectural blueprints use prussian blue — a colour associated with precision, technical craft, and professional drawings. Indigo is the modern, screen-optimised equivalent. It does not compete with the 3D viewport (which needs a neutral, uncoloured frame) and carries a sense of expertise without aggression.

### Full Palette

#### Neutrals

```
Surface (Light)
  Background  ████  #FAFAF8   oklch(0.995 0.002 100)
  Surface     ████  #FFFFFF   oklch(1.0   0     0)
  Muted       ████  #F4F4F5   oklch(0.96  0     0)

Surface (Dark)
  Background  ████  #141414   oklch(0.10  0     0)
  Surface     ████  #1E1E1E   oklch(0.14  0     0)
  Muted       ████  #27272A   oklch(0.18  0     0)

Text (Light)
  Foreground  ████  #222222   oklch(0.14  0     0)
  Secondary   ████  #666666   oklch(0.45  0     0)
  Muted       ████  #9A9A9A   oklch(0.62  0     0)

Text (Dark)
  Foreground  ████  #F8F8F8   oklch(0.97  0     0)
  Secondary   ████  #A1A1AA   oklch(0.70  0     0)
  Muted       ████  #71717A   oklch(0.52  0     0)

Borders (Light)
  Default     ────  #E5E5E5   oklch(0.90  0     0)
  Strong      ────  #C9C9C9   oklch(0.80  0     0)

Borders (Dark)
  Default     ────  rgba(255,255,255,0.09)
  Strong      ────  rgba(255,255,255,0.18)
```

#### Brand (Indigo)

```
  brand              ████  #4F46E5   light / #818CF8 dark
  brand-hover        ████  #4338CA   light / #93C5FD dark
  brand-muted        ████  #EEF2FF   light / #1E1B4B dark
  brand-foreground   ████  #FFFFFF   (text on brand bg)
```

#### Semantic

```
Success (Green)
  success            ████  #16A34A   light / #4ADE80 dark
  success-muted      ████  #F0FDF4   light / #052E16 dark

Warning (Amber)
  warning            ████  #D97706   light / #FCD34D dark
  warning-muted      ████  #FFFBEB   light / #292524 dark

Destructive (Red)
  destructive        ████  #DC2626   light / #F87171 dark
  destructive-muted  ████  #FFF1F2   light / #2A0A0A dark

Purple (Team plan)
  purple             ████  #7C3AED   light / #A78BFA dark
  purple-muted       ████  #F5F3FF   light / #1A1036 dark
```

### Do / Don't

```
✓  Use brand colour for: CTAs, active nav, focus rings, plan badges, links
✓  Use success for: promo tags, checkmark lists, success states
✓  Use warning for: admin-only nav items, subscription warnings
✓  Use muted variants for: chip backgrounds, tag backgrounds
✗  Never use brand colour as: large background areas
✗  Never mix brand colour with: hardcoded Tailwind colours (blue-600, orange-600)
✗  Never change brand colour per plan tier
```

---

## Typography

### Primary Typeface — Barlow

**Why Barlow?**
Geometric, constructed, clean. Barlow's letterforms echo the precision of architectural drawings — right angles, consistent proportions, no flourish. It reads at small sizes (11px panel labels) and commands attention at display sizes (36px headlines).

```
Barlow — Google Fonts (loaded via next/font/google)
Weights used: 400, 500, 600, 700, 800

400 Regular
The quick brown fox jumps over the lazy dog.

500 Medium
The quick brown fox jumps over the lazy dog.

600 SemiBold
The quick brown fox jumps over the lazy dog.

700 Bold
The quick brown fox jumps over the lazy dog.

800 ExtraBold
THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.
```

### Monospace — Geist Mono

Used for: coordinates, measurements, keyboard shortcuts, code blocks, numerical inputs.

```
Geist Mono (local variable font)
Loaded from apps/editor/app/fonts/GeistMonoVF.woff

48.5m²   X: 12.340   Y: -4.120   Z: 0.000
Cmd + Shift + S  →  Save scene
const nodeId = createNode('wall', { height: 2.4 })
```

### Font Usage Map

| Context | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| Page title | Barlow | 700 | 24px (2xl) | -0.02em |
| Hero headline | Barlow | 800 | 36px (4xl) | -0.03em |
| Section header | Barlow | 600 | 17px (lg) | -0.01em |
| Body paragraph | Barlow | 400 | 15px (base) | 0 |
| Nav label | Barlow | 500 | 13px (sm) | 0 |
| Badge/chip | Barlow | 700 | 10–11px (xs) | 0.02em |
| Input label | Barlow | 500 | 13px (sm) | 0 |
| Placeholder | Barlow | 400 | 13px (sm) | 0 |
| Measurement | Geist Mono | 400 | 12px | 0 |
| Keyboard shortcut | Geist Mono | 500 | 11px | 0 |
| Code snippet | Geist Mono | 400 | 13px | 0 |

---

## Iconography

### Library — Lucide React (current, keep)

Lucide is a good choice: geometric, consistent stroke width (1.5px), 24×24 grid, MIT licensed.

**Usage rules:**
```
Size in nav:       h-4 w-4  (16px)
Size in toolbar:   h-4 w-4  (16px)
Size in headings:  h-5 w-5  (20px)
Size in hero:      h-6 w-6  (24px)

Stroke:   1.5px (Lucide default — do not override)
Colour:   currentColor (inherits text colour — do not hardcode)
```

### Editor Sidebar Tab Icons (.webp)

The current `.webp` icon images in the rail tabs (scene.webp, build.webp, couch.webp, settings.webp) are raster and don't respond to dark mode. Long-term:
- Replace with SVG equivalents
- Active state: apply `filter: brightness(0) saturate(1) invert(0)` in dark mode
- Or switch to Lucide icons (simpler)

---

## Tone of Voice

### In the UI

```
Action labels:
  ✓  "Create scene"          not "Create a new scene"
  ✓  "Open editor"           not "Launch the editor"
  ✓  "Upgrade to Pro"        not "Upgrade your plan to Pro"
  ✓  "Sign in"               not "Please sign in to continue"
  ✓  "No scenes yet"         not "You don't have any scenes yet"

Error messages:
  ✓  "Invalid email or password"          not "Authentication failed"
  ✓  "Network error. Try again."          not "A network error occurred. Please try again."
  ✓  "Payment verified but failed. Contact support."  (specific, honest)

Empty states:
  ✓  "No scenes yet. Start with a blank canvas."
  ✓  "Nothing here yet."     (short, not apologetic)

Tooltips:
  ✓  "Delete scene"          (action — what the button does)
  ✓  "3D view"               (label — what the mode is)
```

### Brand voice pillars

| Pillar | Example |
|---|---|
| Precise | "3 nodes · Updated 2 days ago" — exact, no fluff |
| Confident | "Build in three dimensions." — declarative, not hedging |
| Respectful | No exclamation marks on routine UI, no "Great!" feedback |
| Minimal | Every word earns its place |

---

## Motion

### Principles
- Purpose-driven: motion explains change, not decorates it
- Fast: 100–200ms for micro-interactions, 200–300ms for transitions
- Easing: `ease-out` for entering elements, `ease-in` for exiting

### Scale

```
Instant (0ms):       Value updates, counter increments
Micro (100ms):       Button press, icon swap, badge appear
Fast (150ms):        Hover state, tooltip show/hide
Medium (200ms):      Dropdown open, sidebar active state
Slow (300ms):        Modal open, page-level transitions
Deliberate (400ms):  Sidebar drawer slide-in
```

### Specific interactions

```
Card hover:        box-shadow lift + transform scale(1.01), 150ms ease-out
Nav item hover:    background transition, 100ms ease-out
Button press:      scale(0.97), 80ms ease-in, then scale(1.0) 80ms ease-out
Sidebar active:    background + text colour, 120ms ease-out
Modal open:        opacity 0→1 + translateY(8px→0), 250ms ease-out
Drawer slide:      translateX(-100%→0), 300ms ease-out
Theme switch:      CSS variable transition, 200ms ease (all: colour change)
```

### Reduced motion

Already in `globals.css` — good. Honour `prefers-reduced-motion`.

---

## Spacing & Border Radius Summary

### Radius decisions

```
Text/badge pill:    rounded-full    (9999px)  — plan badges, chips, tags
Input fields:       rounded-md      (8px)     — clean, modern
Buttons:            rounded-md      (8px)     — matches inputs
Cards:              rounded-xl      (16px)    — generous, modern
Dropdowns:          rounded-lg      (12px)    — balanced
Modals:             rounded-2xl     (24px)    — prominent
Sidebar:            rounded-none    (0px)     — flush to edge
Inline code:        rounded-sm      (4px)     — tight
```

### Do / Don't on radius

```
✓  Same radius for buttons and inputs on the same page
✓  Cards larger radius than buttons
✓  Squircle (.rounded-smooth) only for app icon / launch screens
✗  Don't mix rounded-md and rounded-lg on sibling buttons
✗  Don't apply rounded-2xl to form inputs (too large)
```
