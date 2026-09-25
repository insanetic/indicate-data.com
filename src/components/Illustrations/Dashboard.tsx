import React from 'react'

import { ResiMark } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip } from './primitives'
import { Scene } from './Scene'
import { Lit, SLOTS, build, curve, perSlot, slotDelay } from './stage'
import { widgetsCopy } from './copy/widgets'
import type { IllustrationProps } from './index'

/** The connections, left to right; each exchange reads one of them. */
const logos = ['/integrations/mews.webp', '/integrations/google_ads.webp', '/integrations/re_guest.png']

/**
 * Wiring strip between the tiles and the dashboard: a 200 × 16 box whose width matches the
 * tile row, so the tile centres sit at 1/6, 3/6 and 5/6 and every line ends under Resi's mark.
 */
const STRIP_W = 200
const STRIP_H = 16
const MID = STRIP_W / 2
const tileX = [STRIP_W / 6, MID, (STRIP_W * 5) / 6]
const wire = (x: number) => {
  if (Math.abs(x - MID) < 0.01) return `M ${MID} 0 V ${STRIP_H}`
  const d = Math.sign(MID - x)
  const r = 3
  return `M ${x} 0 V ${7 - r} Q ${x} 7 ${x + d * r} 7 H ${MID - d * r} Q ${MID} 7 ${MID} ${7 + r} V ${STRIP_H}`
}

/** The property's palette, applied in the third exchange (`--tint`, registered in loops.css). */
const TINTS = ['var(--brand-blue)', 'var(--brand-blue)', 'var(--brand-yellow)']
const TINT_AT = 1.2

const tri = (pick: (slot: number) => string | number, delay = 0): React.CSSProperties =>
  ({
    ...Object.fromEntries(Array.from({ length: SLOTS }, (_, slot) => [`--s${slot}`, pick(slot)])),
    '--delay': `${delay}s`,
  }) as React.CSSProperties
const only = (slot: number) => (s: number) => (s === slot ? 1 : 0)

/** Room revenue per week, this year against last year (0–100, top = 100). */
const revenueNow = [30, 38, 34, 46, 52, 49, 62, 70]
const revenueLast = [28, 31, 33, 36, 40, 42, 45, 50]
/** Occupancy over the last weeks, for the scorecard's trend line. */
const occupancyTrend = [30, 44, 38, 56, 50, 66, 72, 92]
/** Weekly bookings from Google Ads against a target of 30. */
const bookings = [34, 31, 26, 36, 24, 33, 38, 29]
const TARGET = 30
const BOOKINGS_MAX = 42
/** Requests by channel, share of 1. */
const shares = [0.52, 0.31, 0.17]
const shareColours = ['var(--tint)', 'var(--brand-blue-soft)', 'var(--line-strong)']

/**
 * Looping scene (story visual), 12 s: every connection brings its KPI collection and Resi
 * builds the widgets from it. Three connection tiles (Mews, Google Ads, Re:Guest) with their
 * KPIs sit above the dashboard; each exchange one lights, its line runs down to Resi's mark on
 * the dashboard's edge and she places the next widgets: a scorecard and a line against last
 * year, then columns against a target (weeks under target in coral), then a pie, as the
 * dashboard takes on the property's colours. Each widget names its kind. The canvas clears at
 * the end of the loop. Reduced motion shows the finished dashboard. Timing: `.loop-hub-*`,
 * `.loop-tri-*` and `.loop-widgets-*` (scenes/widgets.css).
 */
export const DashboardIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = widgetsCopy[locale === 'en' ? 'en' : 'de']
  const areaId = `widgets-area-${React.useId()}`

  /** A dashboard cell: the dashed free slot underneath, the widget arriving in `slot`. */
  const cell = (slot: number, kind: string, title: string, body: React.ReactNode, stagger = 0) => (
    <div className="relative grid min-h-[6.5rem]">
      <div className="flex items-center justify-center rounded-card-inner border border-dashed border-line-strong [grid-area:1/1]">
        <span className="type-caption text-ink-3">{c.empty}</span>
      </div>
      <div className={`loop-widgets-in-${slot} relative flex min-w-0 flex-col gap-2 rounded-card-inner border border-line bg-surface p-3 [grid-area:1/1]`} data-slot={slot}>
        <Lit slot={slot} stagger={stagger} tone="out" />
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate type-caption text-ink-3">{title}</span>
          <span className="shrink-0 rounded-md border border-line px-1.5 text-[0.625rem] leading-4 text-ink-3">{kind}</span>
        </div>
        {body}
      </div>
    </div>
  )

  return (
    <Scene className={cn('scene-widgets w-full', className)} label={c.label} lead={0.8}>
      <div className="flex flex-col">
        {/* Connections and the KPI collection each one brings. */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {c.sources.map((src, i) => (
            <div className="scene-build-in" key={src.name} style={{ ...build(1 + i), '--from-y': '8px' } as React.CSSProperties}>
              <div className="relative flex h-full flex-col gap-2 rounded-[0.875rem] border border-line-strong bg-surface-2 p-2.5 shadow-card sm:p-3">
                <Lit slot={i} />
                <span className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                    <img alt="" className="size-4.5 object-contain" height={18} src={logos[i]} width={18} />
                  </span>
                  <span className="max-w-full truncate type-caption font-medium text-ink">{src.name}</span>
                </span>
                <span className="hidden flex-wrap gap-1 sm:flex">
                  {src.kpis.map((kpi) => (
                    <span className="relative grid" key={kpi}>
                      <span className="rounded-md border border-line px-1.5 text-[0.625rem] leading-4 text-ink-3 [grid-area:1/1]">{kpi}</span>
                      <span className="loop-widgets-chip rounded-md border border-brand-blue/50 bg-brand-blue-soft px-1.5 text-[0.625rem] leading-4 text-ink [grid-area:1/1]" style={slotDelay(i)}>
                        {kpi}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Each connection's line runs down to Resi's mark on the dashboard's edge. */}
        <svg aria-hidden="true" className="scene-fade block aspect-[200/16] w-full" style={build(4)} viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}>
          {tileX.map((x) => (
            <path className="hub-dots" d={wire(x)} fill="none" key={x} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.5" />
          ))}
          {tileX.map((x, slot) => (
            <g key={slot}>
              <path className="loop-hub-draw" d={wire(x)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.5" style={slotDelay(slot)} />
              <path
                className="loop-hub-comet"
                d={wire(x)}
                fill="none"
                pathLength={1}
                stroke="var(--brand-yellow)"
                strokeLinecap="round"
                strokeWidth="1"
                style={{ ...slotDelay(slot), ...(slot === 1 ? { '--comet': 0.3, '--comet-from': 0.35 } : { '--comet': 0.12, '--comet-from': 0.17 }) } as React.CSSProperties}
              />
            </g>
          ))}
        </svg>

        {/* The dashboard; its accent follows the property's palette (`--tint`). */}
        <div className="scene-build" style={build(0)}>
          <div className="loop-tri-tint relative rounded-[1.125rem] border border-line-strong bg-surface-2 px-3 pb-3 pt-7 shadow-float sm:px-4 sm:pb-4" style={tri((slot) => TINTS[slot], TINT_AT)}>
            {/* Resi's mark on the top edge; it swells as the data arrives. */}
            <span className="absolute left-1/2 top-0 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span aria-hidden="true" className="resi-aura absolute -inset-1.5 rounded-full" />
              <span className="loop-resi-core relative grid place-items-center" style={perSlot}>
                <ResiMark className="ring-4 ring-surface" size={36} />
              </span>
            </span>

            <div className="mb-3 flex flex-col items-center gap-2">
              <span className="grid w-full justify-items-center text-center">
                {c.status.map((line, slot) => (
                  <span className="loop-tri-show type-caption font-medium text-ink-2 [grid-area:1/1]" key={line} style={tri(only(slot), 0.8)}>
                    {line}
                  </span>
                ))}
              </span>
              <span className="flex w-full items-center justify-between gap-3">
                <span className="truncate type-caption text-ink-3">{c.property}</span>
                <span className="loop-widgets-in-2 flex shrink-0 items-center gap-1.5 type-caption text-ink-2" data-slot={2}>
                  {c.colours}
                  <span className="flex -space-x-1">
                    <i className="size-3 rounded-full bg-brand-yellow ring-2 ring-surface-2" />
                    <i className="size-3 rounded-full bg-brand-blue-soft ring-2 ring-surface-2" />
                    <i className="size-3 rounded-full bg-surface-3 ring-2 ring-surface-2" />
                  </span>
                </span>
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {cell(
                0,
                c.kinds.scorecard,
                c.scorecard.title,
                <div className="flex flex-1 flex-col justify-end gap-2">
                  <span className="font-display text-[1.75rem] font-medium leading-none tnum text-ink">
                    <span className="loop-hub-count" style={{ ...slotDelay(0), '--hub-to': c.scorecard.value } as React.CSSProperties} />
                    {' %'}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Chip tone="green">{c.scorecard.delta}</Chip>
                    <span className="type-caption text-ink-3">{c.scorecard.vs}</span>
                  </span>
                  <svg aria-hidden="true" className="h-5 w-full" viewBox="0 0 240 20">
                    <path className="loop-hub-trace" d={curve(occupancyTrend, 240, 20, 2)} fill="none" pathLength={1} stroke="var(--tint)" strokeLinecap="round" strokeWidth="1.75" style={slotDelay(0)} />
                  </svg>
                </div>,
              )}
              {cell(
                0,
                c.kinds.line,
                c.line.title,
                <div className="flex flex-1 flex-col justify-end gap-1.5">
                  <svg aria-hidden="true" className="aspect-[4/1] w-full" viewBox="0 0 240 60">
                    <defs>
                      <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="var(--tint)" stopOpacity="0.22" />
                        <stop offset="1" stopColor="var(--tint)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={curve(revenueLast, 240, 60, 3)} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3.5" strokeWidth="1.5" />
                    <path className="loop-widgets-area" d={`${curve(revenueNow, 240, 60, 3)} L 240 60 L 0 60 Z`} fill={`url(#${areaId})`} style={slotDelay(0)} />
                    <path className="loop-hub-trace" d={curve(revenueNow, 240, 60, 3)} fill="none" pathLength={1} stroke="var(--tint)" strokeLinecap="round" strokeWidth="2" style={slotDelay(0)} />
                  </svg>
                  <span className="flex gap-3 type-caption text-ink-3">
                    <span className="flex items-center gap-1.5">
                      <i className="h-0.5 w-3 rounded-full bg-(--tint)" /> {c.line.now}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="w-3 border-t-[1.5px] border-dashed border-ink-3" /> {c.line.last}
                    </span>
                  </span>
                </div>,
                0.12,
              )}
              {cell(
                1,
                c.kinds.columns,
                c.columns.title,
                <div className="flex flex-1 flex-col justify-end gap-1.5">
                  <div className="relative flex h-14 items-end gap-1">
                    {bookings.map((v, i) => (
                      <span
                        className={cn('loop-hub-bar flex-1 origin-bottom rounded-t-[4px]', v < TARGET ? 'bg-brand-coral' : 'bg-brand-blue')}
                        key={i}
                        style={{ height: `${(v / BOOKINGS_MAX) * 100}%`, ...slotDelay(1, i * 0.04) }}
                      />
                    ))}
                    <span aria-hidden="true" className="absolute inset-x-0 border-t-[1.5px] border-dashed border-ink-2" style={{ bottom: `${(TARGET / BOOKINGS_MAX) * 100}%` }} />
                  </div>
                  <span className="flex justify-between type-caption text-ink-3">
                    <span>{c.columns.from}</span>
                    <span className="flex items-center gap-1.5">
                      <i className="w-3 border-t-[1.5px] border-dashed border-ink-2" /> {c.columns.target}
                    </span>
                    <span>{c.columns.to}</span>
                  </span>
                </div>,
              )}
              {cell(
                2,
                c.kinds.pie,
                c.pie.title,
                <div className="flex flex-1 items-center gap-3">
                  <span className="relative size-14 shrink-0">
                    <svg aria-hidden="true" className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36">
                      {shares.map((share, i) => {
                        const before = shares.slice(0, i).reduce((a, b) => a + b, 0)
                        return (
                          <circle
                            cx="18"
                            cy="18"
                            fill="none"
                            key={i}
                            pathLength={1}
                            r="14"
                            stroke={shareColours[i]}
                            strokeDasharray={`${Math.max(0, share - 0.02)} ${1 - share + 0.02}`}
                            strokeDashoffset={-before}
                            strokeWidth="5"
                          />
                        )
                      })}
                    </svg>
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 type-caption text-ink-3">
                    {c.pie.segments.map((name, i) => (
                      <span className="flex min-w-0 items-center gap-1.5" key={name}>
                        <i className="size-2 shrink-0 rounded-[2px]" style={{ background: shareColours[i] }} />
                        <span className="truncate">{name}</span>
                        <span className="ml-auto tnum">{Math.round(shares[i] * 100)} %</span>
                      </span>
                    ))}
                    <span className="mt-0.5 truncate text-ink-2">
                      <span className="font-medium tnum text-ink">{c.pie.centre}</span> {c.pie.centreLabel}
                    </span>
                  </span>
                </div>,
              )}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )
}
