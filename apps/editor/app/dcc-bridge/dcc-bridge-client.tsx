'use client'

import { useEffect, useState } from 'react'
import { Download, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DCC_TOOLS = [
  { id: 'blender', name: 'Blender', version: 'v1.0.0', icon: '🟠', status: 'available', installUrl: '#' },
  { id: '3dsmax', name: '3ds Max', version: 'v0.9.0', icon: '🔵', status: 'coming-soon', installUrl: '#' },
  { id: 'unity', name: 'Unity', version: 'v0.9.0', icon: '🎮', status: 'coming-soon', installUrl: '#' },
  { id: 'unreal', name: 'Unreal', version: 'v0.9.0', icon: '⚡', status: 'coming-soon', installUrl: '#' },
  { id: 'maya', name: 'Maya', version: 'v0.9.0', icon: '🔷', status: 'coming-soon', installUrl: '#' },
  { id: 'godot', name: 'Godot', version: 'v0.9.0', icon: '🤖', status: 'coming-soon', installUrl: '#' },
  { id: 'cinema4d', name: 'Cinema 4D', version: 'v0.8.0', icon: '🎬', status: 'coming-soon', installUrl: '#' },
  { id: 'rhino', name: 'Rhino 3D', version: 'v0.8.0', icon: '🦏', status: 'coming-soon', installUrl: '#' },
  { id: 'sketchup', name: 'SketchUp', version: 'v0.8.0', icon: '📐', status: 'coming-soon', installUrl: '#' },
] as const

type DCCTool = (typeof DCC_TOOLS)[number]

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: '📦',
    title: 'Install the addon',
    description: 'Download and install the Aruct plugin for your DCC tool.',
  },
  {
    step: '2',
    icon: '🖱️',
    title: 'Select your assets',
    description: 'Select the objects you want to send from your DCC tool.',
  },
  {
    step: '3',
    icon: '⚡',
    title: 'Send to Aruct',
    description: 'Click "Send to Aruct" — your assets appear in My Items instantly.',
  },
]

export function DCCBridgeClient() {
  const [bridgeConnected, setBridgeConnected] = useState(false)

  useEffect(() => {
    fetch('http://localhost:9877/ping', { signal: AbortSignal.timeout(1000) })
      .then(() => setBridgeConnected(true))
      .catch(() => {
        // bridge not running — leave as disconnected
      })
  }, [])

  return (
    <div className="px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-foreground">DCC Bridge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your 3D tools to Aruct Editor. Send assets from Blender, Maya and more directly.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-background p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DCC tool cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {DCC_TOOLS.map((tool) => (
          <DCCToolCard key={tool.id} tool={tool} bridgeConnected={bridgeConnected} />
        ))}
      </div>
    </div>
  )
}

function DCCToolCard({
  tool,
  bridgeConnected,
}: {
  tool: DCCTool
  bridgeConnected: boolean
}) {
  const isAvailable = tool.status === 'available'
  // Only the available tool can show connected if the bridge is running
  const isConnected = isAvailable && bridgeConnected

  if (!isAvailable) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 p-5 opacity-60 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{tool.name}</span>
              <span className="text-[10px] text-muted-foreground">{tool.version}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground">Not detected</span>
            </div>
          </div>
        </div>
        <span className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground text-center">
          Coming soon
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{tool.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{tool.name}</span>
            <span className="text-[10px] text-muted-foreground">{tool.version}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isConnected ? 'bg-emerald-400' : 'bg-muted-foreground/40'
              )}
            />
            <span className="text-[11px] text-muted-foreground">
              {isConnected ? 'Connected' : 'Not detected'}
            </span>
          </div>
        </div>
      </div>
      <a
        href={tool.installUrl}
        className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Install
      </a>
    </div>
  )
}
