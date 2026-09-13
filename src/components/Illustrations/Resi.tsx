import { Check } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const SLOTS = 3
const LOOP = 9

/**
 * Looping scene (wide): Resi at work. On the left the sources she may read, joined to her
 * mark by flowing connectors; on the right the conversation: a question comes in, Resi
 * checks the figures, the answer lands with KPI, delta and source. Three exchanges take
 * turns on one 9 s clock (`.loop-resi-*` in loops.css). Reduced motion shows the first
 * exchange, finished.
 */
export const ResiIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const r = l.scenes.resi
  const slot = (i: number) => ({ '--delay': `${(i * LOOP) / SLOTS}s` }) as React.CSSProperties
  const rows = r.sources.length
  const rowY = (i: number) => ((i + 0.5) / rows) * 100

  return (
    <Frame className={cn('loop w-full', className)} label={r.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,4fr)_minmax(3.5rem,6rem)_auto_minmax(3.5rem,6rem)_minmax(0,8fr)] md:items-center md:gap-0">
        {/* Sources */}
        <ul className="flex flex-wrap gap-2 md:flex-col md:gap-3">
          {r.sources.map((name) => (
            <li className="flex items-center gap-2.5 rounded-card-inner border border-line bg-surface-2 px-3 py-2 type-caption font-medium text-ink shadow-card" key={name}>
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-surface-3 text-[0.5625rem] font-semibold text-ink-2">
                {name[0]}
              </span>
              {name}
              <i className="ml-auto size-1.5 rounded-full bg-[oklch(0.78_0.15_160)]" />
            </li>
          ))}
        </ul>

        {/* Connectors: every source to the mark */}
        <svg aria-hidden="true" className="hidden h-full min-h-[10rem] w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 100">
          {r.sources.map((name, i) => (
            <path
              className="flow-line"
              d={`M 0 ${rowY(i)} C 60 ${rowY(i)}, 40 50, 100 50`}
              fill="none"
              key={name}
              stroke="var(--brand-blue)"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Resi */}
        <div className="flex flex-col items-center gap-4 justify-self-center">
          <div className="relative grid size-32 place-items-center">
            <span aria-hidden="true" className="resi-aura absolute inset-4 rounded-full" />
            <span aria-hidden="true" className="resi-orbit absolute inset-1 rounded-full border border-dashed border-line-strong" />
            <ResiMark className="relative shadow-float" size={72} />
          </div>
          <ResiName className="font-display text-2xl" />
          <ul className="hidden flex-col items-center gap-1.5 lg:flex">
            {r.knows.map((k) => (
              <li className="rounded-btn border border-line bg-surface-2 px-2.5 py-1 type-caption text-ink-2" key={k}>
                {k}
              </li>
            ))}
          </ul>
        </div>

        {/* Connector: the mark to the conversation */}
        <svg aria-hidden="true" className="hidden h-full w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="flow-line" d="M 0 50 L 100 50" fill="none" stroke="var(--resi-mint)" strokeOpacity="0.7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Conversation: three exchanges take turns */}
        <div className="relative min-h-[21rem] overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:min-h-[19rem]">
          {r.turns.map((turn, i) => (
            <div className="absolute inset-0 flex flex-col gap-3 p-4 md:p-5" key={turn.q}>
              <p className="loop-resi-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink" data-slot={i} style={slot(i)}>
                {turn.q}
              </p>
              <div className="relative flex-1">
                <p className="loop-resi-think absolute left-0 top-0 flex items-center gap-2.5 type-small text-ink-3" data-slot={i} style={slot(i)}>
                  <ResiMark size={28} thinking />
                  {withResi(r.thinking)}
                </p>
                <div className="loop-resi-a flex gap-2.5" data-slot={i} style={slot(i)}>
                  <ResiMark className="mt-0.5" size={28} />
                  <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface p-3.5">
                    <p className="type-small text-ink-2 pretty">{turn.a}</p>
                    <div className="flex items-center justify-between gap-3 rounded-card-inner border border-line bg-surface-2 px-3 py-2">
                      <span className="flex flex-col">
                        <span className="type-caption text-ink-3">{turn.kpi}</span>
                        <span className="font-display text-xl font-medium leading-none tnum text-ink">{turn.value}</span>
                      </span>
                      <Chip tone={turn.up ? 'green' : 'coral'}>{turn.delta}</Chip>
                    </div>
                    <span className="flex items-center gap-1.5 type-caption text-ink-3">
                      <Check aria-hidden="true" className="text-[oklch(0.78_0.15_160)]" size={12} strokeWidth={2.5} /> {r.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}
