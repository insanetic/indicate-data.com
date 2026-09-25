import { ArrowUp, Check } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { Connector, LOOP, Lit, curve, elbow, perSlot, pos, slotDelay, type Pt } from './stage'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: a 200 × 100 coordinate system on a 2 : 1 box, so SVG units and CSS
 * percentages line up (left = x / 2 %, top = y %) and no stroke is ever stretched.
 */
const CHAT_IN = 70
const CHAT_OUT = 130

/** Source tiles on the left, marks from the connector catalogue. */
const sources: { name: string; logo: string; at: Pt; entry: number; bend: number }[] = [
  { name: 'Mews', logo: '/integrations/mews.webp', at: { x: 14, y: 16 }, entry: 38, bend: 52 },
  { name: 'Google Ads', logo: '/integrations/google_ads.webp', at: { x: 32, y: 32 }, entry: 44, bend: 46 },
  { name: 'Meta Ads', logo: '/integrations/meta_ads.svg', at: { x: 12, y: 50 }, entry: 50, bend: 46 },
  { name: 'Google Analytics', logo: '/integrations/google_analytics.svg', at: { x: 32, y: 68 }, entry: 56, bend: 46 },
]

/** The KPI definition card under the tiles: the technical layer Resi reads from. */
const catalogue = { at: { x: 24, y: 87 }, edge: 38, entry: 62, bend: 52 }

/** Output cards on the right; `exit` is where the line leaves the chat. */
const outputs: { at: Pt; exit: number }[] = [
  { at: { x: 172, y: 17 }, exit: 44 }, // KPI tile
  { at: { x: 166, y: 50 }, exit: 50 }, // Pickup line chart
  { at: { x: 172, y: 83 }, exit: 56 }, // Campaign bars
]
const OUT_BEND = 141

/** Which sources each exchange reads (the catalogue always joins) and which card it fills. */
const turns: { reads: number[]; output: number }[] = [
  { reads: [0, 3], output: 0 },
  { reads: [2, 0], output: 2 },
  { reads: [1, 0], output: 1 },
]

const sourcePath = (i: number) => elbow(sources[i].at, { x: CHAT_IN, y: sources[i].entry }, sources[i].bend)
const cataloguePath = elbow({ x: catalogue.edge, y: catalogue.at.y }, { x: CHAT_IN, y: catalogue.entry }, catalogue.bend)
const outputPath = (i: number) => elbow({ x: CHAT_OUT, y: outputs[i].exit }, { x: outputs[i].at.x - 10, y: outputs[i].at.y }, OUT_BEND)

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'
/** Weekly campaign bookings against a flat plan; weeks under plan are marked. */
const campaign = [31, 33, 30, 22, 21, 24, 26, 25]
const CAMPAIGN_PLAN = 30
/** Pickup curves (0–100, higher is more), this year against last year. */
const pickupNow = [12, 20, 27, 34, 44, 52, 60, 70, 79, 90]
const pickupLast = [10, 15, 19, 24, 29, 33, 38, 43, 49, 56]
const kpiTrend = [52, 55, 50, 58, 61, 64, 70, 68, 76, 84]

/**
 * Hero scene: Resi in the middle. A question is typed into her chat and sent; the sources it
 * needs light up and their lines draw into the chat while she checks the figures; the answer
 * streams in and a line draws out to the card it fills: a KPI that counts up, bars that grow,
 * a pickup curve that draws. Three exchanges take turns on one 12 s clock; idle lines carry a
 * slow dotted flow and the side cards drift a few pixels. Below `xl` the pieces stack: logo
 * row, chat, and one output card that swaps with each exchange. Reduced motion shows the
 * first exchange, finished. Pure CSS (`.loop-hub-*` and `.hub-*` in loops.css).
 */
export const ResiHubIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const h = l.scenes.hub

  const litBy = (source: number) => turns.flatMap((t, slot) => (t.reads.includes(source) ? [slot] : []))

  const outputSlot = (output: number) => turns.findIndex((t) => t.output === output)

  const outputCard = (output: number, children: React.ReactNode) => {
    const slot = outputSlot(output)
    return (
      <div
        className={cn('loop-hub-swap relative w-full [grid-area:1/1] xl:w-[22%]', AT)}
        data-slot={slot}
        key={output}
        style={{ ...pos(outputs[output].at), ...slotDelay(slot) }}
      >
        <div className="hub-float" style={{ '--float-delay': `${-output * 2.3}s` } as React.CSSProperties}>
          <div className="relative rounded-[0.875rem] border border-line-strong bg-surface-2 p-3.5 shadow-float">
            <Lit slot={slot} tone="out" />
            {children}
          </div>
        </div>
      </div>
    )
  }

  const kpiSlot = outputSlot(0)
  const barsSlot = outputSlot(2)
  const lineSlot = outputSlot(1)

  return (
    <Frame className={cn('loop loop-hub w-full', className)} label={h.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle lines, lines that draw per exchange, a pulse riding each. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full xl:block" viewBox="0 0 200 100">
          {[...sources.map((_, i) => sourcePath(i)), cataloguePath, ...outputs.map((_, i) => outputPath(i))].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {turns.map((turn, slot) => (
            <g key={slot}>
              {[...turn.reads.map((i) => sourcePath(i)), cataloguePath].map((d, k) => (
                <React.Fragment key={d}>
                  <path className="loop-hub-draw" d={d} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, k * 0.08)} />
                  <path className="loop-hub-comet" d={d} fill="none" pathLength={1} stroke="var(--resi-teal)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot, k * 0.08)} />
                </React.Fragment>
              ))}
              <path className="loop-hub-draw-out" d={outputPath(turn.output)} data-slot={slot} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot)} />
              <path className="loop-hub-comet-out" d={outputPath(turn.output)} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot)} />
            </g>
          ))}
        </svg>

        {/* Sources: a logo row on phones, scattered tiles on the desktop stage. */}
        <div className="flex flex-wrap justify-center gap-2.5 xl:contents">
          {sources.map((src, i) => (
            <div className={cn('relative', AT)} key={src.name} style={pos(src.at)}>
              <div className="hub-float" style={{ '--float-delay': `${-i * 1.7}s` } as React.CSSProperties}>
                <span className="relative flex size-11 items-center justify-center rounded-[0.75rem] border border-line-strong bg-white shadow-card xl:size-12" title={src.name}>
                  {litBy(i).map((slot) => <Lit key={slot} slot={slot} />)}
                  {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                  <img alt="" className="size-6 object-contain xl:size-7" height={28} src={src.logo} width={28} />
                </span>
              </div>
            </div>
          ))}
          <div className={cn('hidden w-[19%] xl:block', AT)} style={pos(catalogue.at)}>
            <div className="hub-float" style={{ '--float-delay': '-3.1s' } as React.CSSProperties}>
              <div className="relative rounded-[0.75rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                {turns.map((_, slot) => <Lit key={slot} slot={slot} stagger={0.16} />)}
                <span className="flex items-center justify-between gap-2 type-caption text-ink-3">
                  {h.catalogue}
                  <span className="tnum">v1.2</span>
                </span>
                <span className="mt-1 grid font-mono text-[0.6875rem] leading-4 text-ink-2">
                  {h.turns.map((turn, slot) => (
                    <span className="loop-hub-def truncate [grid-area:1/1]" data-slot={slot} key={turn.def} style={slotDelay(slot)}>
                      {turn.def}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" />

        {/* Chat */}
        <div className="relative z-10 w-full max-w-md xl:absolute xl:left-1/2 xl:top-1/2 xl:w-[36%] xl:max-w-none xl:-translate-x-1/2 xl:-translate-y-1/2">
          <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            <span aria-hidden="true" className="loop-hub-ring pointer-events-none absolute -inset-px rounded-[inherit]" style={perSlot} />

            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <ResiMark size={28} />
              <span className="flex flex-col">
                <ResiName className="type-small leading-4" />
                <span className="type-caption leading-4 text-ink-3">{h.role}</span>
              </span>
            </div>

            <div className="relative h-[12.5rem]">
              {h.turns.map((turn, slot) => (
                <div className="absolute inset-x-4 top-4 flex flex-col gap-3" key={turn.q}>
                  <p className="loop-hub-q max-w-[85%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-small text-ink" data-slot={slot} style={slotDelay(slot)}>
                    {turn.q}
                  </p>
                  <div className="relative">
                    <p className="loop-hub-think absolute left-0 top-0 flex items-center gap-2.5 type-small text-ink-3" style={slotDelay(slot)}>
                      <ResiMark size={24} thinking />
                      {withResi(h.thinking)}
                    </p>
                    <div className="loop-hub-a flex gap-2.5" data-slot={slot} style={slotDelay(slot)}>
                      <ResiMark className="mt-0.5" size={24} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="loop-hub-stream type-small text-ink-2 pretty" style={slotDelay(slot)}>
                          {turn.a}
                        </p>
                        <span className="loop-hub-cite flex items-center gap-1.5 type-caption text-ink-3" style={slotDelay(slot)}>
                          <Check aria-hidden="true" className="text-resi-mint" size={12} strokeWidth={2.5} /> {turn.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 pt-0">
              <div className="flex items-center gap-2 rounded-[0.875rem] border border-line bg-surface px-3.5 py-2">
                <span className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap type-small">
                  <span className="loop-hub-ph block text-ink-3" style={perSlot}>
                    {withResi(h.ask)}
                  </span>
                  {h.turns.map((turn, slot) => (
                    <span className="loop-hub-type absolute inset-0 text-ink" key={turn.q} style={slotDelay(slot)}>
                      {turn.q}
                    </span>
                  ))}
                </span>
                <span className="loop-hub-send inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-3" style={perSlot}>
                  <ArrowUp aria-hidden="true" size={16} strokeWidth={2.25} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" out />

        {/* Outputs: all three on the desktop stage, one at a time on phones. */}
        <div className="grid w-full max-w-md xl:contents">
          {outputCard(
            0,
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="type-caption text-ink-3">{h.kpi.label}</span>
                <Chip tone="green">{h.kpi.delta}</Chip>
              </div>
              <div className="mt-1.5 flex items-end justify-between gap-3">
                <span className="font-display text-[1.75rem] font-medium leading-none tnum text-ink">
                  <span className="loop-hub-count" style={{ ...slotDelay(kpiSlot), '--hub-to': 84 } as React.CSSProperties} />
                  {' %'}
                </span>
                <svg aria-hidden="true" className="h-8 w-[55%]" viewBox="0 0 100 32">
                  <path className="loop-hub-line" d={curve(kpiTrend, 100, 32)} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeLinecap="round" strokeWidth="2" style={slotDelay(kpiSlot)} />
                </svg>
              </div>
            </>,
          )}
          {outputCard(
            1,
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="type-caption text-ink-3">{h.line.title}</span>
                <Chip tone="green">{h.line.delta}</Chip>
              </div>
              <svg aria-hidden="true" className="mt-2 aspect-[3/1] w-full" viewBox="0 0 120 40">
                <defs>
                  <linearGradient id="hub-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.28" />
                    <stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[10, 20, 30].map((y) => (
                  <line key={y} stroke="var(--line)" strokeWidth="0.5" x1="0" x2="120" y1={y} y2={y} />
                ))}
                <path d={curve(pickupLast, 120, 40)} fill="none" stroke="var(--ink-3)" strokeDasharray="2 2.5" strokeWidth="1.25" />
                <path className="loop-hub-area" d={`${curve(pickupNow, 120, 40)} L 120 40 L 0 40 Z`} fill="url(#hub-area)" style={slotDelay(lineSlot)} />
                <path className="loop-hub-line" d={curve(pickupNow, 120, 40)} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2" style={slotDelay(lineSlot)} />
              </svg>
              <div className="mt-2 flex gap-3 type-caption text-ink-3">
                <span className="flex items-center gap-1.5">
                  <i className="h-0.5 w-3 rounded-full bg-brand-blue" /> {h.line.current}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="w-3 border-t-[1.5px] border-dashed border-ink-3" /> {h.line.last}
                </span>
              </div>
            </>,
          )}
          {outputCard(
            2,
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="type-caption text-ink-3">{h.bars.title}</span>
                <Chip className="shrink-0 whitespace-nowrap" tone="coral">{h.bars.value}</Chip>
              </div>
              <div className="relative mt-2.5 flex h-14 items-end gap-1">
                {campaign.map((v, i) => (
                  <span
                    className={cn('loop-hub-bar flex-1 rounded-t-[3px]', v < CAMPAIGN_PLAN ? 'bg-brand-coral' : 'bg-brand-blue')}
                    key={i}
                    style={{ height: `${(v / 36) * 100}%`, ...slotDelay(barsSlot, i * 0.04) }}
                  />
                ))}
                <span aria-hidden="true" className="absolute inset-x-0 border-t-[1.5px] border-dashed border-ink-2" style={{ bottom: `${(CAMPAIGN_PLAN / 36) * 100}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between type-caption text-ink-3">
                <span>{h.bars.from}</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-[2px] bg-brand-blue" /> {h.bars.actual}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="w-3 border-t-[1.5px] border-dashed border-ink-2" /> {h.bars.plan}
                  </span>
                </span>
                <span>{h.bars.to}</span>
              </div>
            </>,
          )}
        </div>
      </div>
    </Frame>
  )
}
