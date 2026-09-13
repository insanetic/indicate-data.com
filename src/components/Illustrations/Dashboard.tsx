import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ResiMark, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame, Kpi, toPath } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const LOOP = 9
const W = 100
const H = 80
const thisYear = [38, 46, 42, 55, 60, 58, 72, 70, 84]
const lastYear = [34, 40, 38, 47, 50, 52, 58, 61, 66]

/**
 * Looping scene: one dashboard card. The sources refresh and the KPIs update, this year's
 * booking line wipes in over last year's, then a question is typed, Resi checks the figures
 * and answers while the last point of the chart is marked. Timing lives in loops.css
 * (`.loop-dash-*`, 9 s); reduced motion shows the finished frame.
 */
export const DashboardIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const areaId = React.useId()
  const stagger = (i: number) => ({ '--delay': `${i * 0.12}s` }) as React.CSSProperties
  const line = toPath(thisYear, W, H)
  const lastY = (1 - (thisYear[thisYear.length - 1] / 100) * ((H - 6) / H) - 3 / H) * 100

  return (
    <Frame
      className={cn('loop w-full', className)}
      label="Dashboard aktualisiert sich, die Buchungskurve zeichnet sich, Resi beantwortet eine Frage dazu"
      style={{ '--loop': `${LOOP}s` } as React.CSSProperties}
    >
      <div className="relative pb-28 md:pb-24">
        <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
          {/* Header: property and source health */}
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 md:px-5">
            <span className="flex min-w-0 items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} />
              <span className="truncate">Hotel Alpenrose · {l.week} 37</span>
            </span>
            <span className="relative flex h-5 shrink-0 items-center justify-end">
              <span className="loop-dash-busy absolute right-0 flex items-center gap-1.5 whitespace-nowrap type-caption text-ink-2">
                <BrandBars size={10} thinking /> {l.scenes.sync.busy}
              </span>
              <Chip className="loop-dash-ok whitespace-nowrap" tone="green">
                <i className="size-1.5 rounded-full bg-current" /> {l.sourcesOk}
              </Chip>
            </span>
          </div>

          {/* KPIs refresh one after another */}
          <div className="grid grid-cols-3 gap-4 px-4 py-5 md:px-5">
            <Kpi className="loop-dash-kpi" delta="+6" label={l.occupancy} style={stagger(0)} value="84 %" />
            <Kpi className="loop-dash-kpi" delta="+3,1 %" label={l.adr} style={stagger(1)} value="142 €" />
            <Kpi className="loop-dash-kpi" delta="+9,4 %" label={l.revpar} style={stagger(2)} value="119 €" />
          </div>

          {/* Bookings: last year stays, this year wipes in */}
          <div className="border-t border-line px-4 pb-4 pt-3 md:px-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="truncate type-caption text-ink-3">{l.bookings}</span>
              <span className="flex shrink-0 items-center gap-3 type-caption text-ink-3">
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded bg-brand-blue" /> {l.thisYear}</span>
                <span className="flex items-center gap-1"><i className="w-3 border-t border-dashed border-brand-yellow" /> {l.lastYear}</span>
              </span>
            </div>
            <div className="relative h-24">
              <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
                <path d={toPath(lastYear, W, H)} fill="none" stroke="var(--brand-yellow)" strokeDasharray="3 3" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
              <svg aria-hidden="true" className="loop-dash-wipe absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
                <defs>
                  <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.22" />
                    <stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${areaId})`} />
                <path d={line} fill="none" stroke="var(--brand-blue)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              {/* The point the answer is about */}
              <span className="loop-dash-mark absolute right-0 flex -translate-y-1/2 items-center gap-2" style={{ top: `${lastY}%` }}>
                <Chip className="translate-y-5" tone="green">+18 %</Chip>
                <i className="size-2.5 translate-x-1/2 rounded-full border-2 border-surface-2 bg-brand-blue ring-4 ring-brand-blue/25" />
              </span>
            </div>
          </div>
        </div>

        {/* Question and Resi's answer float over the card's corner */}
        <div className="loop-dash-card absolute bottom-0 right-[3%] w-[90%] rounded-[1rem] border border-line-strong bg-surface p-4 shadow-float sm:w-[64%]">
          <p className="loop-dash-q type-caption text-ink-3">{l.question}</p>
          <div className="relative mt-2.5">
            <p className="loop-dash-think absolute inset-x-0 top-0 flex items-center gap-2 type-caption text-ink-3">
              <ResiMark size={22} thinking /> {withResi(l.scenes.resi.thinking)}
            </p>
            <div className="loop-dash-a flex gap-2.5">
              <ResiMark className="mt-0.5" size={22} />
              <span className="type-small text-ink pretty">{l.answer}</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
