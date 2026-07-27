'use client'

import useViewer from '@aruct/viewer'
import { useEffect, useRef, useState } from 'react'

const CITY_PRESETS = [
  { label: 'New York', lat: 40.7, lng: -74.0 },
  { label: 'London', lat: 51.5, lng: -0.1 },
  { label: 'Dubai', lat: 25.2, lng: 55.3 },
  { label: 'Sydney', lat: -33.9, lng: 151.2 },
  { label: 'Tokyo', lat: 35.7, lng: 139.7 },
]

function formatTime(timeOfDay: number): string {
  const hours = Math.floor(timeOfDay)
  const minutes = Math.round((timeOfDay - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function toDateInputValue(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function SunStudyPanel() {
  const sunStudy = useViewer((s) => s.sunStudy)

  const [enabled, setEnabled] = useState(sunStudy?.enabled ?? false)
  const [latitude, setLatitude] = useState(sunStudy?.latitude ?? 40.7)
  const [longitude, setLongitude] = useState(sunStudy?.longitude ?? -74.0)
  const [dateMs, setDateMs] = useState(sunStudy?.dateMs ?? Date.now())
  const [timeOfDay, setTimeOfDay] = useState(sunStudy?.timeOfDay ?? 12)
  const [animating, setAnimating] = useState(false)
  const animFrameRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)

  // Push state to viewer store whenever local values change
  useEffect(() => {
    if (!enabled) {
      useViewer.getState().setSunStudy(null)
      return
    }
    useViewer.getState().setSunStudy({ enabled, latitude, longitude, dateMs, timeOfDay })
  }, [enabled, latitude, longitude, dateMs, timeOfDay])

  // Sync initial state from store (e.g. restored from persisted session)
  useEffect(() => {
    const s = useViewer.getState().sunStudy
    if (!s) return
    setEnabled(s.enabled)
    setLatitude(s.latitude)
    setLongitude(s.longitude)
    setDateMs(s.dateMs)
    setTimeOfDay(s.timeOfDay)
  }, [])

  // Animation loop — advances 24h in ~10 seconds (2.4h/s)
  useEffect(() => {
    if (!animating) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      lastTimestampRef.current = null
      return
    }
    const tick = (ts: number) => {
      if (lastTimestampRef.current !== null) {
        const elapsed = (ts - lastTimestampRef.current) / 1000 // seconds
        setTimeOfDay((prev) => {
          const next = (prev + elapsed * 2.4) % 24
          return next
        })
      }
      lastTimestampRef.current = ts
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current)
    }
  }, [animating])

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-sidebar-foreground">Sun &amp; Shadow Study</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            enabled ? 'bg-brand' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Location */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
              Location
            </h3>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-sidebar-foreground/60">Latitude</span>
                <input
                  type="number"
                  min={-90}
                  max={90}
                  step={0.1}
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-sidebar-foreground/60">Longitude</span>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step={0.1}
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </label>
            </div>

            {/* City presets */}
            <div className="flex flex-wrap gap-1">
              {CITY_PRESETS.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => {
                    setLatitude(city.lat)
                    setLongitude(city.lng)
                  }}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground transition-colors"
                >
                  {city.label}
                </button>
              ))}
            </div>
          </section>

          {/* Date */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
              Date
            </h3>
            <input
              type="date"
              value={toDateInputValue(dateMs)}
              onChange={(e) => {
                const d = new Date(e.target.value)
                if (!Number.isNaN(d.getTime())) setDateMs(d.getTime())
              }}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </section>

          {/* Time */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Time
              </h3>
              <span className="font-mono text-xs text-sidebar-foreground/70">
                {formatTime(timeOfDay)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              step={0.25}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(Number(e.target.value))}
              className="w-full accent-brand"
            />

            {/* Animate button */}
            <button
              type="button"
              onClick={() => setAnimating((v) => !v)}
              className={`mt-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                animating
                  ? 'border-brand/40 bg-brand/10 text-brand hover:bg-brand/20'
                  : 'border-border bg-background text-sidebar-foreground hover:bg-accent'
              }`}
            >
              {animating ? 'Stop Animation' : 'Animate Day'}
            </button>
          </section>

          <p className="text-xs text-sidebar-foreground/40 pt-1">
            Shadows must be enabled in Display settings.
          </p>
        </>
      )}
    </div>
  )
}
