# Design System — Index

Three documents cover the full design overhaul:

| File | What's inside |
|---|---|
| [BRAND.md](BRAND.md) | Logo concept, colour swatches, typography specimens, iconography, tone of voice, motion |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Full token system (CSS variables), component patterns, responsive layout, dark-mode toggle implementation, implementation priority order |
| [UI-AUDIT.md](UI-AUDIT.md) | Current-state diagnosis — exactly what's broken, which files, which lines, and priority to fix |

## TL;DR — The 5 biggest issues

1. **No dark/light toggle** — CSS variables exist but no `ThemeProvider` or toggle button; users are stuck in one mode
2. **Zero brand colour** — every button, active state, and CTA uses achromatic black/white; no identity
3. **Broken mobile layout** — `AppSidebar` is always visible at 240px; phones get a broken sidebar-only view
4. **Generic logo** — a Lucide `<Box />` icon with text; no logomark, no favicon update, no brand presence
5. **Hardcoded colour classes** — `bg-blue-600`, `text-orange-600`, `bg-green-100` scattered in components; not themeable and break dark mode

## Quick start for a developer

Implement in this order:

```
1. globals.css      → add --brand token + semantic tokens
2. layout.tsx       → add ThemeProvider (next-themes)
3. app-sidebar.tsx  → theme toggle + active nav brand colour
4. public/logo/     → new SVG logomark
5. app-sidebar.tsx  → replace <Box /> with new logomark
6. app-shell.tsx    → mobile drawer + sticky header
7. pricing-client   → replace hardcoded colours with tokens
```

That's P0 + P1 — gets the platform from "functional but blank" to "professional and responsive".
