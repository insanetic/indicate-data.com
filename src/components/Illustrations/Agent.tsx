import React from 'react'

import { cn } from '@/utilities/ui'

import { Backdrop, Card, Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'
import { ResiMark, withResi } from '@/components/Resi'

/** A short exchange with Resi: question, answer with a small chart, and where it works. */
export const AgentIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Gespräch mit Resi">
      <Backdrop tone="blue" />
      <Card className="absolute inset-x-[8%] top-[9%] flex flex-col gap-4 p-5">
        <div className="flex justify-end">
          <div className="max-w-[78%] rounded-[1rem] rounded-tr-sm bg-ink px-3.5 py-2.5 text-surface">
            <span className="block type-caption opacity-70">{l.you}</span>
            <span className="type-small">{l.q1}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <ResiMark className="mt-1" size={28} />
          <div className="flex w-full flex-col gap-3 rounded-[1rem] rounded-tl-sm border border-line bg-surface-2 p-3.5">
            <span className="type-caption text-ink-3">{withResi(l.agent)}</span>
            <span className="type-small text-ink pretty">{l.a1}</span>
            <div className="rounded-card-inner bg-surface p-3">
              <div className="flex items-baseline justify-between">
                <span className="type-caption text-ink-3">{l.occupancy}, {l.lastWeek}</span>
                <Chip tone="green">+6</Chip>
              </div>
              <span className="font-display text-2xl font-medium tnum">84 %</span>
              <Sparkline className="mt-1 h-14" height={50} points={[52, 58, 55, 66, 70, 78, 84]} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>{l.q2}</Chip>
        </div>
      </Card>
      <div className="absolute bottom-[7%] left-[8%] flex items-center gap-2">
        <Chip tone="neutral">MCP</Chip>
        <Chip tone="neutral">ChatGPT</Chip>
        <Chip tone="neutral">Claude</Chip>
      </div>
    </Frame>
  )
}
