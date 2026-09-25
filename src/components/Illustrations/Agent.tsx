import { ArrowUp, BookMarked, Check, LayoutDashboard, Pencil, Pin, Plus, Sparkles } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { curve } from './stage'
import type { IllustrationProps } from './index'

/** ADR per October week: the answer's chart and the widget it becomes (0–100). */
const adrWeeks = [78, 74, 62, 58, 55]
const occupancy = [52, 58, 55, 66, 70, 78, 84]
const adrTrend = [70, 72, 69, 71, 64, 60, 58]
/** ADR by channel after Resi's edit: direct, OTA, other. */
const byChannel = [
  { value: '152 €', height: 88, color: 'bg-brand-blue' },
  { value: '128 €', height: 62, color: 'bg-brand-yellow' },
  { value: '134 €', height: 70, color: 'bg-ink-3' },
]
/** Channel mix: direct, OTA, other (shares of 100). */
const mix = [46, 38, 16]

const turnDelay = (turn: number) => ({ '--delay': `${turn * 6}s` }) as React.CSSProperties

const WeekBars: React.FC<{ className?: string; grow?: boolean }> = ({ className, grow = false }) => (
  <span className={cn('flex items-end gap-1', className)}>
    {adrWeeks.map((v, i) => (
      <span
        className={cn('flex-1 rounded-t-[2px]', i >= 2 ? 'bg-brand-coral' : 'bg-brand-blue', grow && 'loop-verify-grow')}
        key={i}
        style={{ height: `${v}%`, ...(grow ? ({ '--delay': `${i * 0.05}s` } as React.CSSProperties) : {}) }}
      />
    ))}
  </span>
)

const Widget: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('relative flex flex-col gap-1 rounded-card-inner border border-line bg-surface p-3', className)}>{children}</div>
)

/**
 * Looping scene, 12 s: Resi working on a dashboard. The dashboard card sits behind, Resi's chat
 * card in front. First exchange: a question about October's ADR; Resi checks the KPI catalogue
 * and answers with a chart and its checked source, then puts the chart on the dashboard herself:
 * it lifts out of the chat and flies into the empty slot as a new widget. Second exchange: asked
 * to show ADR by channel, she rebuilds the ADR widget in place and marks it as edited. Below
 * `sm` the chat sits under the dashboard. Reduced motion shows the first exchange, widget placed.
 * Timing: `.loop-verify-*` in loops.css.
 */
export const AgentIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const v = l.scenes.verify

  return (
    <Frame className={cn('loop loop-verify mx-auto w-full max-w-[44rem]', className)} label={v.title}>
      <div className="relative flex flex-col gap-4 [container-type:inline-size] sm:block sm:aspect-[6/5]">
        {/* Dashboard, behind */}
        <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float sm:absolute sm:left-0 sm:top-0 sm:w-[68%]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 type-small font-medium text-ink">
              <BrandBars size={13} /> {v.dashboard}
            </span>
            <span className="type-caption tnum text-ink-3">{v.period}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-3">
            {/* ADR: rebuilt by Resi in the second exchange */}
            <Widget>
              <span aria-hidden="true" className="loop-verify-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" />
              <span className="flex items-center justify-between gap-2">
                <span className="truncate type-caption text-ink-3">{l.adr}</span>
                <span className="grid justify-items-end">
                  <span className="loop-verify-old [grid-area:1/1]">
                    <Chip tone="coral">−3,1 %</Chip>
                  </span>
                  <span className="loop-verify-new [grid-area:1/1]">
                    <Chip tone="blue">
                      <Pencil aria-hidden="true" size={10} strokeWidth={2.25} />
                      <span className="max-sm:hidden">{v.edited}</span>
                    </Chip>
                  </span>
                </span>
              </span>
              <span className="grid">
                <span className="loop-verify-old flex flex-col gap-1 [grid-area:1/1]">
                  <span className="font-display text-lg font-medium leading-none tnum text-ink">138 €</span>
                  <svg aria-hidden="true" className="mt-1 h-8 w-full" preserveAspectRatio="none" viewBox="0 0 100 28">
                    <path d={curve(adrTrend, 100, 28, 3)} fill="none" stroke="var(--brand-coral)" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>
                <span className="loop-verify-new grid grid-cols-3 items-end gap-1.5 [grid-area:1/1]">
                  {byChannel.map((c, i) => (
                    <span className="flex flex-col gap-1" key={i}>
                      <span className="type-caption tnum leading-none text-ink">{c.value}</span>
                      <span className="flex h-7 items-end">
                        <span className={cn('w-full rounded-t-[2px]', c.color)} style={{ height: `${c.height}%` }} />
                      </span>
                      <span className="truncate text-[0.625rem] leading-3 text-ink-3">{[l.direct, l.ota, v.other][i]}</span>
                    </span>
                  ))}
                </span>
              </span>
            </Widget>
            <Widget>
              <span className="truncate type-caption text-ink-3">{l.occupancy}</span>
              <span className="font-display text-lg font-medium leading-none tnum text-ink">84 %</span>
              <svg aria-hidden="true" className="mt-1 h-8 w-full" preserveAspectRatio="none" viewBox="0 0 100 28">
                <path d={curve(occupancy, 100, 28, 3)} fill="none" stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </Widget>
            <Widget className="col-span-2 gap-2">
              <span className="type-caption text-ink-3">{l.scenes.channelMix}</span>
              <span className="flex h-2.5 gap-0.5 overflow-hidden rounded-pill">
                <span className="bg-brand-blue" style={{ width: `${mix[0]}%` }} />
                <span className="bg-brand-yellow" style={{ width: `${mix[1]}%` }} />
                <span className="bg-ink-3" style={{ width: `${mix[2]}%` }} />
              </span>
              <span className="flex gap-3 type-caption text-ink-3">
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-brand-blue" /> {l.direct} {mix[0]} %
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-1.5 rounded-full bg-brand-yellow" /> {l.ota} {mix[1]} %
                </span>
              </span>
            </Widget>
            {/* The empty slot, and the widget Resi puts into it */}
            <div className="relative grid grid-cols-1">
              <span className="loop-verify-slot flex min-h-[6rem] items-center justify-center gap-1.5 rounded-card-inner border border-dashed border-line-strong type-caption text-ink-3 [grid-area:1/1]">
                <Plus aria-hidden="true" size={13} strokeWidth={2} /> {v.slot}
              </span>
              <Widget className="loop-verify-land z-20 min-h-[6rem] gap-2 shadow-float [grid-area:1/1]">
                <span aria-hidden="true" className="loop-verify-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" />
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate type-caption text-ink-3">{v.chart}</span>
                  <ResiMark size={14} />
                </span>
                <WeekBars className="h-9" />
                <span className="flex items-center gap-1 text-[0.625rem] leading-3 text-ink-3">
                  <Sparkles aria-hidden="true" className="text-brand-blue" size={10} strokeWidth={2} /> {v.created}
                </span>
              </Widget>
            </div>
            <Widget>
              <span className="truncate type-caption text-ink-3">{l.pickup}</span>
              <span className="font-display text-lg font-medium leading-none tnum text-ink">+38</span>
              <span className="mt-auto flex h-6 items-end gap-0.5">
                {[30, 45, 40, 62, 55, 80, 92].map((h, i) => (
                  <span className="flex-1 rounded-t-[1px] bg-brand-blue/70" key={i} style={{ height: `${h}%` }} />
                ))}
              </span>
            </Widget>
          </div>
        </div>

        {/* Resi's chat, in front */}
        <div className="relative z-10 flex flex-col rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float sm:absolute sm:bottom-0 sm:right-0 sm:w-[54%]">
          <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
            <ResiMark size={24} />
            <span className="flex flex-col">
              <ResiName className="type-caption font-medium leading-4" />
              <span className="type-caption leading-4 text-ink-3">{l.scenes.resi.role}</span>
            </span>
          </div>
          <div className="grid p-3.5 pb-3">
            {v.turns.map((turn, t) => (
              <div className="flex flex-col gap-3 [grid-area:1/1]" data-turn={t} key={turn.q} style={turnDelay(t)}>
                <div className="loop-verify-q flex max-w-[94%] flex-col items-end gap-1.5 self-end">
                  <span className="flex items-center gap-1 rounded-pill border border-line bg-surface px-2 py-0.5 type-caption text-ink-2">
                    {t === 0 ? (
                      <LayoutDashboard aria-hidden="true" className="text-brand-blue" size={11} strokeWidth={2} />
                    ) : (
                      <Pin aria-hidden="true" className="text-brand-blue" size={11} strokeWidth={2} />
                    )}
                    {turn.context}
                  </span>
                  <p className="rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-caption text-ink">{turn.q}</p>
                </div>
                <div className="grid">
                  <p className="loop-verify-think flex items-center gap-2 self-start type-caption text-ink-3 [grid-area:1/1]">
                    <ResiMark size={20} thinking />
                    {withResi(v.thinking)}
                  </p>
                  <div className="loop-verify-a flex gap-2 [grid-area:1/1]">
                    <ResiMark className="mt-0.5 shrink-0" size={20} />
                    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                      <p className="loop-verify-stream type-caption text-ink-2 pretty">{turn.a}</p>
                      {t === 0 && (
                        <>
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
                          <span className="grid type-caption">
                            <span className="loop-verify-busy flex items-center gap-2 text-ink-3 [grid-area:1/1]">
                              <ResiMark size={16} thinking />
                              {withResi(v.placing)}
                            </span>
                            <span className="loop-verify-done flex items-center gap-1.5 text-success-deep [grid-area:1/1]">
                              <Check aria-hidden="true" size={12} strokeWidth={2.5} /> {v.placed}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-3.5 mb-3.5 mt-auto flex items-center justify-between gap-2 rounded-pill border border-line bg-surface px-3.5 py-2 type-caption text-ink-3">
            <span>{withResi(l.scenes.hub.ask)}</span>
            <ArrowUp aria-hidden="true" className="rounded-full bg-surface-3 p-0.5" size={18} strokeWidth={2} />
          </div>
        </div>
      </div>
    </Frame>
  )
}
