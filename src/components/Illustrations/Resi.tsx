import { BookMarked, Languages, ShieldCheck } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { Connector, LOOP, Lit, curve, perSlot, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Stage from `lg`: a 200 × 90 coordinate system on a 20 : 9 box, so SVG units and CSS
 * percentages line up and no stroke is stretched.
 */
const W = 200
const H = 90
const CORE: Pt = { x: 62, y: 45 }
const CHAT: Pt = { x: 150, y: 45 }
const CATALOGUE: Pt = { x: 62, y: 13 }
const SCOPE: Pt = { x: 62, y: 78 }

/** The systems Resi may read, marks from the connector catalogue, on a slight arc. */
const sources: { name: string; logo: string; at: Pt }[] = [
  { name: 'Mews', logo: '/integrations/mews.webp', at: { x: 17, y: 12 } },
  { name: 'Google Ads', logo: '/integrations/google_ads.webp', at: { x: 8, y: 34 } },
  { name: 'Re:Guest', logo: '/integrations/re_guest.png', at: { x: 8, y: 56 } },
  { name: 'Meta', logo: '/integrations/meta_ads.svg', at: { x: 17, y: 78 } },
]

type ChartKind = 'days' | 'plan' | 'trend'
/** Which sources each exchange reads and the small chart its answer carries. */
const turns: { reads: number[]; chart: ChartKind }[] = [
  { reads: [0, 1], chart: 'days' },
  { reads: [3, 0], chart: 'plan' },
  { reads: [0, 2], chart: 'trend' },
]

const sourcePath = (i: number) => {
  const { x, y } = sources[i].at
  return `M ${x} ${y} C ${x + 28} ${y}, ${CORE.x - 24} ${CORE.y}, ${CORE.x} ${CORE.y}`
}
const spokes = [`M ${CATALOGUE.x} ${CATALOGUE.y} V ${CORE.y}`, `M ${SCOPE.x} ${SCOPE.y} V ${CORE.y}`]
const outPath = `M ${CORE.x} ${CORE.y} H ${CHAT.x}`

/** Stage placement, only from `lg`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'lg:absolute lg:left-(--x) lg:top-(--y) lg:-translate-x-1/2 lg:-translate-y-1/2'
const at = (p: Pt) => pos(p, W, H)

const days = [52, 48, 55, 50, 84, 92, 61]
const campaign = [31, 33, 30, 22, 21, 24, 26, 25]
const PLAN = 30
const adr = [38, 42, 40, 51, 56, 63, 70, 82]

/**
 * Looping scene (wide): Resi at work. Her sources sit on the left as logo tiles; curved lines
 * converge on her mark, which is wired to the KPI catalogue above and the permissions below.
 * Each exchange (4 s, three on a 12 s clock): a question arrives, the sources it needs light
 * up and their lines draw in, the catalogue shows the definition in use and the permission
 * check lights, Resi pulses while thinking, then a line draws to the chat and the answer
 * lands with a KPI that counts up, a chart that builds and the logos of its sources. The
 * third exchange is in Italian and the language pill switches. Below `lg` the pieces stack.
 * Reduced motion shows the first exchange, finished. Timing: `.loop-hub-*` in loops.css.
 */
export const ResiIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const r = l.scenes.resi

  const chart = (kind: ChartKind, slot: number) => {
    if (kind === 'trend') {
      return (
        <svg aria-hidden="true" className="h-11 w-full" preserveAspectRatio="none" viewBox="0 0 100 44">
          <path d={`${curve(adr, 100, 44, 4)} L 100 44 L 0 44 Z`} fill="var(--resi-mint)" fillOpacity="0.12" />
          <path className="loop-hub-trace" d={curve(adr, 100, 44, 4)} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeLinecap="round" strokeWidth="2" style={slotDelay(slot)} />
        </svg>
      )
    }
    const values = kind === 'days' ? days : campaign
    const max = kind === 'days' ? 100 : 36
    return (
      <div className="relative flex h-11 items-end gap-[3px]">
        {values.map((v, i) => (
          <span
            className={cn(
              'loop-hub-grow flex-1 rounded-t-[2px]',
              kind === 'plan' && v < PLAN ? 'bg-brand-coral' : 'bg-brand-blue',
              kind === 'days' && i < 4 && 'opacity-50',
            )}
            key={i}
            style={{ height: `${(v / max) * 100}%`, ...slotDelay(slot, i * 0.04) }}
          />
        ))}
        {kind === 'plan' && <span aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-ink-2" style={{ bottom: `${(PLAN / max) * 100}%` }} />}
      </div>
    )
  }

  const satellite = (Icon: typeof BookMarked, label: string, body: React.ReactNode, stagger: number) => (
    <div className="relative flex items-center gap-2.5 rounded-[0.75rem] border border-line-strong bg-surface-2 px-3 py-2 shadow-card">
      {turns.map((_, slot) => (
        <Lit key={slot} slot={slot} stagger={stagger} />
      ))}
      <Icon aria-hidden="true" className="shrink-0 text-resi-teal" size={16} strokeWidth={1.75} />
      <span className="flex flex-col">
        <span className="type-caption leading-4 text-ink-3">{label}</span>
        <span className="grid type-caption font-medium leading-4 text-ink">{body}</span>
      </span>
    </div>
  )

  return (
    <Frame className={cn('loop loop-hub w-full', className)} label={r.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center lg:block lg:aspect-[20/9]">
        {/* Stage wiring */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[...sources.map((_, i) => sourcePath(i)), ...spokes, outPath].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {turns.map((turn, slot) => (
            <g key={slot}>
              {turn.reads.map((i, k) => (
                <React.Fragment key={i}>
                  <path className="loop-hub-draw" d={sourcePath(i)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeWidth="0.45" style={slotDelay(slot, k * 0.1)} />
                  <path className="loop-hub-comet" d={sourcePath(i)} fill="none" pathLength={1} stroke="var(--resi-teal)" strokeLinecap="round" strokeWidth="0.9" style={slotDelay(slot, k * 0.1)} />
                </React.Fragment>
              ))}
              {spokes.map((d, k) => (
                <path className="loop-hub-draw" d={d} data-slot={slot} fill="none" key={d} pathLength={1} stroke="var(--resi-teal)" strokeWidth="0.45" style={slotDelay(slot, 0.15 + k * 0.1)} />
              ))}
              <path className="loop-hub-draw-out" d={outPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeWidth="0.45" style={slotDelay(slot, -0.3)} />
              <path className="loop-hub-comet-out" d={outPath} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, -0.3), '--comet': 0.12 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* Sources */}
        <div className="flex flex-wrap justify-center gap-2.5 lg:contents">
          {sources.map((src, i) => (
            <div className={cn('relative', AT)} key={src.name} style={at(src.at)}>
              <div className="hub-float" style={{ '--float-delay': `${-i * 1.7}s` } as React.CSSProperties}>
                <span className="relative flex size-11 items-center justify-center rounded-[0.75rem] border border-line-strong bg-white shadow-card lg:size-12" title={src.name}>
                  {turns.flatMap((t, slot) => (t.reads.includes(i) ? [<Lit key={slot} slot={slot} stagger={t.reads.indexOf(i) * 0.1} />] : []))}
                  {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                  <img alt="" className="size-6 object-contain lg:size-7" height={28} src={src.logo} width={28} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" />

        {/* Resi, wired to what she knows */}
        <div className="flex flex-col items-center gap-3 lg:contents">
          <div className={cn('relative z-10 grid size-28 place-items-center', AT)} style={at(CORE)}>
            <span aria-hidden="true" className="resi-aura absolute inset-5 rounded-full" />
            <span aria-hidden="true" className="resi-orbit absolute inset-0 rounded-full border border-dashed border-line-strong">
              <i className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-resi-mint" />
            </span>
            <span className="loop-resi-core relative grid place-items-center" style={perSlot}>
              <ResiMark className="shadow-float" size={64} />
              {turns.map((_, slot) => (
                <span className="loop-hub-think absolute inset-0" key={slot} style={slotDelay(slot)}>
                  <ResiMark size={64} thinking />
                </span>
              ))}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 lg:contents">
            <div className={cn('relative z-10', AT)} style={at(CATALOGUE)}>
              {satellite(
                BookMarked,
                r.catalogue,
                r.turns.map((turn, slot) => (
                  <span className="loop-hub-def whitespace-nowrap [grid-area:1/1]" data-slot={slot} key={turn.def} style={slotDelay(slot)}>
                    {turn.def}
                  </span>
                )),
                0.2,
              )}
            </div>
            <div className={cn('relative z-10', AT)} style={at(SCOPE)}>
              {satellite(ShieldCheck, r.permissions, <span className="whitespace-nowrap">{r.scope}</span>, 0.3)}
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" out />

        {/* Conversation */}
        <div className={cn('relative z-10 w-full max-w-lg lg:w-[46%] lg:max-w-none', AT)} style={at(CHAT)}>
          <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            <span aria-hidden="true" className="loop-hub-ring pointer-events-none absolute -inset-px rounded-[inherit]" style={perSlot} />

            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2.5">
                <ResiMark size={28} />
                <span className="flex flex-col">
                  <ResiName className="type-small leading-4" />
                  <span className="type-caption leading-4 text-ink-3">{r.role}</span>
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-pill border border-line px-2.5 py-1 type-caption font-medium text-ink-2">
                <Languages aria-hidden="true" size={13} strokeWidth={1.75} />
                <span className="grid">
                  {r.turns.map((turn, slot) => (
                    <span className="loop-hub-def [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
                      {turn.lang}
                    </span>
                  ))}
                </span>
              </span>
            </div>

            <div className="relative h-[19rem] lg:h-[15rem]">
              {r.turns.map((turn, slot) => (
                <div className="absolute inset-x-4 top-4 flex flex-col gap-3" key={turn.q}>
                  <p className="loop-hub-q max-w-[85%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-small text-ink" data-slot={slot} style={slotDelay(slot)}>
                    {turn.q}
                  </p>
                  <div className="relative">
                    <p className="loop-hub-think absolute left-0 top-0 flex items-center gap-2.5 type-small text-ink-3" style={slotDelay(slot)}>
                      <ResiMark size={24} thinking />
                      {withResi(r.thinking)}
                    </p>
                    <div className="loop-hub-a flex gap-2.5" data-slot={slot} style={slotDelay(slot)}>
                      <ResiMark className="mt-0.5" size={24} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                        <p className="loop-hub-stream type-small text-ink-2 pretty" style={slotDelay(slot)}>
                          {turn.a}
                        </p>
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 rounded-card-inner border border-line bg-surface px-3 py-2.5">
                          <span className="flex flex-col gap-1">
                            <span className="type-caption leading-4 text-ink-3">{turn.kpi}</span>
                            <span className="flex items-center gap-2">
                              <span className="font-display text-xl font-medium leading-none tnum text-ink">
                                <span className="loop-hub-tick" style={{ ...slotDelay(slot), '--hub-to': turn.value } as React.CSSProperties} />
                                {turn.unit}
                              </span>
                              <Chip tone={turn.up ? 'green' : 'coral'}>{turn.delta}</Chip>
                            </span>
                          </span>
                          {chart(turns[slot].chart, slot)}
                        </div>
                        <span className="loop-hub-cite flex items-center gap-1.5 type-caption text-ink-3" style={slotDelay(slot)}>
                          {r.source}
                          {turns[slot].reads.map((i) => (
                            <span className="inline-flex items-center gap-1" key={i}>
                              <span className="inline-flex size-4 items-center justify-center rounded-[4px] bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark */}
                                <img alt="" className="size-3 object-contain" height={12} src={sources[i].logo} width={12} />
                              </span>
                              {sources[i].name}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
