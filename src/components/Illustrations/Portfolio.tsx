import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

type Property = {
  occupancy: string
  adr: string
  plan: string
  planPositive: boolean
  roas: string
  pickup: string
  points: number[]
  /** Plan and actual revenue, 0–100, for the group chart. */
  planBar: number
  actualBar: number
}

/** Demo figures for four properties; identical in every language. */
const properties: Property[] = [
  { occupancy: '84 %', adr: '142 €', plan: '+4 %', planPositive: true, roas: '4,2×', pickup: '+38', points: [52, 58, 55, 66, 70, 78, 84], planBar: 70, actualBar: 76 },
  { occupancy: '77 %', adr: '188 €', plan: '−3 %', planPositive: false, roas: '3,1×', pickup: '+21', points: [70, 66, 72, 68, 74, 71, 77], planBar: 82, actualBar: 78 },
  { occupancy: '91 %', adr: '121 €', plan: '+9 %', planPositive: true, roas: '5,6×', pickup: '+54', points: [60, 68, 74, 79, 85, 88, 91], planBar: 58, actualBar: 66 },
  { occupancy: '69 %', adr: '164 €', plan: '−6 %', planPositive: false, roas: '2,4×', pickup: '+12', points: [74, 70, 72, 66, 71, 67, 69], planBar: 64, actualBar: 57 },
]

/**
 * Looping scene (wide) for hotels and groups: the cursor moves through the properties of a
 * group, the detail card follows (occupancy, ADR, pickup, campaign return, plan gap) and the
 * group chart on the right brings the same property's plan-vs-actual bars to the front.
 * Timing lives in loops.css (`.loop-slot-4`, `.loop-row-4`, `.loop-focus-4`).
 */
export const PortfolioIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes

  return (
    <Frame className={cn('loop w-full', className)} label="Vier Hotels einer Gruppe im Vergleich mit Plan und Kampagnen-ROI">
      <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
            <BrandBars size={12} /> {s.groupTotal} · 4 Spaces
          </span>
          <span className="type-caption tnum text-ink-3">{l.occupancy} 80 % · {l.adr} 154 €</span>
        </div>

        <div className="grid md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,4fr)]">
          <ul className="flex flex-col gap-1 border-b border-line p-3 md:border-b-0 md:border-r">
            {s.properties.map((name, i) => (
              <li
                className="loop-row-4 flex items-center justify-between gap-3 rounded-card-inner px-3 py-2.5 type-small"
                data-first={i === 0 || undefined}
                key={name}
                style={{ '--delay': `${i * 2.5}s` } as React.CSSProperties}
              >
                <span className="flex items-center gap-2.5 font-medium">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-surface text-[0.6875rem] font-semibold text-ink-2">
                    {name[0]}
                  </span>
                  {name}
                </span>
                <span className="tnum text-ink-3">{properties[i].occupancy}</span>
              </li>
            ))}
          </ul>

          <div className="relative min-h-[15rem] border-b border-line p-4 md:border-b-0 md:border-r">
            {properties.map((p, i) => (
              <div
                className="loop-slot-4 absolute inset-4 flex flex-col gap-4"
                data-first={i === 0 || undefined}
                key={i}
                style={{ '--delay': `${i * 2.5}s` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-lg font-medium text-ink">{s.properties[i]}</span>
                  <Chip tone={p.planPositive ? 'green' : 'coral'}>{p.plan} {s.vsPlan}</Chip>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="type-caption text-ink-3">{l.adr}</span>
                    <span className="font-display text-xl font-medium leading-none tnum text-ink">{p.adr}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="type-caption text-ink-3">{s.pickup}</span>
                    <span className="font-display text-xl font-medium leading-none tnum text-ink">{p.pickup}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="type-caption text-ink-3">{s.campaignRoi}</span>
                    <span className="font-display text-xl font-medium leading-none tnum text-accent">{p.roas}</span>
                  </div>
                </div>
                <div className="rounded-card-inner border border-line bg-surface p-3">
                  <span className="mb-1 block type-caption text-ink-3">{l.occupancy} · {l.week} 31–37</span>
                  <Sparkline className="h-12" height={50} points={p.points} />
                </div>
              </div>
            ))}
          </div>

          {/* Group chart: plan (grey) vs actual (blue), the active property's pair is in focus. */}
          <div className="flex flex-col gap-3 p-4">
            <span className="type-caption text-ink-3">{s.planVsActual} · {s.perProperty}</span>
            <div className="flex flex-1 items-end gap-3">
              {properties.map((p, i) => (
                <div
                  className="loop-focus-4 flex h-full min-h-[8rem] flex-1 flex-col justify-end gap-1.5"
                  key={i}
                  style={{ '--delay': `${i * 2.5}s` } as React.CSSProperties}
                >
                  <div className="flex h-full items-end gap-1">
                    <span className="w-full rounded-[3px] bg-surface-3" style={{ height: `${p.planBar}%` }} />
                    <span
                      className={cn('w-full rounded-[3px]', p.planPositive ? 'bg-brand-blue' : 'bg-brand-coral')}
                      style={{ height: `${p.actualBar}%` }}
                    />
                  </div>
                  <span className="truncate text-center text-[0.625rem] leading-3 text-ink-3">{s.properties[i]}</span>
                </div>
              ))}
            </div>
            <ul className="flex gap-3 type-caption text-ink-3">
              <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-surface-3" /> {l.plan}</li>
              <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand-blue" /> {l.thisYear}</li>
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  )
}
