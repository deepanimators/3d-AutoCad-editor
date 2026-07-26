'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CouponRow } from '@/lib/db/schema'

type FormState = {
  name: string
  code: string
  gateway: 'stripe' | 'razorpay' | 'both'
  discountType: 'percent' | 'fixed'
  discountValue: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths: string
  appliesToPlans: string[]
  originalPriceCents: string
  promoPriceCents: string
  maxRedemptions: string
  expiresAt: string
}

const EMPTY_FORM: FormState = {
  name: '',
  code: '',
  gateway: 'stripe',
  discountType: 'percent',
  discountValue: '',
  duration: 'once',
  durationInMonths: '',
  appliesToPlans: [],
  originalPriceCents: '',
  promoPriceCents: '',
  maxRedemptions: '',
  expiresAt: '',
}

const PLAN_OPTIONS = ['pro-monthly', 'team-monthly']

function CreateForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function togglePlan(plan: string) {
    setForm((prev) => ({
      ...prev,
      appliesToPlans: prev.appliesToPlans.includes(plan)
        ? prev.appliesToPlans.filter((p) => p !== plan)
        : [...prev.appliesToPlans, plan],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const body = {
        name: form.name,
        code: form.code,
        gateway: form.gateway,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        duration: form.duration,
        ...(form.duration === 'repeating' && form.durationInMonths ? { durationInMonths: Number(form.durationInMonths) } : {}),
        appliesToPlans: form.appliesToPlans,
        ...(form.originalPriceCents ? { originalPriceCents: Number(form.originalPriceCents) } : {}),
        ...(form.promoPriceCents ? { promoPriceCents: Number(form.promoPriceCents) } : {}),
        ...(form.maxRedemptions ? { maxRedemptions: Number(form.maxRedemptions) } : {}),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      }
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Failed'); setSubmitting(false); return }
      onClose()
      router.refresh()
    } catch {
      setError('Request failed')
    }
    setSubmitting(false)
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'block text-xs font-medium text-muted-foreground mb-1'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name</label>
          <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="e.g. Launch 20% Off" />
        </div>
        <div>
          <label className={labelCls}>Code</label>
          <input type="text" required value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className={inputCls} placeholder="e.g. LAUNCH20" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Gateway</label>
          <select value={form.gateway} onChange={(e) => set('gateway', e.target.value as FormState['gateway'])} className={inputCls}>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Discount type</label>
          <select value={form.discountType} onChange={(e) => set('discountType', e.target.value as FormState['discountType'])} className={inputCls}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed (cents)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Discount value</label>
          <input type="number" required min={0} value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} className={inputCls} placeholder={form.discountType === 'percent' ? '0–100' : 'cents'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Duration</label>
          <select value={form.duration} onChange={(e) => set('duration', e.target.value as FormState['duration'])} className={inputCls}>
            <option value="once">Once</option>
            <option value="repeating">Repeating</option>
            <option value="forever">Forever</option>
          </select>
        </div>
        {form.duration === 'repeating' && (
          <div>
            <label className={labelCls}>Duration (months)</label>
            <input type="number" min={1} value={form.durationInMonths} onChange={(e) => set('durationInMonths', e.target.value)} className={inputCls} placeholder="e.g. 3" />
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Applies to plans</label>
        <div className="flex gap-3">
          {PLAN_OPTIONS.map((plan) => (
            <label key={plan} className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs cursor-pointer select-none transition-colors ${
              form.appliesToPlans.includes(plan)
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            }`}>
              <input type="checkbox" className="sr-only" checked={form.appliesToPlans.includes(plan)} onChange={() => togglePlan(plan)} />
              {plan}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Original price (cents)</label>
          <input type="number" min={0} value={form.originalPriceCents} onChange={(e) => set('originalPriceCents', e.target.value)} className={inputCls} placeholder="e.g. 1900" />
        </div>
        <div>
          <label className={labelCls}>Promo price (cents)</label>
          <input type="number" min={0} value={form.promoPriceCents} onChange={(e) => set('promoPriceCents', e.target.value)} className={inputCls} placeholder="e.g. 1520" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Max redemptions</label>
          <input type="number" min={1} value={form.maxRedemptions} onChange={(e) => set('maxRedemptions', e.target.value)} className={inputCls} placeholder="Unlimited if blank" />
        </div>
        <div>
          <label className={labelCls}>Expires at</label>
          <input type="datetime-local" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-80 disabled:opacity-50">
          {submitting ? 'Creating…' : 'Create coupon'}
        </button>
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-success-muted text-success' : 'bg-muted text-muted-foreground'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function DeactivateButton({ couponId, active }: { couponId: string; active: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!active) return null

  async function handleDeactivate() {
    if (!window.confirm('Deactivate this coupon? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/admin/coupons/${couponId}`, { method: 'PATCH' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleDeactivate()}
      className="rounded px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {loading ? '…' : 'Deactivate'}
    </button>
  )
}

export function CouponsClient({ initialCoupons }: { initialCoupons: CouponRow[] }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-80"
        >
          Create coupon
        </button>
      ) : (
        <div className="rounded-xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-4">New Coupon</h2>
          <CreateForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name / Code</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Gateway</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Discount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applies to</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Redemptions</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialCoupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground text-sm">No coupons yet.</td>
              </tr>
            )}
            {initialCoupons.map((c) => {
              const plans = (() => { try { return JSON.parse(c.appliesToPlans) as string[] } catch { return [] } })()
              const discountLabel = c.discountType === 'percent' ? `${c.discountValue}%` : `$${(c.discountValue / 100).toFixed(2)}`
              return (
                <tr key={c.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground text-xs font-mono">{c.code}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.gateway}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{discountLabel}</span>
                    <span className="ml-1 text-muted-foreground text-xs">{c.duration}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {plans.map((p) => (
                        <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.redemptionCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3"><ActiveBadge active={c.active} /></td>
                  <td className="px-4 py-3"><DeactivateButton couponId={c.id} active={c.active} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
