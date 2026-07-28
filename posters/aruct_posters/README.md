# Aruct Marketing Posters — Delivered Assets

Vector SVG posters built from the briefs in `00-brand-reference.md` through
`08-social-media-series.md`. Every file is a standalone SVG — scales to any
size (web, print, A3) with no quality loss. Open directly in a browser,
or import into Figma/Illustrator to export PNG/PDF at whatever resolution
you need.

## Coverage by folder

| Folder | Formats actually produced |
|---|---|
| `01-brand-awareness/` | Dark 16:9, Light 16:9, Vertical 9:16 |
| `02-pricing-comparison/` | Dark 16:9, 1:1 square |
| `03-free-tier-lead-gen/` | 1:1 square, 4:5 Instagram, 1.91:1 link preview |
| `04-pro-upgrade/` | Dark 16:9, 1:1 square, in-app modal (600×440) |
| `05-team-enterprise/` | Dark 16:9, LinkedIn 1200×628, A3 print portrait |
| `06-feature-mcp-ai/` | Dark 16:9, 1:1 square (near-black/cyan terminal palette, by design) |
| `07-launch-promo/` | One 16:9 per concept: A (first month free), B (annual discount), C (student), D (switch from competitor) |
| `08-social-media-series/` | 1:1 square only, all 8 posts (01–08) |

## Known gaps / things to ask for if you need them

- **07 and 08 are 16:9 / 1:1 only** — no 9:16 Stories or A3 print variants were
  built for these yet. Say which specific ones you're actually running and
  I'll adapt those rather than generating every format for all 12 posters.
- **Colophon deviations from the brief**, made deliberately and noted at the
  time:
  - Poster 06 (MCP/AI) uses a near-black background with cyan/green accents
    instead of the standard navy/blue — the brief asked for this explicitly
    for the dev audience.
  - Posters C and D in `07-launch-promo/` use an honest badge ("STUDENT
    PROGRAM" / "PRICE COMPARISON") instead of a fake countdown/expiry badge,
    since neither offer is actually time-limited per their own copy.
  - Poster 05's hero visual is one shared browser window with three
    colored collaborator cursors, rather than three separate windows as the
    AI-image-prompt literally suggested — three windows would undercut the
    "one shared scene" headline.

## A note on QA

These were built by hand-computing SVG coordinates rather than laying them
out visually, and for much of this session my own image-preview tool wasn't
rendering results back to me to eyeball — I checked structure via pixel/color
sampling and coordinate math instead of by looking at each one. They should
be in good shape, but it's worth a scan through the batch for any tight text
spacing before these go into production, particularly the longer feature
lists (Team, Pro) and the two-column layouts (LinkedIn, pricing square).
