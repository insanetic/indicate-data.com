import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Backdrop, Card, Chip, Frame, Kpi, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/** A simplified dashboard: three KPIs, one chart, a source-health chip and the agent asking in. */
export const DashboardIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Dashboard mit Auslastung, ADR und RevPAR">
      <Backdrop tone="mix" />

      <Card className="absolute left-[6%] right-[10%] top-[10%] p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandBars size={14} />
            <span className="type-caption font-medium text-ink-2">Hotel Alpenrose · {l.week} 37</span>
          </div>
          <Chip tone="green">
            <i className="size-1.5 rounded-full bg-current" /> {l.sourcesOk}
          </Chip>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Kpi delta="+6" label={l.occupancy} value="84 %" />
          <Kpi delta="+3,1 %" label={l.adr} value="142 €" />
          <Kpi delta="+9,4 %" label={l.revpar} value="119 €" />
        </div>
        <div className="mt-5 rounded-card-inner border border-line bg-surface-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="type-caption text-ink-3">{l.bookings} · {l.thisYear} / {l.lastYear}</span>
            <span className="flex items-center gap-3 type-caption text-ink-3">
              <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded bg-brand-blue" /> {l.thisYear}</span>
              <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded border-t border-dashed border-brand-yellow" /> {l.lastYear}</span>
            </span>
          </div>
          <Sparkline className="h-24" draw height={80} points={[38, 46, 42, 55, 60, 58, 72, 70, 84]} secondary={[34, 40, 38, 47, 50, 52, 58, 61, 66]} />
        </div>
      </Card>

      <div className="absolute bottom-[6%] right-[4%] w-[52%]">
        <Card className="flex gap-3 rounded-[1.25rem] rounded-tr-md p-4">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2">
            <BrandBars size={13} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="type-caption text-ink-3">{l.question}</span>
            <span className="type-small text-ink pretty">{l.answer}</span>
          </div>
        </Card>
      </div>
    </Frame>
  )
}
