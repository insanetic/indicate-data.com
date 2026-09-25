import { Check } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

import { rolloutCopy } from './copy/rollout'
import { Scene } from './Scene'
import { Connector, LOOP, Lit, SLOTS, build, curve, elbow, perSlot, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: a 200 × 100 coordinate system on a 2 : 1 box, so SVG units and CSS
 * percentages line up (left = x / 2 %, top = y %) and no stroke is ever stretched.
 */
const TILE_RIGHT = 51
const SKELETON: Pt = { x: 100, y: 50 }
const SKELETON_LEFT = 73
const SKELETON_RIGHT = 127
const PROPERTY_LEFT = 143
const IN_BEND = 62
const OUT_BEND = 135

/** The template library: one template per exchange, marks from the connector catalogue. */
const templates: { logo: string; at: Pt; tone: string }[] = [
  { logo: '/integrations/mews.webp', at: { x: 26, y: 22 }, tone: 'var(--brand-blue)' },
  { logo: '/integrations/google_ads.webp', at: { x: 26, y: 50 }, tone: 'var(--brand-yellow)' },
  { logo: '/integrations/re_guest.png', at: { x: 26, y: 78 }, tone: 'var(--brand-blue)' },
]

type Kind = 'line' | 'bars'
/** The chart each template brings. */
const charts: Kind[] = ['line', 'bars', 'line']

/**
 * Three properties of one group. Each gets the same template with its own numbers: two KPIs
 * and a chart series per template. Bergwald runs Apaleo, not Mews, and the Mews template
 * still works there: its occupancy is mapped to Apaleo.
 */
const properties: {
  name: string
  at: Pt
  /** The source the template reads in this property, per template. */
  sources: string[]
  kpis: [number, string, number, string][]
  series: number[][]
}[] = [
  {
    name: 'Hotel Alpenrose',
    at: { x: 170, y: 17 },
    sources: ['/integrations/mews.webp', '/integrations/google_ads.webp', '/integrations/re_guest.png'],
    kpis: [
      [84, ' %', 142, ' €'],
      [212, '', 23, ' €'],
      [96, '', 38, ' %'],
    ],
    series: [
      [48, 52, 50, 58, 62, 60, 68, 72, 70, 78, 82, 86],
      [62, 84, 48, 70, 92, 56],
      [40, 46, 58, 52, 64, 60, 72, 70, 78, 84, 80, 90],
    ],
  },
  {
    name: 'Seeblick Resort',
    at: { x: 170, y: 50 },
    sources: ['/integrations/mews.webp', '/integrations/google_ads.webp', '/integrations/re_guest.png'],
    kpis: [
      [77, ' %', 188, ' €'],
      [168, '', 29, ' €'],
      [71, '', 42, ' %'],
    ],
    series: [
      [60, 58, 64, 62, 56, 66, 70, 68, 74, 72, 76, 80],
      [74, 58, 88, 64, 52, 80],
      [56, 60, 54, 62, 66, 64, 70, 76, 72, 74, 82, 86],
    ],
  },
  {
    name: 'Bergwald Lodge',
    at: { x: 170, y: 83 },
    sources: ['/integrations/apaleo.png', '/integrations/google_ads.webp', '/integrations/re_guest.png'],
    kpis: [
      [91, ' %', 114, ' €'],
      [94, '', 19, ' €'],
      [58, '', 35, ' %'],
    ],
    series: [
      [66, 70, 74, 72, 78, 82, 80, 86, 88, 84, 90, 92],
      [52, 70, 60, 86, 74, 66],
      [36, 42, 40, 50, 48, 56, 54, 62, 60, 66, 70, 72],
    ],
  },
]
/** The property whose PMS differs from the template's (Apaleo instead of Mews). */
const REMAPPED = 2
/** Phones show one property per exchange; Bergwald goes first so its remap is seen. */
const phoneSlot = (p: number) => (p - REMAPPED + SLOTS) % SLOTS

const inPath = (t: number) => elbow({ x: TILE_RIGHT, y: templates[t].at.y }, { x: SKELETON_LEFT, y: SKELETON.y }, IN_BEND)
const outPath = (p: number) => elbow({ x: SKELETON_RIGHT, y: SKELETON.y }, { x: PROPERTY_LEFT, y: properties[p].at.y }, OUT_BEND)

/**
 * A layer that holds during its own exchange (`loop-roll-show`): the previous one leaves before
 * it arrives, so two values never overlap. Negative delay: the first cycle matches the loop end.
 */
const only = (slot: number, at: number) => ({ 'data-slot': slot, style: slotDelay(slot, -LOOP + at) })

/*
 * Exchange timeline (4 s each, `.loop-hub-*` phases): the template lights 0.9 s, its line draws
 * into the skeleton 1.0–1.5 s, the skeleton takes its shape 1.1 s, "apply" is pressed 1.45 s,
 * lines fan out to the properties 1.6–2.2 s, each property rebuilds with its own numbers
 * 1.9–2.9 s (counters and charts run on negative delays so the first cycle matches the loop end).
 */
const SHAPE_AT = 1.1
const FILL_AT = 1.75
const FAN = 0.12

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

const Mark: React.FC<{ src: string; className?: string; size?: number }> = ({ src, className, size = 20 }) => (
  <span className={cn('inline-flex shrink-0 items-center justify-center rounded-md bg-white', className)}>
    {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
    <img alt="" className="object-contain" height={size} src={src} style={{ width: size, height: size }} width={size} />
  </span>
)

/** A chart of one template in one property, drawn in again when its exchange arrives. */
const Chart: React.FC<{ uid: string; kind: Kind; values: number[]; color: string; slot: number; stagger: number }> = ({ uid, kind, values, color, slot, stagger }) => {
  const at = slotDelay(slot, -LOOP + 0.5 + stagger)
  if (kind === 'bars')
    return (
      <span className="flex h-full items-end gap-1.5 px-0.5">
        {values.map((v, i) => (
          <span
            className="loop-hub-grow flex-1 rounded-t-[4px]"
            key={i}
            style={{ height: `${v}%`, backgroundColor: color, ...slotDelay(slot, -LOOP + 0.5 + stagger + i * 0.04) }}
          />
        ))}
      </span>
    )
  const id = `roll-area-${uid}`
  return (
    <svg aria-hidden="true" className="size-full overflow-visible" viewBox="0 0 280 32">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.26" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="loop-roll-area" d={`${curve(values, 280, 32)} L 280 32 L 0 32 Z`} fill={`url(#${id})`} style={at} />
      <path className="loop-hub-trace" d={curve(values, 280, 32)} fill="none" pathLength={1} stroke={color} strokeLinecap="round" strokeWidth="2" style={at} />
    </svg>
  )
}

/**
 * Looping scene (wide), 12 s: dashboard templates, built once and rolled out to every property.
 * The library sits on the left (a Mews, a Google Ads and an agency's Re:Guest template); each
 * exchange one template lights, its line draws into the centre where the template's skeleton
 * takes shape (two KPI slots, a chart), "apply to 3 properties" is pressed and lines fan out
 * to three property dashboards, which rebuild with their own numbers. In the first exchange
 * Bergwald, which runs Apaleo rather than Mews, gets the same dashboard: its occupancy is
 * mapped to Apaleo. Below `xl` the pieces stack and one property at a time takes the result.
 * Reduced motion shows the Mews template rolled out. Timing: `.loop-hub-*` and `.loop-roll-*`
 * (scenes/rollout.css).
 */
export const TemplatesIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = rolloutCopy[locale === 'en' ? 'en' : 'de']

  return (
    <Scene className={cn('w-full', className)} label={c.label}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle lines, lines that draw per exchange, a pulse riding each. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full xl:block" viewBox="0 0 200 100">
          <g className="scene-fade" style={build(3)}>
            {[...templates.map((_, t) => inPath(t)), ...properties.map((_, p) => outPath(p))].map((d) => (
              <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            ))}
          </g>
          {Array.from({ length: SLOTS }, (_, slot) => (
            <g key={slot}>
              <path className="loop-hub-draw" d={inPath(slot)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.45" style={slotDelay(slot)} />
              <path className="loop-hub-comet" d={inPath(slot)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.9" style={slotDelay(slot)} />
              {properties.map((_, p) => (
                <React.Fragment key={p}>
                  <path className="loop-hub-draw-out" d={outPath(p)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.45" style={slotDelay(slot, p * FAN)} />
                  <path className="loop-hub-comet-out" d={outPath(p)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, p * FAN), '--comet': 0.12, '--comet-from': 0.17 } as React.CSSProperties} />
                </React.Fragment>
              ))}
            </g>
          ))}
        </svg>

        {/* Library: a row of marks on phones, three template tiles on the desktop stage. */}
        <div className="grid w-full max-w-md grid-cols-3 gap-2 xl:contents">
          <span className="hidden type-caption font-medium text-ink-3 xl:absolute xl:left-(--x) xl:top-(--y) xl:block xl:-translate-y-1/2" style={pos({ x: 2, y: 10 })}>
            <span className="scene-fade block" style={build(1)}>
              {c.library}
            </span>
          </span>
          {templates.map((tpl, t) => {
            const copy = c.templates[t]
            return (
              <div className={cn('relative xl:w-[25%]', AT)} key={copy.system} style={pos(tpl.at)}>
                <div className="scene-build-in" style={{ ...build(1 + t), '--from-x': '8px', '--from-y': '0px' } as React.CSSProperties}>
                  <div className="hub-float" style={{ '--float-delay': `${-t * 1.9}s` } as React.CSSProperties}>
                    <div className="relative flex items-center justify-center gap-3 rounded-[0.875rem] border border-line-strong bg-surface-2 p-2 shadow-card xl:justify-start xl:px-3 xl:py-2.5" title={copy.system}>
                      <Lit slot={t} />
                      <Mark className="size-8 xl:size-9" size={20} src={tpl.logo} />
                      <span className="hidden min-w-0 flex-col xl:flex">
                        <span className="truncate type-small font-medium leading-5 text-ink">{copy.name}</span>
                        <span className="truncate type-caption leading-4 text-ink-3">
                          {copy.system} · {copy.by}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* The template: its skeleton takes the shape of the template of this exchange. */}
        <div className={cn('relative z-10 w-full max-w-sm xl:w-[27%] xl:max-w-none', AT)} style={pos(SKELETON)}>
          <div className="scene-build" style={build(0)}>
            <div className="relative rounded-[1.125rem] border border-line-strong bg-surface-2 shadow-float">
              {Array.from({ length: SLOTS }, (_, slot) => (
                <Lit key={slot} slot={slot} stagger={0.45} />
              ))}
              <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-3">
                <span className="grid size-8 shrink-0 [&>*]:[grid-area:1/1]">
                  {templates.map((tpl, t) => (
                    <span className="loop-roll-show" key={t} {...only(t, SHAPE_AT)}>
                      <Mark className="size-8" size={18} src={tpl.logo} />
                    </span>
                  ))}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="type-caption leading-4 text-ink-3">{c.template}</span>
                  <span className="grid type-small font-medium leading-5 text-ink [&>*]:[grid-area:1/1]">
                    {c.templates.map((tpl, t) => (
                      <span className="loop-roll-show truncate" key={t} {...only(t, SHAPE_AT)}>
                        {tpl.name}
                      </span>
                    ))}
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-2 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((k) => (
                    <div className="flex flex-col gap-1.5 rounded-[0.625rem] border border-dashed border-line-strong px-2.5 py-2" key={k}>
                      <span className="grid type-caption leading-4 text-ink-2 [&>*]:[grid-area:1/1]">
                        {c.kpis.map((pair, t) => (
                          <span className="loop-roll-show truncate" key={t} {...only(t, SHAPE_AT + k * 0.08)}>
                            {pair[k]}
                          </span>
                        ))}
                      </span>
                      <span className="h-2.5 w-3/5 rounded-full bg-surface-3" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 rounded-[0.625rem] border border-dashed border-line-strong px-2.5 py-2">
                  <span className="grid type-caption leading-4 text-ink-2 [&>*]:[grid-area:1/1]">
                    {c.charts.map((name, t) => (
                      <span className="loop-roll-show truncate" key={t} {...only(t, SHAPE_AT + 0.16)}>
                        {name}
                      </span>
                    ))}
                  </span>
                  {/* Placeholder shapes: the chart this template brings, before any numbers. */}
                  <span className="relative h-9">
                    {charts.map((kind, t) => (
                      <span className="loop-roll-show absolute inset-0" key={t} {...only(t, SHAPE_AT + 0.16)}>
                        {kind === 'bars' ? (
                          <span className="flex h-full items-end gap-1">
                            {[46, 70, 38, 84, 58, 66].map((v, i) => (
                              <span className="flex-1 rounded-t-[2px] border border-b-0 border-dashed border-line-strong" key={i} style={{ height: `${v}%` }} />
                            ))}
                          </span>
                        ) : (
                          <svg aria-hidden="true" className="size-full" viewBox="0 0 240 36">
                            <path d={curve([30, 40, 36, 52, 48, 60, 58, 70, 66, 78], 240, 36)} fill="none" stroke="var(--line-strong)" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="px-3 pb-3">
                <span className="loop-roll-press flex items-center justify-center rounded-[0.625rem] bg-surface-3 px-3 py-2 type-caption font-medium text-ink" style={perSlot}>
                  {c.apply}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" out />

        {/* Properties: all three on the desktop stage, one at a time on phones. */}
        <div className="grid w-full max-w-sm xl:contents">
          {properties.map((p, pi) => (
            <div
              className={cn('loop-hub-swap relative w-full [grid-area:1/1] xl:w-[27%]', AT)}
              data-slot={phoneSlot(pi)}
              key={p.name}
              style={{ ...pos(p.at), ...slotDelay(phoneSlot(pi)) }}
            >
              <div className="scene-build-in" style={{ ...build(4 + pi), '--from-x': '-8px', '--from-y': '0px' } as React.CSSProperties}>
                <div className="hub-float" style={{ '--float-delay': `${-pi * 2.3 - 1}s` } as React.CSSProperties}>
                  <div className="relative rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                    {Array.from({ length: SLOTS }, (_, slot) => (
                      <span
                        aria-hidden="true"
                        className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
                        data-slot={slot}
                        key={slot}
                        style={{ ...slotDelay(slot, pi * FAN), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
                      />
                    ))}

                    {pi === REMAPPED && (
                      <span className="loop-roll-remap absolute -top-3 left-3 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-success/40 bg-surface-2 py-0.5 pl-1 pr-2.5 type-caption font-medium text-ink shadow-card" data-slot={0} style={slotDelay(0)}>
                        <span className="inline-flex size-4 items-center justify-center rounded-full bg-success-soft text-success-deep">
                          <Check aria-hidden="true" size={10} strokeWidth={3} />
                        </span>
                        {c.remap}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate type-small font-medium leading-5 text-ink">{p.name}</span>
                      <span className="grid size-6 shrink-0 [&>*]:[grid-area:1/1]">
                        {p.sources.map((src, t) => (
                          <span className="loop-roll-show" key={t} {...only(t, FILL_AT + pi * FAN)}>
                            <Mark className="size-6" size={15} src={src} />
                          </span>
                        ))}
                      </span>
                    </div>

                    <div className="mt-1.5 grid [&>*]:[grid-area:1/1]">
                      {templates.map((tpl, t) => {
                        const [a, aUnit, b, bUnit] = p.kpis[t]
                        const stagger = pi * FAN
                        return (
                          <div className="loop-roll-show grid grid-cols-2 gap-x-3 gap-y-2" key={t} {...only(t, FILL_AT + stagger)}>
                            {[
                              [c.kpis[t][0], a, aUnit],
                              [c.kpis[t][1], b, bUnit],
                            ].map(([name, value, unit], k) => (
                              <span className="flex min-w-0 flex-col" key={k}>
                                <span className="truncate type-caption leading-4 text-ink-3">{name}</span>
                                <span className="whitespace-nowrap font-display text-lg font-medium leading-6 tnum text-ink">
                                  <span className="loop-hub-tick" style={{ ...slotDelay(t, -LOOP + 0.45 + stagger + k * 0.08), '--hub-to': value } as React.CSSProperties} />
                                  {unit}
                                </span>
                              </span>
                            ))}
                            <span className="col-span-2 h-8">
                              <Chart color={tpl.tone} uid={`${pi}-${t}`} kind={charts[t]} slot={t} stagger={stagger} values={p.series[t]} />
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  )
}
