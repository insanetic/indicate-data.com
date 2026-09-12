import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Backdrop, Frame } from './primitives'
import type { IllustrationProps } from './index'

const tiles = [
  { name: 'Mews', tone: 'bg-brand-blue text-white' },
  { name: 'Oracle', tone: 'bg-brand-coral text-white' },
  { name: 'Re:Guest', tone: 'bg-ink text-white' },
  { name: 'vioma', tone: 'bg-brand-yellow text-ink' },
  { name: 'Google', tone: 'bg-surface-3 text-ink' },
  { name: 'Meta', tone: 'bg-brand-blue text-white' },
  { name: 'ASA', tone: 'bg-brand-coral text-white' },
  { name: 'CSV', tone: 'bg-surface-3 text-ink' },
]

/** Systems orbiting the Indicate hub. */
export const IntegrationsIllustration: React.FC<IllustrationProps> = ({ className }) => {
  const r = 36
  return (
    <Frame className={cn('aspect-square w-full', className)} label="Integrationen rund um Indicate">
      <Backdrop tone="mix" className="rounded-full" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="none" r={r} stroke="var(--line-strong)" strokeDasharray="1 2" strokeWidth="0.3" />
        <circle cx="50" cy="50" fill="none" r={r / 2} stroke="var(--line-strong)" strokeDasharray="1 2" strokeWidth="0.3" />
        {tiles.map((_, i) => {
          const a = (i / tiles.length) * Math.PI * 2 - Math.PI / 2
          return (
            <line
              key={i}
              stroke="var(--brand-blue)"
              strokeOpacity="0.35"
              strokeWidth="0.3"
              x1="50"
              x2={50 + Math.cos(a) * r}
              y1="50"
              y2={50 + Math.sin(a) * r}
            />
          )
        })}
      </svg>
      <span className="absolute left-1/2 top-1/2 flex size-[18%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-float">
        <BrandBars size={34} />
      </span>
      {tiles.map((t, i) => {
        const a = (i / tiles.length) * Math.PI * 2 - Math.PI / 2
        const x = 50 + Math.cos(a) * r
        const y = 50 + Math.sin(a) * r
        return (
          <span
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-pill border border-line bg-surface py-1 pl-1 pr-2.5 shadow-card"
            key={t.name}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className={cn('inline-flex size-5 items-center justify-center rounded-full text-[0.5625rem] font-semibold', t.tone)}>
              {t.name[0]}
            </span>
            <span className="type-caption font-medium text-ink">{t.name}</span>
          </span>
        )
      })}
    </Frame>
  )
}
