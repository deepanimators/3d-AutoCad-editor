'use client'

import { Suspense } from 'react'
import { IfcExportPanel } from './ifc-export-panel'

export function SettingsPanel() {
  return (
    <div className="divide-y divide-border">
      <Suspense fallback={null}>
        <IfcExportPanel />
      </Suspense>
    </div>
  )
}
