'use client'

import { useEffect, useState } from 'react'
import { Keyboard, X } from 'lucide-react'

type ShortcutEntry = {
  keys: string[]
  description: string
}

type ShortcutSection = {
  title: string
  entries: ShortcutEntry[]
}

const SECTIONS: ShortcutSection[] = [
  {
    title: 'General',
    entries: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Cmd', 'Z'], description: 'Undo' },
      { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Cmd', 'S'], description: 'Save' },
      { keys: ['Esc'], description: 'Cancel / Deselect' },
      { keys: ['Del', 'Backspace'], description: 'Delete selected' },
    ],
  },
  {
    title: 'Tools',
    entries: [
      { keys: ['W'], description: 'Wall tool' },
      { keys: ['D'], description: 'Door tool' },
      { keys: ['N'], description: 'Window tool' },
      { keys: ['M'], description: 'Measure' },
      { keys: ['G'], description: 'Guide' },
      { keys: ['I'], description: 'Item browser' },
    ],
  },
  {
    title: 'View',
    entries: [
      { keys: ['2'], description: '2D view' },
      { keys: ['3'], description: '3D view' },
      { keys: ['F'], description: 'Fit to screen' },
      { keys: ['Space', 'drag'], description: 'Pan' },
    ],
  },
  {
    title: 'Selection',
    entries: [
      { keys: ['Click'], description: 'Select' },
      { keys: ['Shift', 'Click'], description: 'Multi-select' },
      { keys: ['Cmd', 'A'], description: 'Select all' },
      { keys: ['Esc'], description: 'Deselect' },
    ],
  },
  {
    title: 'Camera',
    entries: [
      { keys: ['Scroll'], description: 'Zoom' },
      { keys: ['Middle', 'drag'], description: 'Pan' },
      { keys: ['Right', 'drag'], description: 'Orbit (3D)' },
    ],
  },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  )
}

function ShortcutRow({ keys, description }: ShortcutEntry) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-1.5 pr-4 text-right align-middle whitespace-nowrap">
        <span className="flex items-center justify-end gap-1 flex-wrap">
          {keys.map((k, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground/50 text-[10px]">/</span>}
              <Kbd>{k}</Kbd>
            </span>
          ))}
        </span>
      </td>
      <td className="py-1.5 pl-2 text-sm text-foreground align-middle">{description}</td>
    </tr>
  )
}

export function ShortcutHelpOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === '?') {
        setOpen((prev) => !prev)
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5 text-foreground">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-5">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <table className="w-full">
                <tbody>
                  {section.entries.map((entry, i) => (
                    <ShortcutRow key={i} {...entry} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-2.5">
          <p className="text-xs text-muted-foreground">
            Press <Kbd>?</Kbd> or <Kbd>Esc</Kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}

export function ShortcutHelpTrigger() {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent('keydown', { key: '?' })
        window.dispatchEvent(event)
      }}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label="Show keyboard shortcuts"
      title="Keyboard shortcuts (?)"
    >
      <Keyboard className="h-3.5 w-3.5" />
    </button>
  )
}
