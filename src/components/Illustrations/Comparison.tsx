import React from 'react'

import { cn } from '@/utilities/ui'

import { Backdrop, Bars, Card, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/** Bars for this year over last year, with a dashed plan line and a delta chip. */
export const ComparisonIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Vergleich ADR dieses Jahr, Vorjahr und Plan">
      <Backdrop tone="yellow" />
      <Card className="absolute inset-x-[8%] top-[12%] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="type-caption text-ink-3">{l.adr} · {l.march}</span>
            <span className="font-display text-2xl font-medium tnum">138 €</span>
          </div>
          <Chip tone="coral">−4,2 % {l.vsLastYear}</Chip>
        </div>
        <div className="relative mt-5 h-40">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 border-t border-dashed border-brand-coral"
            style={{ top: '28%' }}
          />
          <span className="absolute right-0 -top-1 -translate-y-full type-caption text-brand-coral" style={{ top: '28%' }}>
            {l.plan}
          </span>
          <Bars
            compare={[70, 74, 78, 72, 80, 84]}
            labels={l.months}
            values={[62, 66, 70, 58, 74, 80]}
          />
        </div>
        <div className="mt-3 flex items-center gap-4 type-caption text-ink-3">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-brand-blue" /> {l.thisYear}</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-surface-3" /> {l.lastYear}</span>
          <span className="flex items-center gap-1.5"><i className="h-0 w-3 border-t border-dashed border-brand-coral" /> {l.plan}</span>
        </div>
      </Card>
    </Frame>
  )
}
