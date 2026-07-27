'use client'

import { editorHostPanelRegistry } from '@aruct/editor'
import { useScene } from '@aruct/core'
import { Check, Clock, Crown, Building2, Zap, Lock } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { PLUGIN_CATALOG } from '@/lib/plugins/catalog'

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, team: 2 }
const PLAN_ICONS: Record<string, typeof Zap> = { free: Zap, pro: Crown, team: Building2 }
const PLAN_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', team: 'Team' }

// Catalog plugins the panel manages (excludes builtIn, groups by visible status)
const CATALOG_PLUGINS = PLUGIN_CATALOG.filter((p) => !p.builtIn)

export function UnifiedPluginsPanel() {
  const [enabledIds, setEnabledIds] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')

  const panels = useSyncExternalStore(
    editorHostPanelRegistry.subscribe,
    editorHostPanelRegistry.getSnapshot,
    editorHostPanelRegistry.getSnapshot,
  )
  const installedPlugins = useScene((s) => s.installedPlugins)
  const setInstalledPlugins = useScene((s) => s.setInstalledPlugins)
  const readOnly = useScene((s) => s.readOnly)

  useEffect(() => {
    fetch('/api/user/plugins')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { enabled?: string[]; plan?: string } | null) => {
        if (data?.enabled) setEnabledIds(data.enabled)
        if (data?.plan) setUserPlan(data.plan)
      })
      .catch(() => {})
  }, [])

  async function toggleCatalog(pluginId: string, next: boolean) {
    setLoading(pluginId)
    try {
      const res = await fetch('/api/user/plugins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, enabled: next }),
      })
      const data = (await res.json()) as { enabled?: string[] }
      if (data.enabled) setEnabledIds(data.enabled)
    } catch { /* ignore */ } finally {
      setLoading(null)
    }
  }

  // Editor UI-panel plugins (e.g. Nature) — per-scene install
  const editorPanelPlugins = Array.from(
    new Map(
      panels.filter((p) => p.pluginId).map((p) => [p.pluginId as string, p])
    ).entries()
  )

  // Group catalog plugins by category
  const categories = Array.from(new Set(CATALOG_PLUGINS.map((p) => p.category)))
  const CATEGORY_LABELS: Record<string, string> = {
    catalog: 'Model Catalog',
    ai: 'AI & Generation',
    export: 'Export & Interop',
    analysis: 'Analysis',
    collaboration: 'Collaboration',
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-6">

      {/* Editor panel plugins (per-scene) */}
      {editorPanelPlugins.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            Editor Panels
          </h3>
          <div className="flex flex-col gap-2">
            {editorPanelPlugins.map(([pluginId, panel]) => {
              const installed = installedPlugins.includes(pluginId)
              return (
                <div
                  key={pluginId}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-accent/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground">{panel.label}</p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {panel.description ?? 'Adds a panel to this scene.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      const next = installed
                        ? installedPlugins.filter((id) => id !== pluginId)
                        : [...installedPlugins, pluginId]
                      setInstalledPlugins(next, { explicit: true })
                    }}
                    className={`ml-3 shrink-0 flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      installed
                        ? 'border-border bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                        : 'border-brand/30 bg-brand/10 text-brand hover:bg-brand/20'
                    }`}
                  >
                    {installed ? (
                      <><Check className="h-3 w-3" /> Installed</>
                    ) : (
                      <>Install</>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Catalog / service plugins (account-level) */}
      {categories.map((cat) => {
        const catPlugins = CATALOG_PLUGINS.filter((p) => p.category === cat)
        return (
          <section key={cat}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
              {CATEGORY_LABELS[cat] ?? cat}
            </h3>
            <div className="flex flex-col gap-2">
              {catPlugins.map((plugin) => {
                const isOn = plugin.builtIn || enabledIds.includes(plugin.id)
                const isLoading = loading === plugin.id
                const canEnable = (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[plugin.requiredPlan] ?? 0)
                const PlanIcon = PLAN_ICONS[plugin.requiredPlan] ?? Zap
                const locked = !canEnable && !plugin.builtIn
                const soon = plugin.status === 'coming_soon'

                return (
                  <div
                    key={plugin.id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                      isOn ? 'border-brand/30 bg-accent/20' : 'border-border/60 bg-accent/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{plugin.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium text-sidebar-foreground">{plugin.name}</span>
                          {plugin.requiredPlan !== 'free' && (
                            <span className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              <PlanIcon className="h-2.5 w-2.5" />
                              {PLAN_LABELS[plugin.requiredPlan]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-sidebar-foreground/50 truncate">{plugin.description}</p>
                      </div>
                    </div>

                    <div className="ml-2 shrink-0">
                      {soon ? (
                        <span className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-muted-foreground text-xs">
                          <Clock className="h-3 w-3" /> Soon
                        </span>
                      ) : locked ? (
                        <a
                          href="/pricing"
                          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-muted-foreground text-xs hover:bg-accent"
                        >
                          <Lock className="h-3 w-3" /> Upgrade
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => void toggleCatalog(plugin.id, !isOn)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-60 ${
                            isOn ? 'bg-brand' : 'bg-muted-foreground/30'
                          }`}
                          role="switch"
                          aria-checked={isOn}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                              isOn ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="text-center text-sidebar-foreground/40 text-xs pt-2 pb-2">
        Catalog plugins affect what appears in the Items panel.
      </p>
    </div>
  )
}
