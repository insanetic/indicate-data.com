import { ArrowUp, Check, Clock, LayoutDashboard, ListChecks, Mail, RefreshCw } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Avatar, Chip } from './primitives'
import { Scene } from './Scene'
import { LOOP, Lit, build, curve, pos, slotDelay, type Pt } from './stage'
import { morningCopyFor } from './copy/morning'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: 200 × 100 on a 2 : 1 box, so SVG units and CSS percentages line up
 * (left = x / 2 %, top = y %). The stage is a size container, so the KPI chips that fly into
 * the email can move in stage units (1 unit = 0.5cqw).
 */

/** Background lane: the systems, then the three automatic steps, one per exchange. */
const LANE_Y = 9
const sources: { name: string; logo: string; x: number }[] = [
  { name: 'Mews', logo: '/integrations/mews.webp', x: 10 },
  { name: 'Google Ads', logo: '/integrations/google_ads.webp', x: 20 },
  { name: 'Meta Ads', logo: '/integrations/meta_ads.svg', x: 30 },
  { name: 'Re:Guest', logo: '/integrations/re_guest.png', x: 40 },
]
const STEP_X = [68, 108, 150] as const
const stepIcons = [RefreshCw, ListChecks, Clock] as const

/** Front: the dashboard (dominant), Resi's chat and the Monday email. */
const DASH = { l: 8, r: 118, t: 22, b: 94 }
const CHAT = { l: 124, r: 192, t: 18, b: 67 }
const MAIL = { l: 124, r: 192, t: 71, b: 96 }
const centre = (box: { l: number; r: number; t: number; b: number }): Pt => ({ x: (box.l + box.r) / 2, y: (box.t + box.b) / 2 })

/** Per exchange: the stretch of the lane the data travels, and the wire down to its card. */
const lanePaths = [
  `M 4 ${LANE_Y} H ${STEP_X[0]}`,
  `M ${STEP_X[0]} ${LANE_Y} H ${STEP_X[1]}`,
  `M ${STEP_X[1]} ${LANE_Y} H ${STEP_X[2]}`,
]
const dropPaths = [
  `M ${STEP_X[0]} ${LANE_Y} V ${DASH.t}`,
  `M ${STEP_X[1]} ${LANE_Y} V 14 Q ${STEP_X[1]} 16 ${STEP_X[1] + 2} 16 H ${centre(CHAT).x - 2} Q ${centre(CHAT).x} 16 ${centre(CHAT).x} 18 V ${CHAT.t}`,
  `M ${STEP_X[2]} ${LANE_Y} H 194 Q 196 ${LANE_Y} 196 ${LANE_Y + 2} V ${centre(MAIL).y - 2} Q 196 ${centre(MAIL).y} 194 ${centre(MAIL).y} H ${MAIL.r}`,
]
/** Resi's answer points at the pickup widget on the dashboard. */
const answerPath = `M ${CHAT.l} 60 H ${DASH.r}`
const idle = [`M 4 ${LANE_Y} H ${STEP_X[2]}`, dropPaths[0], dropPaths[1], dropPaths[2], answerPath]

/** Where the three KPI tiles sit, and where their chips land in the email. */
const chipFrom: Pt[] = [
  { x: 23.5, y: 39 },
  { x: 49.8, y: 39 },
  { x: 76.2, y: 39 },
]
const chipTo: Pt[] = [
  { x: 137, y: 85 },
  { x: 156, y: 85 },
  { x: 175, y: 85 },
]

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'
const box = (b: { l: number; r: number; t: number; b: number }) =>
  ({ ...pos(centre(b)), '--w': `${(b.r - b.l) / 2}%`, '--h': `${b.b - b.t}%` }) as React.CSSProperties
const BOX = 'xl:w-(--w) xl:h-(--h)'

/** Bookings, this year against last year (0–100, higher is more). */
const bookingsNow = [30, 36, 33, 42, 47, 45, 55, 60, 58, 68, 74, 82]
const bookingsLast = [28, 31, 30, 35, 38, 40, 42, 45, 47, 50, 52, 55]
/** Rooms picked up per arrival day, next 14 days; the weekends carry it. */
const pickup = [34, 30, 38, 44, 72, 88, 52, 36, 40, 46, 50, 78, 92, 58]
const isWeekend = (i: number) => i === 4 || i === 5 || i === 11 || i === 12

/**
 * The default hero (hotels, home, about): what a property gets from Indicate. At the back, the
 * automatic workflow runs by itself: the systems feed a sync every 15 minutes, KPIs are checked,
 * a schedule sends reports. In front, the benefits, one per exchange on the 12 s clock: at
 * 07:00 the sync lands and the dashboard refreshes (KPIs count up, the chart traces, pickup
 * bars rise); then someone asks Resi why pickup is higher, the checked KPIs flow into her chat
 * and her answer lights the pickup widget; then the Monday schedule fires, three KPI chips lift
 * off the dashboard into the weekly email, Resi adds her highlights and it is delivered to
 * three people. Below `xl` the pieces stack. Reduced motion shows the refreshed dashboard with
 * the last answer and the last delivery. Timing: `.loop-hub-*`, `.loop-morning-late` and
 * `.loop-morning-*` (scenes/morning.css).
 */
export const HotelStageIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const areaId = `morning-area-${React.useId()}`
  const c = morningCopyFor(locale)
  const d = c.dashboard

  const dashboard = (
    <div className="relative flex h-full flex-col rounded-[1.125rem] border border-line-strong bg-surface-2 shadow-float">
      <Lit slot={0} />
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 type-caption font-medium text-ink-2">
          <LayoutDashboard aria-hidden="true" className="shrink-0 text-ink-3" size={14} strokeWidth={1.75} />
          <span className="truncate">{d.title}</span>
        </span>
        <span className="grid justify-items-end">
          <span className="loop-morning-syncing flex items-center gap-1.5 whitespace-nowrap type-caption text-ink-3 [grid-area:1/1]" data-slot={0} style={slotDelay(0)}>
            <RefreshCw aria-hidden="true" size={12} strokeWidth={2} />
            {d.syncing}
          </span>
          <Chip className="loop-morning-updated whitespace-nowrap [grid-area:1/1]" style={slotDelay(0)} tone="green">
            <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {d.updated}
          </Chip>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {d.kpis.map((k) => (
            <div className="flex flex-col gap-1.5 rounded-[0.75rem] border border-line bg-surface px-3 py-2.5" key={k.label}>
              <span className="truncate type-caption leading-4 text-ink-3">{k.label}</span>
              <span className="font-display text-[1.5rem] font-medium leading-none tnum text-ink">
                {k.before}
                <span className="loop-hub-count" style={{ ...slotDelay(0), '--hub-to': k.value } as React.CSSProperties} />
                {k.after}
              </span>
              <span className="type-caption leading-4 tnum text-success-deep">{k.delta}</span>
            </div>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-[3fr_2fr]">
          <div className="flex min-h-0 flex-col rounded-[0.75rem] border border-line bg-surface p-3">
            <span className="flex items-center justify-between gap-2 type-caption leading-4 text-ink-3">
              {d.bookings}
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <i className="h-0.5 w-3 rounded-full bg-brand-blue" /> {d.thisYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="w-3 border-t-[1.5px] border-dashed border-ink-3" /> {d.lastYear}
                </span>
              </span>
            </span>
            <svg aria-hidden="true" className="mt-2 aspect-[24/11] w-full xl:aspect-auto xl:min-h-0 xl:flex-1" preserveAspectRatio="xMidYMax meet" viewBox="0 0 240 110">
              <defs>
                <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.26" />
                  <stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[27.5, 55, 82.5].map((y) => (
                <line key={y} stroke="var(--line)" strokeWidth="0.75" x1="0" x2="240" y1={y} y2={y} />
              ))}
              <path d={curve(bookingsLast, 240, 110, 4)} fill="none" stroke="var(--ink-3)" strokeDasharray="3 4" strokeWidth="1.5" />
              <path className="loop-hub-area" d={`${curve(bookingsNow, 240, 110, 4)} L 240 110 L 0 110 Z`} fill={`url(#${areaId})`} style={slotDelay(0)} />
              <path className="loop-hub-line" d={curve(bookingsNow, 240, 110, 4)} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2.25" style={slotDelay(0)} />
            </svg>
          </div>

          <div className="relative flex min-h-0 flex-col rounded-[0.75rem] border border-line bg-surface p-3">
            <Lit slot={1} stagger={0.35} tone="out" />
            <span className="flex items-center justify-between gap-2 type-caption leading-4 text-ink-3">
              <span className="truncate">{d.pickup}</span>
            </span>
            <span aria-hidden="true" className="mt-2 flex h-16 items-end gap-[3px] xl:h-auto xl:min-h-0 xl:flex-1">
              {pickup.map((v, i) => (
                <span
                  className={cn('loop-hub-bar flex-1 rounded-t-[3px]', isWeekend(i) ? 'bg-brand-blue' : 'bg-surface-3')}
                  key={i}
                  style={{ height: `${v}%`, ...slotDelay(0, i * 0.03) }}
                />
              ))}
            </span>
            <span className="mt-1.5 flex items-center gap-1.5 type-caption leading-4 text-ink-3">
              <i className="size-2 rounded-[2px] bg-brand-blue" /> {d.weekend}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const chat = (
    <div className="relative flex h-full flex-col rounded-[1.125rem] border border-line-strong bg-surface-2 shadow-float">
      <Lit slot={1} />
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
        <ResiMark size={26} />
        <span className="flex flex-col">
          {' '}<ResiName className="type-small leading-4" />{' '}
          <span className="type-caption leading-4 text-ink-3">{c.chat.role}</span>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3.5 pt-3">
        <p className="loop-morning-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-small leading-5 text-ink" data-slot={1}>
          {c.chat.question}
        </p>
        <div className="relative">
          <p className="loop-hub-think absolute left-0 top-0 flex items-center gap-2 type-caption text-ink-3" style={slotDelay(1)}>
            <ResiMark size={20} thinking />
            {withResi(c.chat.thinking)}
          </p>
          <div className="loop-morning-a flex gap-2" data-slot={1}>
            <ResiMark className="mt-0.5 shrink-0" size={20} />
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="type-small leading-5 text-ink-2 pretty">{c.chat.answer}</p>
              <span className="flex items-center gap-1.5 type-caption leading-4 text-ink-3">
                <Check aria-hidden="true" className="text-resi-mint" size={12} strokeWidth={2.5} /> {c.chat.source}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2.5 pt-2">
        <div className="flex items-center gap-2 rounded-[0.75rem] border border-line bg-surface px-3 py-1.5">
          <span className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap type-caption leading-5">
            <span className="loop-morning-ph block text-ink-3">{withResi(c.chat.ask)}</span>
            <span className="loop-hub-type absolute inset-0 text-ink" style={slotDelay(1)}>
              {c.chat.question}
            </span>
          </span>
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-3">
            <ArrowUp aria-hidden="true" size={13} strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </div>
  )

  const digest = (
    <div className="relative flex h-full flex-col justify-between gap-2 rounded-[1.125rem] border border-line-strong bg-surface-2 px-3.5 py-3 shadow-float">
      <Lit slot={2} />
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[0.5rem] bg-surface-3 text-ink-2">
          <Mail aria-hidden="true" size={15} strokeWidth={1.75} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-caption font-medium leading-4 text-ink">{c.digest.title}</span>
          <span className="truncate type-caption leading-4 text-ink-3">{c.digest.when}</span>
        </span>
        <Chip className="loop-morning-late shrink-0 whitespace-nowrap" style={slotDelay(2, 0.95 - LOOP)} tone="green">
          <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {c.digest.sent}
        </Chip>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {c.digest.chips.map((chip, k) => (
          <span
            className="loop-morning-late rounded-pill border border-line-strong bg-surface px-2 py-0.5 type-caption font-medium leading-4 tnum text-ink"
            key={chip}
            style={slotDelay(2, k * 0.1 - LOOP)}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex gap-1.5">
          {c.people.map((initials, p) => (
            <span className="relative" key={initials}>
              <Avatar className="size-5 text-[0.5625rem] ring-2 ring-surface-2" initials={initials} tone={(['blue', 'yellow', 'coral'] as const)[p]} />
              <span
                className="loop-morning-late absolute -bottom-1 -right-1.5 grid size-3 place-items-center rounded-full bg-success-soft text-success-deep ring-2 ring-surface-2"
                style={slotDelay(2, 0.55 + p * 0.12 - LOOP)}
              >
                <Check aria-hidden="true" size={8} strokeWidth={3.5} />
              </span>
            </span>
          ))}
        </span>
        <span className="loop-morning-late flex min-w-0 items-center gap-1.5 type-caption leading-4 text-ink-3" style={slotDelay(2, 0.3 - LOOP)}>
          <ResiMark size={14} />
          <span className="truncate">{withResi(c.digest.note)}</span>{' '}
        </span>
      </div>
    </div>
  )

  return (
    <Scene className={cn('w-full', className)} label={c.label} lead={0.7} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col gap-4 [container-type:inline-size] xl:block xl:aspect-[2/1]">
        {/* Background wiring: the lane and the drops to each card, dotted at rest, lit per exchange. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full overflow-visible xl:block" viewBox="0 0 200 100">
          <g className="scene-fade" style={build(5)}>
            {idle.map((p) => (
              <path className="hub-dots" d={p} fill="none" key={p} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            ))}
          </g>
          {lanePaths.map((lane, slot) => (
            <g key={slot}>
              <path className="loop-hub-draw" d={lane} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeWidth="0.4" style={slotDelay(slot, -0.2)} />
              <path className="loop-hub-comet" d={lane} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={{ ...slotDelay(slot, -0.2), '--comet': 0.1, '--comet-from': 0.15 } as React.CSSProperties} />
              <path className="loop-hub-draw-out" d={dropPaths[slot]} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, -0.3)} />
              <path className="loop-hub-comet-out" d={dropPaths[slot]} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={{ ...slotDelay(slot, -0.3), '--comet': 0.12, '--comet-from': 0.17 } as React.CSSProperties} />
            </g>
          ))}
          <path className="loop-hub-draw-out" d={answerPath} data-slot={1} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeWidth="0.45" style={slotDelay(1, 0.35)} />
          <path className="loop-hub-comet-out" d={answerPath} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.8" style={{ ...slotDelay(1, 0.35), '--comet': 0.3, '--comet-from': 0.35 } as React.CSSProperties} />
        </svg>

        {/* The automatic workflow: systems and steps on the lane (a row of steps on phones). */}
        <div className="flex flex-wrap items-center justify-center gap-2 xl:contents">
          {sources.map((src, i) => (
            <div className={cn('relative hidden xl:block', AT)} key={src.name} style={pos({ x: src.x, y: LANE_Y })}>
              <div className="scene-build-in" style={{ ...build(4 + i * 0.5), '--from-y': '-5px' } as React.CSSProperties}>
                <span className="relative flex size-9 items-center justify-center rounded-[0.625rem] border border-line-strong bg-white shadow-card" title={src.name}>
                  <Lit slot={0} stagger={i * 0.05} />
                  {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                  <img alt="" className="size-5 object-contain" height={20} src={src.logo} width={20} />
                </span>
              </div>
            </div>
          ))}
          {c.steps.map((step, slot) => {
            const Icon = stepIcons[slot]
            return (
              <div className={cn('relative', AT)} key={step} style={pos({ x: STEP_X[slot], y: LANE_Y })}>
                <div className="scene-build-in" style={{ ...build(5 + slot * 0.5), '--from-y': '-5px' } as React.CSSProperties}>
                  <span className="relative flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-line bg-surface-2 px-3 py-1 type-caption leading-5 text-ink-2">
                    <Lit slot={slot} stagger={0.2} />
                    <Icon aria-hidden="true" className="shrink-0 text-ink-3" size={12} strokeWidth={2} />
                    {step}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dashboard */}
        <div className={cn('relative w-full', AT, BOX)} style={box(DASH)}>
          <div className="scene-build h-full" style={build(0)}>
            {dashboard}
          </div>
        </div>

        {/* Resi */}
        <div className={cn('relative w-full xl:min-h-0', AT, BOX)} style={box(CHAT)}>
          <div className="scene-build-in h-full" style={{ ...build(1.5), '--from-x': '8px', '--from-y': '0px' } as React.CSSProperties}>
            <div className="hub-float h-full" style={{ '--float-delay': '-1.4s' } as React.CSSProperties}>
              {chat}
            </div>
          </div>
        </div>

        {/* The Monday email */}
        <div className={cn('relative w-full', AT, BOX)} style={box(MAIL)}>
          <div className="scene-build-in h-full" style={{ ...build(2.5), '--from-x': '8px', '--from-y': '0px' } as React.CSSProperties}>
            <div className="hub-float h-full" style={{ '--float-delay': '-4.2s' } as React.CSSProperties}>
              {digest}
            </div>
          </div>
        </div>

        {/* Flying KPIs: three chips lift off the dashboard and land in the email. */}
        {c.digest.chips.map((chip, k) => (
          <span
            aria-hidden="true"
            className={cn('loop-morning-fly z-20 hidden whitespace-nowrap rounded-pill border border-brand-blue bg-surface-2 px-2 py-0.5 type-caption font-medium leading-4 tnum text-ink shadow-float xl:block', AT)}
            data-slot={2}
            key={chip}
            style={{
              ...pos(chipFrom[k]),
              ...slotDelay(2, k * 0.1),
              '--dx': chipTo[k].x - chipFrom[k].x,
              '--dy': chipTo[k].y - chipFrom[k].y,
            } as React.CSSProperties}
          >
            {chip}
          </span>
        ))}
      </div>
    </Scene>
  )
}
