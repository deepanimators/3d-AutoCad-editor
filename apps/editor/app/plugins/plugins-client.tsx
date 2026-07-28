'use client'

import { useState } from 'react'
import { Crown, Building2, Zap, Check, Lock, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { PluginCategory, PluginEntry, PluginPlan } from '@/lib/plugins/catalog'

type PluginWithState = PluginEntry & { isEnabled: boolean; canEnable: boolean }

const CATEGORY_LABELS: Record<PluginCategory, string> = {
  core: 'Core',
  catalog: 'Model Catalog',
  ai: 'AI & Generation',
  export: 'Export & Interop',
  analysis: 'Analysis',
  collaboration: 'Collaboration',
  modeling: 'Modeling',
  materials: 'Materials',
  documentation: 'Documentation',
  interop: 'Import / Export',
  rendering: 'Rendering',
}

const PLAN_ICONS: Record<PluginPlan, typeof Zap> = {
  free: Zap,
  pro: Crown,
  team: Building2,
}

const PLAN_LABELS: Record<PluginPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}

const STATUS_LABELS: Record<string, string> = {
  stable: 'Stable',
  beta: 'Beta',
  coming_soon: 'Coming soon',
}

type Props = {
  plugins: PluginWithState[]
  userPlan: PluginPlan
}

export function PluginsClient({ plugins, userPlan }: Props) {
  const [enabledState, setEnabledState] = useState<Record<string, boolean>>(
    Object.fromEntries(plugins.map((p) => [p.id, p.isEnabled]))
  )
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(pluginId: string, next: boolean) {
    setLoading(pluginId)
    setError(null)
    try {
      const res = await fetch('/api/user/plugins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, enabled: next }),
      })
      const data = (await res.json()) as { enabled?: string[]; error?: string }
      if (!res.ok) {
        if (data.error === 'plan_upgrade_required') {
          setError('Upgrade your plan to enable this plugin.')
        } else {
          setError(data.error ?? 'Failed to update plugin.')
        }
        return
      }
      if (data.enabled) {
        const map: Record<string, boolean> = {}
        for (const p of plugins) map[p.id] = data.enabled.includes(p.id) || p.builtIn
        setEnabledState(map)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const categories = Array.from(new Set(plugins.map((p) => p.category)))

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {categories.map((cat) => {
        const catPlugins = plugins.filter((p) => p.category === cat)
        return (
          <section key={cat}>
            <h2 className="mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="space-y-3">
              {catPlugins.map((plugin) => {
                const PlanIcon = PLAN_ICONS[plugin.requiredPlan]
                const isExpanded = expanded === plugin.id
                const isOn = enabledState[plugin.id] ?? plugin.isEnabled
                const isLoading = loading === plugin.id
                const locked = !plugin.canEnable && !plugin.builtIn

                return (
                  <div
                    key={plugin.id}
                    className={`rounded-xl border bg-background transition-shadow ${
                      isOn ? 'border-brand/30 shadow-sm' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <span className="text-2xl shrink-0">{plugin.icon}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{plugin.name}</span>

                          {plugin.status !== 'stable' && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              plugin.status === 'beta'
                                ? 'bg-warning-muted text-warning'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {STATUS_LABELS[plugin.status]}
                            </span>
                          )}

                          {plugin.requiredPlan !== 'free' && (
                            <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              <PlanIcon className="h-2.5 w-2.5" />
                              {PLAN_LABELS[plugin.requiredPlan]}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-muted-foreground text-xs line-clamp-1">{plugin.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : plugin.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {plugin.builtIn ? (
                          <span className="flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-3 py-1.5 text-success text-xs font-semibold">
                            <Check className="h-3 w-3" /> Built-in
                          </span>
                        ) : locked ? (
                          <a
                            href="/pricing"
                            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted-foreground text-xs font-medium hover:bg-accent transition-colors"
                          >
                            <Lock className="h-3 w-3" /> Upgrade
                          </a>
                        ) : plugin.status === 'coming_soon' ? (
                          <span className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted-foreground text-xs font-medium">
                            <Clock className="h-3 w-3" /> Soon
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => void toggle(plugin.id, !isOn)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-60 ${
                              isOn ? 'bg-brand' : 'bg-muted-foreground/30'
                            }`}
                            role="switch"
                            aria-checked={isOn}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                isOn ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border mt-0 pt-3">
                        <p className="text-sm text-muted-foreground mb-3">{plugin.longDescription}</p>
                        <ul className="space-y-1">
                          {plugin.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-success shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {locked && (
                          <div className="mt-3 rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs">
                            <span className="font-medium text-foreground">Requires {PLAN_LABELS[plugin.requiredPlan]} plan.</span>
                            {' '}
                            <a href="/pricing" className="text-brand underline">Upgrade</a> to unlock this plugin.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="text-center text-muted-foreground text-xs pt-4">
        Changes take effect the next time you open or refresh a scene.
        {' '}
        <a href="/editor" className="underline">Back to editor</a>
      </p>
    </div>
  )
}
