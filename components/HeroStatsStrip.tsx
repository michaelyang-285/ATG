'use client'

import { useEffect, useState } from 'react'

type StatConfig = {
  key: string
  label: string
  target: number
  format: 'kplus' | 'int'
}

const STATS: StatConfig[] = [
  { key: 'members', label: 'Members', target: 6.2, format: 'kplus' },
  { key: 'stories', label: 'Stories today', target: 12, format: 'int' },
  { key: 'events', label: 'Events this week', target: 4, format: 'int' },
]

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function formatDisplay(raw: number, format: StatConfig['format']) {
  if (format === 'int') return String(Math.round(raw))
  const v = Math.round(raw * 10) / 10
  return `${v.toFixed(1)}K+`
}

export default function HeroStatsStrip() {
  const [values, setValues] = useState(() => STATS.map(() => 0))

  useEffect(() => {
    let cancelled = false
    const duration = 1400
    const start = performance.now()

    const tick = (now: number) => {
      if (cancelled) return
      const progress = Math.min(1, (now - start) / duration)
      const eased = easeOutCubic(progress)
      setValues(STATS.map((s) => s.target * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else setValues(STATS.map((s) => s.target))
    }

    requestAnimationFrame(tick)
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-orange border-b-2 border-ink grid grid-cols-3">
      {STATS.map((s, i) => (
        <div key={s.key} className="text-center py-[14px] px-2 border-r border-white/20 last:border-r-0">
          <span className="font-archivo text-[24px] text-white block leading-none tabular-nums">
            {formatDisplay(values[i], s.format)}
          </span>
          <span className="font-inter text-[8px] font-bold uppercase tracking-[1px] text-white/60 mt-[2px] block">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
