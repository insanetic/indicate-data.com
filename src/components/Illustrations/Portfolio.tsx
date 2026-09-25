import { Building2, Lock } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Frame } from './primitives'
import { labelsFor } from './labels'
import { Connector, LOOP, Lit, SLOTS, elbow, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Stage from `lg`: a 200 × 90 coordinate system on a 20 : 9 box, so SVG units and CSS
 * percentages line up and no stroke is stretched.
 */
const W = 200
const H = 90
const NODE: Pt = { x: 88, y: 45 }
/** The node's radius in stage units (a 6 rem circle on a 68 rem stage). */
const NODE_R = 9
const BOARD_LEFT = 124
const BOARD: Pt = { x: 162, y: 45 }
const CARD_RIGHT = 50
const BEND = 66

/** Four properties of one group, each on its own PMS; names and systems are the same in every language. */
const properties: { name: string; pms: string; logo: string; at: Pt }[] = [
  { name: 'Alpenrose', pms: 'Mews', logo: '/integrations/mews.webp', at: { x: 25, y: 12 } },
  { name: 'Seeblick', pms: 'apaleo', logo: '/integrations/apaleo.png', at: { x: 25, y: 34 } },
  { name: 'Bergwald', pms: 'ASA', logo: '/integrations/asa_hotelsoftware.svg', at: { x: 25, y: 56 } },
  { name: 'Stadthof', pms: 'Oracle Opera', logo: '/integrations/oracle.svg', at: { x: 25, y: 78 } },
]

type Metric = { values: number[]; plan: number[]; scale: number; unit: string }
/** Head office ranks the group by one metric per exchange: occupancy, ADR, RevPAR (= occupancy × ADR). */
const metrics: Metric[] = [
  { values: [84, 77, 91, 69], plan: [80, 81, 85, 71], scale: 100, unit: ' %' },
  { values: [142, 188, 114, 164], plan: [145, 180, 125, 158], scale: 200, unit: ' €' },
  { values: [119, 145, 104, 113], plan: [110, 146, 106, 108], scale: 160, unit: ' €' },
]
/** Within 4 % under plan is a warning (yellow), further under is a miss (rose), on or over plan is blue. */
const WARN = 0.96
const statusColor = (value: number, plan: number) =>
  value >= plan ? 'var(--brand-blue)' : value >= plan * WARN ? 'var(--brand-yellow)' : 'var(--brand-coral)'
/** Rank (0 = top) of each property in each metric. */
const ranks = metrics.map((m) => {
  const order = m.values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
  return properties.map((_, i) => order.findIndex((o) => o.i === i))
})

/** Three values for the `loop-tri-*` classes, one per exchange. */
const tri = (pick: (slot: number) => string | number, delay = 0): React.CSSProperties =>
  ({
    ...Object.fromEntries(Array.from({ length: SLOTS }, (_, slot) => [`--s${slot}`, pick(slot)])),
    '--delay': `${delay}s`,
  }) as React.CSSProperties

/** The board re-sorts once the group's line reaches it; the metric switch comes first. */
const SWITCH_AT = 0.2
const SORT_AT = 2.3

const inPath = (i: number) => elbow({ x: CARD_RIGHT, y: properties[i].at.y }, { x: NODE.x - NODE_R, y: NODE.y }, BEND)
const outPath = `M ${NODE.x + NODE_R} ${NODE.y} H ${BOARD_LEFT}`

/** Quarter arcs around the node (100-unit box), one per property, with a small gap. */
const arc = (i: number) => {
  const r = 46
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return `${(50 + r * Math.sin(rad)).toFixed(2)} ${(50 - r * Math.cos(rad)).toFixed(2)}`
  }
  return `M ${pt(i * 90 + 8)} A ${r} ${r} 0 0 1 ${pt(i * 90 + 82)}`
}

const AT = 'lg:absolute lg:left-(--x) lg:top-(--y) lg:-translate-x-1/2 lg:-translate-y-1/2'
const at = (p: Pt) => pos(p, W, H)

/**
 * Looping scene (wide), 12 s: a hotel group seen from head office. Four properties sit on the
 * left, each in its own space on its own PMS; their lines converge on the group, whose ring
 * closes a quarter per property, and one line carries the result to head office's board. Each
 * exchange (4 s) head office switches the metric (occupancy, ADR, RevPAR), the four lines draw
 * in, and the rows slide into the new order: bars against a plan tick, blue on or over plan, yellow
 * just under it, rose clearly under, the leader on the rail. Below `lg` the pieces stack. Reduced motion shows the occupancy
 * ranking with its lines drawn. Timing: `.loop-hub-*` and `.loop-tri-*` in loops.css.
 */
export const PortfolioIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const g = l.scenes.group
  const metricNames = [l.occupancy, l.adr, l.revpar]

  return (
    <Frame className={cn('loop loop-group w-full', className)} label={g.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center lg:block lg:aspect-[20/9]">
        {/* Stage wiring */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[...properties.map((_, i) => inPath(i)), outPath].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {Array.from({ length: SLOTS }, (_, slot) => (
            <g key={slot}>
              {properties.map((_, i) => (
                <React.Fragment key={i}>
                  <path className="loop-hub-draw" d={inPath(i)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.45" style={slotDelay(slot, i * 0.1)} />
                  <path className="loop-hub-comet" d={inPath(i)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.9" style={slotDelay(slot, i * 0.1)} />
                </React.Fragment>
              ))}
              <path className="loop-hub-draw-out" d={outPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeWidth="0.45" style={slotDelay(slot, 0.35)} />
              <path className="loop-hub-comet-out" d={outPath} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, 0.35), '--comet': 0.2 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* Properties */}
        <div className="grid w-full max-w-md grid-cols-2 gap-2.5 lg:contents">
          {properties.map((p, i) => (
            <div className={cn('relative z-10 lg:w-[25%]', AT)} key={p.name} style={at(p.at)}>
              <div className="hub-float" style={{ '--float-delay': `${-i * 1.7}s` } as React.CSSProperties}>
                <div className="relative flex items-center gap-3 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                  {Array.from({ length: SLOTS }, (_, slot) => (
                    <Lit key={slot} slot={slot} stagger={i * 0.1} />
                  ))}
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white" title={p.pms}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                    <img alt="" className="size-6 object-contain" height={24} src={p.logo} width={24} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate type-small font-medium leading-5 text-ink">{p.name}</span>
                    <span className="flex items-center gap-1 truncate type-caption leading-4 text-ink-3">
                      <Lock aria-hidden="true" className="shrink-0" size={10} strokeWidth={2} />
                      <span className="truncate">
                        {p.pms}
                        <span className="max-sm:hidden"> · {g.ownSpace}</span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-yellow)" />

        {/* The group: a ring that closes a quarter per property */}
        <div className={cn('relative z-10 flex flex-col items-center gap-2.5', AT)} style={at(NODE)}>
          <div className="relative grid size-24 place-items-center rounded-full border border-line-strong bg-surface-2 shadow-float">
            <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 100 100">
              {properties.map((_, i) => (
                <path d={arc(i)} fill="none" key={i} stroke="var(--line)" strokeLinecap="round" strokeWidth="3" />
              ))}
              {Array.from({ length: SLOTS }, (_, slot) =>
                properties.map((_, i) => (
                  <path className="loop-hub-draw" d={arc(i)} data-slot={slot} fill="none" key={`${slot}-${i}`} pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="3" style={slotDelay(slot, 0.45 + i * 0.1)} />
                )),
              )}
            </svg>
            <BrandBars size={30} />
          </div>
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-line bg-surface-2 px-2.5 py-1 type-caption font-medium text-ink-2 lg:absolute lg:left-1/2 lg:top-full lg:mt-3 lg:-translate-x-1/2">
            <Building2 aria-hidden="true" className="text-brand-blue" size={13} strokeWidth={1.75} />
            {g.node} · {g.nodeNote}
          </span>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--ink)" out />

        {/* Head office: the ranking board */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[38%] lg:max-w-none', AT)} style={at(BOARD)}>
          <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            {Array.from({ length: SLOTS }, (_, slot) => (
              <span
                aria-hidden="true"
                className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
                data-slot={slot}
                key={slot}
                style={{ ...slotDelay(slot, 0.3), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
              />
            ))}
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 whitespace-nowrap type-small font-medium text-ink">
                <BrandBars size={13} /> {g.board}
              </span>
              {/* Metric switch: the selection slides to the metric of this exchange. */}
              <span className="relative grid grid-cols-[repeat(3,1fr)] rounded-pill border border-line bg-surface p-0.5">
                <span className="absolute inset-y-0.5 left-0.5 w-[calc((100%-0.25rem)/3)]">
                  <span className="loop-tri-slide block size-full rounded-pill bg-surface-3" style={tri((slot) => slot, SWITCH_AT)} />
                </span>
                {metricNames.map((name) => (
                  <span className="relative whitespace-nowrap px-2.5 py-0.5 text-center type-caption font-medium text-ink-2" key={name}>
                    {name}
                  </span>
                ))}
              </span>
            </div>

            <div className="relative mx-4 mt-2 h-44">
              {/* Places stay put; the rows move. The top place is the leader's. */}
              <span aria-hidden="true" className="absolute -left-4 top-2 h-7 w-[3px] rounded-r-full bg-ink" />
              {properties.map((_, place) => (
                <span className="absolute left-0 flex h-11 w-4 items-center type-caption tnum text-ink-3" key={place} style={{ top: `${place * 2.75}rem` }}>
                  {place + 1}
                </span>
              ))}
              {properties.map((p, i) => (
                <div className="loop-tri-y absolute left-6 right-0 top-0 h-11" key={p.name} style={tri((slot) => ranks[slot][i], SORT_AT)}>
                  <div className="grid h-full grid-cols-[4.75rem_minmax(0,1fr)_3.25rem] items-center gap-3 bg-surface-2">
                    <span className="truncate type-small font-medium text-ink">{p.name}</span>
                    <span className="relative h-2 rounded-full bg-surface-3">
                      <span className="loop-tri-x absolute inset-0" style={tri((slot) => metrics[slot].values[i] / metrics[slot].scale, SORT_AT)}>
                        <span
                          className="loop-tri-bg block size-full rounded-full"
                          style={tri((slot) => statusColor(metrics[slot].values[i], metrics[slot].plan[i]), SORT_AT)}
                        />
                      </span>
                      <span className="loop-tri-slide absolute inset-0" style={tri((slot) => metrics[slot].plan[i] / metrics[slot].scale, SORT_AT)}>
                        <span className="absolute -inset-y-1 left-0 w-0.5 -translate-x-1/2 rounded-full bg-ink" />
                      </span>
                    </span>
                    <span className="grid justify-items-end">
                      {metrics.map((m, slot) => (
                        <span
                          className="loop-tri-show font-display text-base font-medium leading-none tnum text-ink [grid-area:1/1]"
                          key={slot}
                          style={tri((s) => (s === slot ? 1 : 0), SORT_AT)}
                        >
                          {m.values[i]}
                          {m.unit}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 type-caption text-ink-3">
              <li className="flex items-center gap-1.5">
                <i className="h-2.5 w-0.5 rounded-full bg-ink" /> {l.plan}
              </li>
              <li className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-brand-blue" /> {g.above}
              </li>
              <li className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-brand-yellow" /> {g.near}
              </li>
              <li className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-brand-coral" /> {g.below}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  )
}
