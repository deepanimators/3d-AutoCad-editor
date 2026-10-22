# UI / UX — Features and Gaps

Source: `apps/editor/components/`, `packages/editor/src/`

## Shell Layout

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar  [logo | scene name | save | share | user]     │
├──────┬──────────────────────────────────────┬───────────┤
│      │                                      │           │
│ Side │   3D Viewer / 2D Floorplan           │ Right     │
│ bar  │   (toggleable)                       │ Panel     │
│      │                                      │           │
├──────┴──────────────────────────────────────┴───────────┤
│  Viewer Toolbar  [tools | view modes | levels]          │
└─────────────────────────────────────────────────────────┘
```

### Components
| Component | File | Notes |
|---|---|---|
| Top bar | `top-bar.tsx` | Global: scene name, save, share, user menu |
| Editor top bar | `editor-top-bar.tsx` | Editor-specific controls |
| App sidebar | `app-sidebar.tsx` | Left sidebar: tools, panels nav |
| Viewer toolbar | `viewer-toolbar.tsx` | In-canvas tools + view mode switcher |
| App shell | `app-shell.tsx` | Outer shell layout |
| Mobile shell | `mobile-shell-client.tsx` | Responsive mobile layout |
| Scene card | `scene-card.tsx` | Scene list card |
| Scene loader | `scene-loader.tsx` | Loading state for scene |
| Theme toggle | `theme-toggle.tsx` | Light / dark mode |
| Toolbar tooltip | `toolbar-tooltip.tsx` | Tool hover tooltip |
| Presence bar | `presence-bar.tsx` | Online collaborators |
| Save button | `save-button.tsx` | Manual save with dirty indicator |

### Right Panels
| Panel | File | Trigger |
|---|---|---|
| Mesh editor | `mesh-editor-panel.tsx` | Select mesh node |
| Terrain | `terrain-panel.tsx` | Select terrain node |
| Curtain wall | `curtain-wall-panel.tsx` | Select curtain-wall node |
| Floorplan construction preflight | `floorplan-construction-preflight.tsx` | Before 3D model generation |
| Zone rollup | `zone-rollup-panel.tsx` | Zone tab |
| BOM | `bom-panel.tsx` | BOM tab |
| Schedules | `schedules-panel.tsx` | Schedules tab |
| Sun study | `sun-study-panel.tsx` | Sun tab |
| Render | `render-panel.tsx` | Render tab |
| Energy | `energy-panel.tsx` | Energy tab |
| Sections | `sections-panel.tsx` | Sections tab |
| Version history | `version-history-panel.tsx` | History tab |
| Collab | `collab-panel.tsx` | Collab tab |
| Point cloud | `point-cloud-panel.tsx` | Scan/import |
| Texture manager | `texture-manager-panel.tsx` | Materials tab |
| Unified plugins | `unified-plugins-panel.tsx` | Plugins tab |

### Build Tab
- `build-tab.tsx` — constructs/analyzes the building model from the scene graph

---

## Keyboard Shortcuts

Managed via `floorplan-hotkey-handlers.tsx` in the 2D editor. Known shortcuts include:
- `Escape` — cancel current operation / deselect
- `Delete` / `Backspace` — delete selected node
- `Cmd/Ctrl+Z` — undo
- `Cmd/Ctrl+Shift+Z` — redo
- `Cmd/Ctrl+S` — save
- Tool hotkeys (varies by registered tool)

**Gaps:**
| Gap | Priority |
|---|---|
| Keyboard shortcut help overlay (press `?`) | High |
| Customizable keyboard shortcuts | Medium |
| Vim-style command palette (`⌘K`) | Medium |
| Shortcut cheat sheet in onboarding | Medium |

---

## Mobile Support

- `mobile-shell-client.tsx` — responsive shell for mobile
- Touch events handled in the viewer and 2D editor
- Pinch-to-zoom in 3D viewer
- Tap-to-select

**Mobile Gaps:**
| Gap | Priority |
|---|---|
| Touch-optimized tool panel (bottom sheet) | High |
| Larger tap targets for tools | High |
| Landscape / portrait responsive layout | Medium |
| iPad Pro as primary design surface | Medium |
| Touch drag for 2D wall drawing | Medium |
| Haptic feedback | Low |

---

## Onboarding

**Current state:** No onboarding flow found in the codebase. Users land in the editor without guidance.

**Missing:**
| Feature | Priority |
|---|---|
| First-run tutorial / walkthrough | High |
| Interactive tutorial (guided first scene) | High |
| Sample scenes (browse before creating) | Medium |
| Video tutorials embedded in app | Medium |
| Contextual help tooltips | Medium |
| Blank state (empty scene → suggestions) | Medium |

---

## Search and Navigation

**Current state:** No global search within the editor.

**Missing:**
| Feature | Priority |
|---|---|
| Node search (find by name, type) | High |
| Outliner / scene tree panel | High |
| Jump to node (select → camera snap to it) | Medium |
| Filter nodes by type in viewport | Medium |
| Recent scenes (home screen) | Medium — scene list exists |

---

## Undo / Redo

- `history-control.ts` in core store — manages undo stack
- `Cmd+Z` / `Cmd+Shift+Z` — undo/redo

**Gaps:**
| Gap | Priority |
|---|---|
| Visible undo history (list of actions) | Medium |
| Per-session persistent undo (survive reload) | Medium |
| Named checkpoints | Low |
| Selective undo (undo specific action, not stack-based) | Low |

---

## Notifications and Feedback

**Missing:**
| Feature | Priority |
|---|---|
| Toast notifications (save success, error) | High |
| Progress indicator for long operations (export, AI) | High |
| Error messages with actionable text | Medium |
| System notification (browser) on completion of background task | Low |

---

## Accessibility (a11y)

**No accessibility audit found.** Gaps:
| Gap | Priority |
|---|---|
| Screen reader labels on toolbar buttons | High |
| Keyboard-navigable tool selection | High |
| Color contrast ratio (WCAG AA) audit | High |
| Focus management in panels | Medium |
| Alternative to color-coded node types (pattern/icon) | Low |

---

## Performance / UX

| Gap | Priority | Notes |
|---|---|---|
| Scene load time indicator (large scenes) | High | Currently blank until loaded |
| Progressive loading (show scene as nodes load) | Medium | — |
| Autosave indicator | Medium | Only manual save today |
| Conflict warning (scene changed by another user) | High | No detection of concurrent edits |
| Large scene warning (>500 nodes) | Low | — |

---

## Comparison Table — Aruct vs CadCraft

| UX Feature | CadCraft | Aruct |
|---|---|---|
| Command-line interface | ✅ (core of the app) | ❌ |
| Keyboard-first workflow | ✅ | Partial |
| Mouse / pointer tools | ✅ | ✅ |
| Dark theme | ✅ | ✅ |
| Light theme | ✅ | ✅ |
| System theme auto | ✅ | ✅ |
| Status bar (coordinates) | ✅ | ❌ |
| Properties panel | ✅ | ✅ |
| Undo/redo | ✅ | ✅ |
| Visible undo history | ❌ | ❌ |
| Customizable shortcuts | ❌ | ❌ |
| Mobile support | ❌ | ✅ (partial) |
| Onboarding tutorial | ❌ | ❌ |
| Outliner / scene tree | ❌ | ❌ |
| Node search | ❌ | ❌ |

---

## Recommended Next Steps

1. **Toast notification system** — success/error feedback for every operation
2. **Progress indicators** — export, AI generation, import
3. **Keyboard shortcut help** — `?` overlay listing all shortcuts
4. **Outliner / scene tree** — hierarchical node list; click to select; visibility toggle
5. **Onboarding flow** — guided first scene: draw room → place door → add furniture
6. **Status bar** — cursor coordinates, selected node info, units
7. **Command palette** — `⌘K` fuzzy search over all actions, tools, nodes
8. **Autosave** — every 2 minutes; indicator in top bar
9. **Accessibility audit** — keyboard navigation, ARIA labels, color contrast
