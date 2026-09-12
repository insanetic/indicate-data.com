'use client'

import React, { useEffect, useState } from 'react'

import { BrandBars } from '@/components/BrandBars'
import { Chip, Sparkline } from '@/components/Illustrations/primitives'
import { labelsFor } from '@/components/Illustrations/labels'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/ui'

const kpis = [
  { key: 'occupancy', value: 84, format: (v: number) => `${Math.round(v)} %`, delta: '+6' },
  { key: 'adr', value: 142, format: (v: number) => `${Math.round(v)} €`, delta: '+3,1 %' },
  { key: 'revpar', value: 119, format: (v: number) => `${Math.round(v)} €`, delta: '+9,4 %' },
  { key: 'bookings', value: 1284, format: (v: number) => Math.round(v).toLocaleString('de-DE'), delta: '+12 %' },
] as const

const bars = [46, 58, 52, 70, 64, 78, 86]

/**
 * The product stage under the hero: KPIs count up, the chart draws, bars rise and the agent
 * types its answer. Plays on load; static under reduced motion.
 */
export const HeroPanel: React.FC<{ className?: string }> = ({ className }) => {
  const locale = useLocale()
  const l = labelsFor(locale)
  const [progress, setProgress] = useState(0)
  const [typed, setTyped] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      // Jump to the final frame on the next tick (no synchronous state change inside the effect).
      const id = requestAnimationFrame(() => {
        setReduced(true)
        setProgress(1)
        setTyped(l.answer.length)
      })
      return () => cancelAnimationFrame(id)
    }
    let frame = 0
    const start = performance.now() + 250
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1400))
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const typing = window.setInterval(() => {
      setTyped((n) => (n >= l.answer.length ? n : n + 2))
    }, 28)
    const typingStart = window.setTimeout(() => setTyped(1), 1500)
    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(typing)
      window.clearTimeout(typingStart)
    }
  }, [l.answer.length])

  const answerVisible = typed > 0
  const done = typed >= l.answer.length

  return (
    <div
      aria-label="Indicate Dashboard mit Kennzahlen, Diagramm und Agent"
      className={cn('relative select-none', className)}
      role="img"
    >
      <div aria-hidden="true" className="glow-accent pointer-events-none absolute -inset-x-10 -top-14 h-64" />
      <div className="relative overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-surface-3" />
              <i className="size-2.5 rounded-full bg-surface-3" />
              <i className="size-2.5 rounded-full bg-surface-3" />
            </span>
            <span className="type-caption font-medium text-ink-2">Hotel Alpenrose · {l.week} 37</span>
          </div>
          <Chip tone="green">
            <i className="size-1.5 rounded-full bg-current" /> {l.sourcesOk}
          </Chip>
        </div>

        <div className="grid gap-px bg-line md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6 bg-surface-2 p-5 md:p-6">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {kpis.map((k) => (
                <div className="flex flex-col gap-1" key={k.key}>
                  <span className="type-caption text-ink-3">{l[k.key]}</span>
                  <span className="font-display text-[1.75rem] font-medium leading-none tnum text-ink">
                    {k.format(k.value * progress)}
                  </span>
                  <span className={cn('type-caption font-medium tnum text-[oklch(0.78_0.15_160)] transition-opacity duration-500', progress > 0.9 ? 'opacity-100' : 'opacity-0')}>
                    {k.delta}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
              <div className="rounded-card-inner border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between type-caption text-ink-3">
                  <span>{l.bookings} · {l.thisYear} / {l.lastYear}</span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded bg-brand-blue" /> {l.thisYear}</span>
                    <span className="flex items-center gap-1"><i className="h-0.5 w-3 border-t border-dashed border-brand-yellow" /> {l.lastYear}</span>
                  </span>
                </div>
                <Sparkline className="h-28" draw={!reduced} height={90} points={[38, 46, 42, 55, 60, 58, 72, 70, 84]} secondary={[34, 40, 38, 47, 50, 52, 58, 61, 66]} />
              </div>
              <div className="rounded-card-inner border border-line bg-surface p-4">
                <div className="mb-2 type-caption text-ink-3">{l.direct} · {l.week} 31–37</div>
                <div className="flex h-24 items-end gap-1.5">
                  {bars.map((b, i) => (
                    <span
                      className="rise flex-1 rounded-[3px] bg-brand-blue"
                      key={i}
                      style={{ height: `${b}%`, '--i': i, '--delay': '400ms' } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-surface-2 p-5 md:p-6">
            <span className="type-caption font-medium text-ink-3">{l.agent}</span>
            <div className="ml-auto max-w-[90%] rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink">
              {l.question}
            </div>
            <div className="flex gap-2.5">
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                <BrandBars size={12} thinking={!answerVisible && !reduced} />
              </span>
              <div className={cn('min-h-[3.5rem] flex-1 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface px-3.5 py-2.5 type-small text-ink-2 transition-opacity duration-300', answerVisible ? 'opacity-100' : 'opacity-0')}>
                <span className={cn(!done && !reduced && 'caret')}>{l.answer.slice(0, typed)}</span>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5">
              <Chip>{l.q2}</Chip>
              <Chip>{l.q1}</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
