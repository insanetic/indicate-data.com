import { BookMarked, Check, LayoutDashboard, Pin, Plus } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { curve } from './stage'
import type { IllustrationProps } from './index'

/** ADR per October week, the answer's chart and the widget it becomes (0–100). */
const adrWeeks = [78, 74, 62, 58, 55]
const occupancy = [52, 58, 55, 66, 70, 78, 84]
const adrTrend = [70, 72, 69, 71, 64, 60, 58]
/** Channel mix: direct, OTA, other (shares of 100). */
const mix = [46, 38, 16]

const delay = (s: number) => ({ '--delay': `${s}s` }) as React.CSSProperties

/** The answer's chart; the new widget repeats it at its own size. */
const WeekBars: React.FC<{ className?: string; grow?: boolean }> = ({ className, grow = false }) => (
  <span className={cn('flex items-end gap-1', className)}>
    {adrWeeks.map((v, i) => (
      <span
        className={cn('flex-1 rounded-t-[2px]', i >= 2 ? 'bg-brand-coral' : 'bg-brand-blue', grow && 'loop-verify-grow')}
        key={i}
        style={{ height: `${v}%`, ...(grow ? delay(i * 0.05) : {}) }}
      />
    ))}
  </span>
)

/**
 * Looping scene, 10 s: Resi answering inside the app, with the dashboard on the left and the
 * chat on the right. A question about the ADR widget arrives with the widget pinned as context
 * and the widget lights; Resi checks the KPI catalogue, then answers with a chart and the
 * source it used (the catalogue KPI and version, the connection, checked). "Add to dashboard"
 * is pressed and the answer travels into the empty slot as a new widget. Below `sm` the chat
 * sits under the dashboard. Reduced motion shows the finished frame, widget placed.
 * Timing: `.loop-verify-*` in loops.css.
 */
export const AgentIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const v = l.scenes.verify

  return (
    <Frame className={cn('loop loop-verify mx-auto w-full max-w-[42rem]', className)} label={v.title}>
      <div className="overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float [container-type:inline-size]">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-2 type-small font-medium text-ink">
            <BrandBars size={13} /> {v.dashboard}
          </span>
          <span className="type-caption tnum text-ink-3">{v.period}</span>
        </div>

        <div className="grid sm:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          {/* Dashboard */}
          <div className="grid grid-cols-2 content-start gap-2.5 border-b border-line bg-surface p-3 sm:border-b-0 sm:border-r">
            <div className="flex flex-col gap-1 rounded-card-inner border border-line bg-surface-2 p-3">
              <span className="truncate type-caption text-ink-3">{l.occupancy}</span>
              <span className="font-display text-lg font-medium leading-none tnum text-ink">84 %</span>
              <svg aria-hidden="true" className="mt-1 h-7 w-full" preserveAspectRatio="none" viewBox="0 0 100 28">
                <path d={curve(occupancy, 100, 28, 3)} fill="none" stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="relative flex flex-col gap-1 rounded-card-inner border border-line bg-surface-2 p-3">
              <span aria-hidden="true" className="loop-verify-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" />
              <span className="flex items-center justify-between gap-2">
                <span className="truncate type-caption text-ink-3">{l.adr}</span>
                <Chip tone="coral">−3,1 %</Chip>
              </span>
              <span className="font-display text-lg font-medium leading-none tnum text-ink">138 €</span>
              <svg aria-hidden="true" className="mt-1 h-7 w-full" preserveAspectRatio="none" viewBox="0 0 100 28">
                <path d={curve(adrTrend, 100, 28, 3)} fill="none" stroke="var(--brand-coral)" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="col-span-2 flex flex-col gap-2 rounded-card-inner border border-line bg-surface-2 p-3">
              <span className="type-caption text-ink-3">{l.scenes.channelMix}</span>
              <span className="flex h-2.5 gap-0.5 overflow-hidden rounded-pill">
                <span className="bg-brand-blue" style={{ width: `${mix[0]}%` }} />
                <span className="bg-brand-yellow" style={{ width: `${mix[1]}%` }} />
                <span className="bg-surface-3" style={{ width: `${mix[2]}%` }} />
              </span>
              <span className="flex gap-3 type-caption text-ink-3">
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-brand-blue" /> {l.direct} {mix[0]} %
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-brand-yellow" /> {l.ota} {mix[1]} %
                </span>
              </span>
            </div>
            {/* The empty slot, and the widget that lands in it */}
            <div className="relative col-span-2 grid">
              <span className="loop-verify-slot flex min-h-[5.75rem] items-center justify-center gap-1.5 rounded-card-inner border border-dashed border-line-strong type-caption text-ink-3 [grid-area:1/1]">
                <Plus aria-hidden="true" size={13} strokeWidth={2} /> {v.slot}
              </span>
              <div className="loop-verify-land relative z-10 flex min-h-[5.75rem] flex-col gap-2 rounded-card-inner border border-line bg-surface-2 p-3 [grid-area:1/1]">
                <span aria-hidden="true" className="loop-verify-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" />
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate type-caption text-ink-3">{v.chart}</span>
                  <ResiMark size={14} />
                </span>
                <WeekBars className="h-9" />
              </div>
            </div>
          </div>

          {/* Chat with Resi */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
              <ResiMark size={24} />
              <span className="flex flex-col">
                <ResiName className="type-caption font-medium leading-4" />
                <span className="type-caption leading-4 text-ink-3">{l.scenes.resi.role}</span>
              </span>
            </div>
            <div className="flex flex-col gap-3 p-3.5">
              <div className="loop-verify-q flex max-w-[92%] flex-col items-end gap-1.5 self-end">
                <span className="flex items-center gap-1 rounded-pill border border-line bg-surface px-2 py-0.5 type-caption text-ink-2">
                  <Pin aria-hidden="true" className="text-brand-blue" size={11} strokeWidth={2} /> {v.context}
                </span>
                <p className="rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-caption text-ink">{v.question}</p>
              </div>

              <div className="grid">
                <p className="loop-verify-think flex items-center gap-2 self-start type-caption text-ink-3 [grid-area:1/1]">
                  <ResiMark size={20} thinking />
                  {withResi(v.thinking)}
                </p>
                <div className="loop-verify-a flex gap-2 [grid-area:1/1]">
                  <ResiMark className="mt-0.5 shrink-0" size={20} />
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <p className="loop-verify-stream type-caption text-ink-2 pretty">{v.answer}</p>
                    <div className="flex flex-col gap-2 rounded-card-inner border border-line bg-surface p-2.5">
                      <span className="flex items-center justify-between gap-2 type-caption text-ink-3">
                        <span className="truncate">{v.chart}</span>
                        <span className="font-medium tnum text-ink">138 €</span>
                      </span>
                      <WeekBars className="h-9" grow />
                    </div>
                    <span className="loop-verify-cite flex flex-wrap items-center gap-x-2 gap-y-1 type-caption text-ink-3">
                      <BookMarked aria-hidden="true" className="shrink-0 text-brand-blue" size={12} strokeWidth={1.75} />
                      {v.source}
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex size-4 items-center justify-center rounded-[4px] bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark */}
                          <img alt="" className="size-3 object-contain" height={12} src="/integrations/mews.webp" width={12} />
                        </span>
                        Mews
                      </span>
                      <Chip tone="green">
                        <Check aria-hidden="true" size={10} strokeWidth={3} /> {v.verified}
                      </Chip>
                    </span>
                    <span className="loop-verify-cite self-start">
                      <span className="loop-verify-press grid rounded-btn border border-line-strong bg-surface px-2.5 py-1.5 type-caption font-medium text-ink">
                        <span className="loop-verify-before flex items-center gap-1.5 [grid-area:1/1]">
                          <LayoutDashboard aria-hidden="true" size={12} strokeWidth={2} /> {v.add}
                        </span>
                        <span className="loop-verify-after flex items-center gap-1.5 text-success-deep [grid-area:1/1]">
                          <Check aria-hidden="true" size={12} strokeWidth={2.5} /> {v.added}
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
