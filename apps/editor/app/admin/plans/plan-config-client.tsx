'use client'

import { useState } from 'react'
import type { PlanConfigRow } from '@/lib/db/schema'

type ParsedPlanConfig = Omit<PlanConfigRow, 'features'> & { features: string[] }

interface EditState {
  displayName: string
  displayPriceCents: string
  priceSuffix: string
  features: string
  stripePriceId: string
  razorpayPlanId: string
  localePricesJson: string  // raw JSON text, edited as textarea
}

function planToEditState(plan: ParsedPlanConfig): EditState {
  return {
    displayName: plan.displayName,
    displayPriceCents: String(plan.displayPriceCents),
    priceSuffix: plan.priceSuffix,
    features: plan.features.join('\n'),
    stripePriceId: plan.stripePriceId ?? '',
    razorpayPlanId: plan.razorpayPlanId ?? '',
    localePricesJson: plan.localePricesJson ?? '{}',
  }
}

function PlanCard({ plan, onSaved }: { plan: ParsedPlanConfig; onSaved: (updated: ParsedPlanConfig) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditState>(planToEditState(plan))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleEdit() {
    setForm(planToEditState(plan))
    setError(null)
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        displayName: form.displayName,
        displayPriceCents: parseInt(form.displayPriceCents, 10),
        priceSuffix: form.priceSuffix,
        features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
        stripePriceId: form.stripePriceId || null,
        razorpayPlanId: form.razorpayPlanId || null,
        localePricesJson: form.localePricesJson,
      }
      const res = await fetch(`/api/admin/plan-config/${plan.planKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError((json as { error?: string }).error ?? 'Save failed')
        return
      }
      const updated = await res.json() as ParsedPlanConfig
      onSaved(updated)
      setEditing(false)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const displayPrice = `$${(plan.displayPriceCents / 100).toFixed(0)}${plan.priceSuffix}`

  return (
    <div className="rounded-xl border border-border bg-background p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold text-foreground">{plan.displayName}</span>
          <span className="ml-2 text-muted-foreground text-sm">{displayPrice}</span>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">{plan.planKey}</span>
          {plan.highlight && (
            <span className="ml-2 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-medium text-brand">Highlighted</span>
          )}
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {!editing && (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {plan.features.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {plan.features.map((f) => (
                <li key={f} className="rounded bg-muted px-2 py-0.5 text-[11px]">{f}</li>
              ))}
            </ul>
          )}
          {plan.stripePriceId && <p>Stripe: <code className="font-mono text-[11px]">{plan.stripePriceId}</code></p>}
          {plan.razorpayPlanId && <p>Razorpay: <code className="font-mono text-[11px]">{plan.razorpayPlanId}</code></p>}
        </div>
      )}

      {editing && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Display name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Price (cents)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={form.displayPriceCents}
                  onChange={(e) => setForm((f) => ({ ...f, displayPriceCents: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  = ${(parseInt(form.displayPriceCents || '0', 10) / 100).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Price suffix</label>
            <input
              type="text"
              value={form.priceSuffix}
              onChange={(e) => setForm((f) => ({ ...f, priceSuffix: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="/month"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Features (one per line)</label>
            <textarea
              rows={4}
              value={form.features}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Stripe Price ID</label>
              <input
                type="text"
                value={form.stripePriceId}
                onChange={(e) => setForm((f) => ({ ...f, stripePriceId: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-xs"
                placeholder="price_..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Razorpay Plan ID</label>
              <input
                type="text"
                value={form.razorpayPlanId}
                onChange={(e) => setForm((f) => ({ ...f, razorpayPlanId: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-xs"
                placeholder="plan_..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Locale Prices (JSON)
            </label>
            <textarea
              rows={4}
              className="w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.localePricesJson}
              onChange={(e) => setForm(f => ({ ...f, localePricesJson: e.target.value }))}
              placeholder={'{\n  "INR": 249900,\n  "EUR": 2699,\n  "GBP": 2299\n}'}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Values in smallest currency unit (paise for INR, cents for EUR/GBP/USD).
              Leave empty to use USD price with approximate conversion.
            </p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PlanConfigClient({ configs }: { configs: ParsedPlanConfig[] }) {
  const [plans, setPlans] = useState<ParsedPlanConfig[]>(configs)

  function handleSaved(updated: ParsedPlanConfig) {
    setPlans((prev) => prev.map((p) => (p.planKey === updated.planKey ? updated : p)))
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {plans.map((plan) => (
        <PlanCard key={plan.planKey} plan={plan} onSaved={handleSaved} />
      ))}
    </div>
  )
}
