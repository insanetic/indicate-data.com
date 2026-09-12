import React from 'react'

import { cn } from '@/utilities/ui'

import { Backdrop, Card, Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/** Three things worth a look this week, each with its own trend. */
export const AlertsIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const rows = [
    { title: l.pickup, chip: '+18 %', tone: 'green' as const, color: 'var(--brand-blue)', points: [40, 44, 42, 55, 60, 72, 84] },
    { title: l.otaShare, chip: '34 %', tone: 'coral' as const, color: 'var(--brand-coral)', points: [20, 24, 28, 27, 31, 33, 34] },
    { title: l.cpb, chip: '−12 %', tone: 'green' as const, color: 'var(--brand-yellow)', points: [70, 66, 68, 60, 58, 52, 48] },
  ]
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Hinweise und Trends der Woche">
      <Backdrop tone="coral" />
      <Card className="absolute inset-x-[8%] top-[14%] divide-y divide-line p-2">
        {rows.map((r) => (
          <div className="flex items-center gap-4 p-3" key={r.title}>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate type-small font-medium text-ink">{r.title}</span>
              <span className="type-caption text-ink-3">{l.week} 37</span>
            </div>
            <Sparkline className="h-8 w-24 shrink-0" color={r.color} fill={false} height={30} points={r.points} />
            <Chip tone={r.tone}>{r.chip}</Chip>
          </div>
        ))}
      </Card>
    </Frame>
  )
}
