import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Backdrop, Card, Chip, Frame, Kpi, Line } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const sources = [
  { name: 'Mews', tone: 'bg-brand-blue' },
  { name: 'Re:Guest', tone: 'bg-brand-coral' },
  { name: 'Google Ads', tone: 'bg-brand-yellow' },
  { name: 'Website', tone: 'bg-ink' },
]

/** Four sources flow into Indicate and come out as one dashboard. */
export const SourcesIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Datenquellen fließen in Indicate zusammen">
      <Backdrop tone="blue" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {[22, 39, 56, 73].map((y) => (
          <path
            className="draw-line"
            d={`M 30 ${y} C 42 ${y}, 42 50, 52 50`}
            fill="none"
            key={y}
            pathLength={1}
            stroke="var(--brand-blue)"
            strokeOpacity="0.45"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d="M 58 50 C 66 50, 66 50, 72 50" fill="none" stroke="var(--brand-blue)" strokeOpacity="0.45" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>

      <ul className="absolute left-[6%] top-[10%] flex w-[26%] flex-col gap-[4.5%]">
        {sources.map((s) => (
          <li className="card-surface flex items-center gap-2 px-3 py-2 shadow-card" key={s.name}>
            <span className={cn('inline-flex size-5 items-center justify-center rounded-md text-[0.5625rem] font-semibold text-white', s.tone)}>
              {s.name[0]}
            </span>
            <span className="type-caption font-medium text-ink">{s.name}</span>
            <i className="ml-auto size-1.5 rounded-full bg-[oklch(0.62_0.15_160)]" />
          </li>
        ))}
      </ul>

      <div className="absolute left-[52%] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="flex size-14 items-center justify-center rounded-full border border-line bg-surface shadow-float">
          <BrandBars size={24} />
        </span>
      </div>

      <Card className="absolute right-[5%] top-[28%] w-[30%] p-4">
        <Chip tone="green" className="mb-3">
          <i className="size-1.5 rounded-full bg-current" /> {l.healthy}
        </Chip>
        <Kpi label={l.revpar} value="119 €" delta="+9,4 %" />
        <div className="mt-3 flex flex-col gap-1.5">
          <Line w="90%" />
          <Line w="70%" />
          <Line w="80%" />
        </div>
      </Card>
    </Frame>
  )
}
