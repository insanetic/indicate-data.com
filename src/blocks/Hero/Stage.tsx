'use client'

import { Check, Mail } from 'lucide-react'
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
 * The product stage under the hero: layered fragments of the product. In front, the
 * dashboard (KPIs count up, chart draws, bars rise), the agent answering and a report that
 * just went out; behind them the technical layer: a sync log ticking and a KPI definition
 * from KPI Studio. Entrance plays on load; the log loops; static under reduced motion.
 */
export const HeroStage: React.FC<{ className?: string }> = ({ className }) => {
  const locale = useLocale()
  const l = labelsFor(locale)
  const s = l.scenes
  const [progress, setProgress] = useState(0)
  const [typed, setTyped] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
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
      aria-label="Indicate: Dashboard, Agent, Report und die technische Ebene dahinter"
      className={cn('loop relative select-none text-left', className)}
      role="img"
      style={{ '--loop': '8s' } as React.CSSProperties}
    >
      <div className="relative md:aspect-[16/6.6]">
        {/* Back layer: the technical side, sync log and a KPI definition */}
        <div className="hidden md:flex absolute left-0 top-[6%] z-0 w-[34%] flex-col gap-3 rounded-[0.875rem] border border-line bg-surface-2/90 p-4 font-mono text-[0.75rem] leading-5 text-ink-3">
          <div className="flex items-center justify-between">
            <span className="text-ink-2">{s.underHood}</span>
            <span className="tnum">sync · 15 min</span>
          </div>
          <ul className="flex flex-col gap-1">
            {s.log.map((row, i) => (
              <li className="loop-log flex items-center gap-2 whitespace-nowrap" key={row[0]} style={{ '--delay': `${i * 0.9}s` } as React.CSSProperties}>
                <span className="text-accent">→</span>
                <span className="text-ink-2">{row[0]}</span>
                <span>{row[1]}</span>
                <span className="ml-auto tnum">{row[2]}</span>
                <span className="tnum">{row[3]}</span>
                <Check aria-hidden="true" className="text-[oklch(0.78_0.15_160)]" size={12} strokeWidth={2.5} />
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-line pt-3">
            <span className="mb-1 block text-ink-2">{s.kpiStudio}</span>
            <code className="block whitespace-pre text-ink-3">
              {'revpar = revenue / rooms_available\n'}
              <span className="text-ink-2">{'compare: '}</span>
              {'last_year, plan'}
            </code>
          </div>
        </div>

        {/* Front layer: the dashboard */}
        <div className="relative z-10 overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:absolute md:left-[18%] md:top-0 md:w-[58%]">
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
          <div className="flex flex-col gap-5 p-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {kpis.map((k) => (
                <div className="flex flex-col gap-1" key={k.key}>
                  <span className="type-caption text-ink-3">{l[k.key]}</span>
                  <span className="font-display text-[1.6rem] font-medium leading-none tnum text-ink">
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
                <div className="mb-2 type-caption text-ink-3">{l.bookings} · {l.thisYear} / {l.lastYear}</div>
                <Sparkline className="h-24" draw={!reduced} height={90} points={[38, 46, 42, 55, 60, 58, 72, 70, 84]} secondary={[34, 40, 38, 47, 50, 52, 58, 61, 66]} />
              </div>
              <div className="rounded-card-inner border border-line bg-surface p-4">
                <div className="mb-2 type-caption text-ink-3">{l.direct} · {l.week} 31–37</div>
                <div className="flex h-20 items-end gap-1.5">
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
        </div>

        {/* Front layer: the agent answering */}
        <div className="relative z-20 mt-4 flex flex-col gap-3 rounded-[0.875rem] border border-line-strong bg-surface-2 p-4 shadow-float md:absolute md:right-0 md:top-[24%] md:mt-0 md:w-[30%]">
          <span className="type-caption font-medium text-ink-3">{l.agent}</span>
          <div className="ml-auto max-w-[92%] rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink">
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
        </div>

        {/* Front layer: a report just went out */}
        <div className="absolute bottom-0 left-[6%] z-20 hidden items-center gap-3 rounded-card-inner border border-line-strong bg-surface px-3.5 py-2.5 shadow-float md:flex">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-yellow-soft text-accent">
            <Mail aria-hidden="true" size={16} strokeWidth={1.75} />
          </span>
          <span className="flex flex-col">
            <span className="type-caption font-medium text-ink">{s.weeklyReport} · {s.schedule}</span>
            <span className="flex items-center gap-1 type-caption text-[oklch(0.78_0.15_160)]">
              <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {s.delivered} · 3
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
