# UI Audit — Aruct Editor

> Current state diagnosis. Every gap mapped to a fix in `DESIGN-SYSTEM.md`.

---

## 1. Responsiveness

### Broken

| Surface | Problem | File |
|---|---|---|
| `AppShell` | Fixed `flex min-h-screen` — no mobile breakpoint, sidebar always visible, kills small screens | `components/app-shell.tsx:7` |
| `AppSidebar` | Hard-coded `w-60` — no collapse, no hamburger, no overlay on mobile | `components/app-sidebar.tsx:60` |
| Pricing grid | `md:grid-cols-3` starts at 768px — 768–1023px renders 3 narrow cards, cards clip on iPad | `app/pricing/pricing-client.tsx:249` |
| Scene grid | `sm:grid-cols-2 lg:grid-cols-3` is fine but padding `px-8` is too wide on mobile — no `px-4 sm:px-8` | `app/scenes/page.tsx:52` |
| Login/Signup | Centred single-column — fine on mobile, no issue |  |
| Editor canvas | Has mobile bottom-sheet already — strongest mobile story in the product |  |

### Missing responsive patterns
- No mobile navigation drawer (hamburger → slide-over sidebar)
- No sticky header on mobile for AppShell pages
- No `container mx-auto` max-width guard on ultra-wide screens (>1600px content stretches)

---

## 2. Dark / Light Mode

### Current state
- CSS variables fully defined for both modes (`globals.css:67–136`)
- Dark mode activates via `.dark` class on `<html>` (`@custom-variant dark (&:is(.dark *))`)
- **No toggle in the UI anywhere** — users cannot switch modes
- `<html>` element never gets `.dark` class from code (no `ThemeProvider`)
- Result: dark mode CSS exists but is permanently inaccessible to users

### Missing
- `ThemeProvider` using `next-themes` or equivalent
- Theme toggle button (sun/moon icon) in AppSidebar footer
- `suppressHydrationWarning` on `<html>` to prevent flash
- System preference detection (`prefers-color-scheme`)

---

## 3. Visual Identity / Branding

### Logo
- Current: `<Box className="h-5 w-5" />` Lucide icon + "Aruct Editor" text
- A box icon is generic, used by dozens of tools
- No logomark that works standalone (favicon, og:image, splash screen)
- No SVG wordmark

### Color
- 100% achromatic oklch scale — zero hue, zero brand
- Only colour that appears: `bg-blue-600` (Most Popular badge, pricing) — hardcoded, not themed
- Admin nav uses `text-orange-600` — hardcoded, not themed
- Destructive red is the only intentional semantic colour
- No primary brand colour in any interactive element
- CTA buttons use `bg-foreground` (black/white) — technically correct but visually dead

### Typography
- Barlow is good: geometric, clean, architectural feel ✓
- `font-bold text-2xl` headings and `font-bold text-4xl` (pricing) — no scale contract
- No display/hero weight (Barlow 800/900 never used)
- Line heights unspecified — browser defaults vary

### Spacing / Layout
- `px-8 py-8` on scenes page (32px) — inconsistent with login's `px-4`
- No documented spacing scale contract
- Border radius: 0.625rem everywhere — no system for when to use which radius
- `rounded-smooth` (squircle) defined but never used in AppShell pages

### Visual depth
- All panels sit at same visual elevation — no hierarchy
- Sidebar uses `bg-background/95` but no shadow or elevation separation
- Cards: `rounded-xl border border-border/60 border-dashed` — weak visual weight
- No `box-shadow` design tokens defined

---

## 4. Creativity / Distinctiveness

### What competitors do that Aruct doesn't
| Competitor | Signature move |
|---|---|
| Figma | Left panel icon tabs, floating property inspector, colour accent on selected state |
| Spline | Dark-native, gradient mesh background on marketing, coloured tool icons |
| Linear | Aggressive whitespace, monochrome + violet accent, pixel-perfect micro-animations |
| SketchUp | Tool rail with icon + label, breadcrumb hierarchy |

### Aruct's missed opportunities
1. **Blueprint accent** — an indigo/blueprint-blue brand colour would reference architectural drawings without feeling generic
2. **Editor rail** — the icon tabs in `page.tsx` (`SIDEBAR_TABS`) use `.webp` images with no active/hover state color treatment
3. **Empty states** — scene grid empty state is a plain dashed border with grey text — no illustration or character
4. **Page transitions** — none; hard cuts between pages
5. **Micro-interactions** — sidebar nav hover is `hover:bg-accent` (light grey) — no transform, no colour shift, no icon animation

---

## 5. Specific Colour Hardcodes to Fix

```
pricing-client.tsx:268  bg-blue-600        → var(--color-brand) 
pricing-client.tsx:289  bg-green-100       → var(--color-success-muted)
pricing-client.tsx:289  text-green-700     → var(--color-success)
pricing-client.tsx:303  text-green-600     → var(--color-success)
app-sidebar.tsx:95      text-orange-600    → var(--color-warning) 
app-sidebar.tsx:95      hover:bg-orange-50 → var(--color-warning-muted)
app-sidebar.tsx:28      bg-blue-100        → var(--color-brand-muted)
app-sidebar.tsx:28      text-blue-700      → var(--color-brand)
app-sidebar.tsx:29      bg-violet-100      → var(--color-purple-muted)
app-sidebar.tsx:29      text-violet-700    → var(--color-purple)
```

---

## 6. Priority Matrix

| Fix | Impact | Effort | Priority |
|---|---|---|---|
| Dark/light toggle + ThemeProvider | Very high (users expect it) | Low (1 day) | P0 |
| Mobile sidebar (drawer/overlay) | High (unusable on phone) | Medium (2 days) | P0 |
| Brand colour token + CTA buttons | High (identity) | Low (hours) | P0 |
| Fix hardcoded colours | Medium | Very low | P1 |
| Logo / wordmark | High (brand) | Medium | P1 |
| Pricing page responsive tweaks | Medium | Low | P1 |
| Empty state illustrations | Medium (delight) | Medium | P2 |
| Micro-interactions | Low-medium | Medium | P2 |
| Ultra-wide max-width container | Low | Very low | P2 |
| Page transitions | Low | Low | P3 |
