import { Check, Mail } from 'lucide-react'
import React from 'react'

import { withResi } from '@/components/Resi'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/**
 * Looping scene (wide): on schedule a dashboard becomes a report card that flies across a
 * timeline (scheduled, created, sent) to its recipients, who tick off one after another.
 * Timing lives in loops.css (`.loop-fly`).
 */
export const FlyingKpisIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes
  const steps = [s.scheduled, s.created, s.sent]

  return (
    <Frame className={cn('loop loop-fly w-full', className)} label="Ein Report wird planmäßig an drei Empfänger gesendet">
      <div className="grid gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,4fr)] md:gap-6">
        {/* Dashboard the report is built from */}
        <div className="relative">
          <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
                <BrandBars size={12} /> {s.reportTitle}
              </span>
              <span className="loop-fly-clock rounded-pill px-2 py-0.5 text-[0.6875rem] font-medium leading-5 tnum">
                {s.schedule}
              </span>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: l.occupancy, value: '84 %', delta: '+6' },
                  { label: l.adr, value: '142 €', delta: '+3,1 %' },
                  { label: l.revpar, value: '119 €', delta: '+9,4 %' },
                ].map((k) => (
                  <div className="flex flex-col gap-0.5" key={k.label}>
                    <span className="type-caption text-ink-3">{k.label}</span>
                    <span className="font-display text-xl font-medium leading-none tnum text-ink">{k.value}</span>
                    <span className="type-caption font-medium tnum text-[oklch(0.78_0.15_160)]">{k.delta}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-card-inner border border-line bg-surface p-3">
                <Sparkline className="h-14" height={60} points={[38, 46, 42, 55, 60, 58, 72, 70, 84]} secondary={[34, 40, 38, 47, 50, 52, 58, 61, 66]} />
              </div>
            </div>
          </div>

          {/* The report card: starts on the dashboard, travels to the recipients column. */}
          <div className="loop-fly-card absolute bottom-3 right-3 z-10 flex w-[62%] items-center gap-3 rounded-card-inner border border-accent/40 bg-surface px-3 py-2.5 shadow-float will-change-transform [--fly-x:0px] [--fly-y:11rem] md:[--fly-x:calc(130%+4rem)] md:[--fly-y:0px]">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-yellow-soft text-accent">
              <Mail aria-hidden="true" size={16} strokeWidth={1.75} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate type-caption font-medium text-ink">{s.reportTitle}</span>
              <span className="type-caption text-ink-3">{s.reportKind}</span>
            </span>
          </div>
        </div>

        {/* Timeline: scheduled → created → sent, the dot travels while the card flies */}
        <div className="hidden flex-col justify-center gap-4 rounded-[1rem] border border-line bg-surface-2 p-5 md:flex">
          <span className="type-caption font-medium text-ink-3">{s.schedule}</span>
          <div className="relative">
            <span aria-hidden="true" className="absolute inset-x-1 top-[5px] h-px bg-line-strong" />
            {/* The wrapper spans the track, so 100 % of its own width is the full travel. */}
            <span aria-hidden="true" className="loop-fly-dot absolute inset-x-0 top-0 h-[11px] will-change-transform [--dot-x:calc(100%-11px)]">
              <span className="absolute left-0 top-0 size-[11px] rounded-full bg-accent" />
            </span>
            <ol className="flex justify-between pt-5">
              {steps.map((st, i) => (
                <li className={cn('type-caption', i === 0 ? 'text-left' : i === 2 ? 'text-right' : 'text-center', 'text-ink-2')} key={st}>
                  {st}
                </li>
              ))}
            </ol>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5 type-caption text-ink-3">
            <li className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-line-strong" /> PDF · 4 KPIs</li>
            <li className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-line-strong" /> {withResi(`${s.assistant}: 3 Highlights`)}</li>
          </ul>
        </div>

        {/* Recipients */}
        <ul className="flex flex-col justify-center gap-2.5">
          {s.recipients.map((name, i) => (
            <li className="flex items-center gap-3 rounded-card-inner border border-line bg-surface-2 px-3.5 py-3" key={name}>
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3 type-caption font-semibold text-ink-2">
                {name[0]}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-small font-medium text-ink">{name}</span>
                <span className="type-caption text-ink-3">{['E-Mail', 'E-Mail', 'Slack'][i]}</span>
              </span>
              <Chip className="loop-fly-tick" style={{ '--delay': `${i * 0.4}s` } as React.CSSProperties} tone="green">
                <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {s.delivered}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  )
}
