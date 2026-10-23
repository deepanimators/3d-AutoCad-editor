'use client'

import { ArrowLeft, FileCode, FileImage, FileBox, Store } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ShortcutHelpOverlay, ShortcutHelpTrigger } from './shortcut-help-overlay'
import { DwgImportDialog } from './dwg-import-dialog'
import { IfcImportDialog } from './ifc-import-dialog'
import { PdfUnderlayDialog } from './pdf-underlay-dialog'

function AructMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 L22 7.5 L12 13 L2 7.5 Z" />
      <line x1="2" y1="13" x2="22" y2="13" />
      <path d="M2 7.5 L2 16.5 L12 22 L12 13" />
      <path d="M22 7.5 L22 16.5 L12 22" />
    </svg>
  )
}

export function EditorTopBar() {
  const [dwgOpen, setDwgOpen] = useState(false)
  const [ifcOpen, setIfcOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <a
          href="/"
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
        >
          <AructMark className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">Aruct</span>
        </a>
        <div className="h-4 w-px bg-border" />
        <Link
          href="/scenes"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">My Scenes</span>
        </Link>

        {/* Import actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Import IFC"
            onClick={() => setIfcOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <FileBox className="h-3.5 w-3.5" />
            <span className="hidden md:inline">IFC</span>
          </button>
          <button
            type="button"
            title="Import DWG"
            onClick={() => setDwgOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span className="hidden md:inline">DWG</span>
          </button>
          <button
            type="button"
            title="Add PDF underlay"
            onClick={() => setPdfOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <FileImage className="h-3.5 w-3.5" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/plugins/marketplace"
            title="Plugin Marketplace"
            className="hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>
          <ShortcutHelpTrigger />
        </div>
        <ShortcutHelpOverlay />
      </header>

      <IfcImportDialog open={ifcOpen} onClose={() => setIfcOpen(false)} />
      <DwgImportDialog open={dwgOpen} onClose={() => setDwgOpen(false)} />
      <PdfUnderlayDialog open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </>
  )
}
