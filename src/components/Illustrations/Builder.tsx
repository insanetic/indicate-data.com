import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Bars, Chip, Donut, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const weekly = [46, 58, 52, 70, 64, 78, 86]

/**
 * Looping scene (wide): a dashboard is described in one sentence on the left, the assistant
 * thinks, and six widgets assemble on the right. Timing lives in loops.css.
 */
export const BuilderIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes
  const widget = 'loop-widget flex flex-col gap-2 rounded-card-inner border border-line bg-surface p-3.5'
  const kpi = (label: string, value: string, delta: string, delay: string) => (
    <div className={widget} style={{ '--delay': delay } as React.CSSProperties}>
      <span className="type-caption text-ink-3">{label}</span>
      <span className="font-display text-2xl font-medium leading-none tnum text-ink">{value}</span>
      <span className="type-caption font-medium tnum text-[oklch(0.78_0.15_160)]">{delta}</span>
    </div>
  )

  return (
    <Frame className={cn('loop w-full', className)} label="Dashboard wird aus einer Beschreibung gebaut">
      <div className="grid overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4 border-b border-line p-4 md:border-b-0 md:border-r md:p-5">
          <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
            <BrandBars size={12} /> {s.assistant}
          </span>
          <p className="loop-type self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink">
            {s.builderPrompt}
          </p>
          <div className="loop-think flex items-center gap-2.5 type-small text-ink-3">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
              <BrandBars size={12} thinking />
            </span>
            {s.builderThinking}
          </div>
          <Chip className="loop-done mt-auto self-start" tone="green">
            <i className="size-1.5 rounded-full bg-current" /> {s.builderDone}
          </Chip>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 md:p-5">
          {kpi(l.occupancy, '84 %', `+6 ${s.vsPlan}`, '0s')}
          {kpi(l.adr, '142 €', '+3,1 %', '0.3s')}
          {kpi(l.revpar, '119 €', '+9,4 %', '0.6s')}
          <div className={widget} style={{ '--delay': '0.9s' } as React.CSSProperties}>
            <span className="type-caption text-ink-3">{s.channelMix}</span>
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0">
                <Donut
                  label="54%"
                  segments={[
                    { value: 54, color: 'var(--brand-blue)' },
                    { value: 28, color: 'var(--brand-yellow)' },
                    { value: 18, color: 'var(--brand-coral)' },
                  ]}
                />
              </div>
              <ul className="flex flex-col gap-0.5 type-caption text-ink-2">
                <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand-blue" /> {l.direct}</li>
                <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand-yellow" /> {l.ota}</li>
              </ul>
            </div>
          </div>
          <div className={widget} style={{ '--delay': '1.2s' } as React.CSSProperties}>
            <span className="type-caption text-ink-3">{s.bookingsByWeek}</span>
            <svg aria-hidden="true" className="h-12 w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path
                className="loop-draw"
                d={toLine(weekly, 100, 40)}
                fill="none"
                pathLength={1}
                stroke="var(--brand-blue)"
                strokeLinecap="round"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className={widget} style={{ '--delay': '1.5s' } as React.CSSProperties}>
            <span className="type-caption text-ink-3">{s.planVsActual}</span>
            <div className="h-12">
              <Bars compare={[60, 65, 70, 72]} values={[64, 58, 78, 81]} />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

function toLine(points: number[], w: number, h: number) {
  const n = points.length
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (n - 1)) * w} ${h - (p / 100) * (h - 4) - 2}`)
    .join(' ')
}
