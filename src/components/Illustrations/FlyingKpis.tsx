import { Check, Clock, LayoutDashboard, Mail, Newspaper } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ResiMark, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { Connector, curve, elbow, pos, type Pt } from './stage'
import type { IllustrationProps } from './index'

const LOOP = 9
/** Recipients receive one after another, 0.4 s apart. */
const STEP = 0.4

/*
 * Stage from `lg`: a 200 × 90 coordinate system on a 20 : 9 box, so SVG units and CSS
 * percentages line up and no stroke is stretched.
 */
const W = 200
const H = 90
const REPORT: Pt = { x: 38, y: 45 }
const NODE: Pt = { x: 100, y: 45 }
const RECIPIENTS: Pt[] = [
  { x: 170, y: 20 },
  { x: 170, y: 45 },
  { x: 170, y: 70 },
]
const BEND = 128
const at = (p: Pt) => pos(p, W, H)
const AT = 'lg:absolute lg:left-(--x) lg:top-(--y) lg:-translate-x-1/2 lg:-translate-y-1/2'
const delay = (s: number) => ({ '--delay': `${s.toFixed(2)}s` }) as React.CSSProperties

const inPath = `M ${REPORT.x + 20} ${NODE.y} H ${NODE.x}`
const outPath = (i: number) => elbow({ x: NODE.x, y: NODE.y }, { x: RECIPIENTS[i].x - 12, y: RECIPIENTS[i].y }, BEND)

const trend = [44, 48, 46, 55, 53, 61, 66, 64, 72, 80]
const lastYear = [40, 42, 44, 46, 45, 50, 52, 55, 57, 60]

/**
 * Looping scene (wide), 9 s: reports that arrive on their own. The scheduler's minute hand
 * sweeps to Monday 08:00 and its ring closes; the weekly report on the left lights up and
 * Resi writes three highlights into it; a pulse carries it to the scheduler, then lines draw
 * out to three recipients one after another (dashboards and digests, always by email), each lighting up as its status turns from
 * scheduled to delivered. Idle lines carry a slow dotted flow. Below `lg` the pieces stack.
 * Reduced motion shows everything delivered. Timing: `.loop-post-*` in loops.css.
 */
export const FlyingKpisIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes
  const p = s.post

  return (
    <Frame className={cn('loop loop-post w-full', className)} label={p.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center lg:block lg:aspect-[20/9]">
        {/* Stage wiring */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[inPath, ...RECIPIENTS.map((_, i) => outPath(i))].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          <path className="loop-post-in" d={inPath} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeWidth="0.5" />
          <path className="loop-post-in-comet" d={inPath} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="1" />
          {RECIPIENTS.map((_, i) => (
            <React.Fragment key={i}>
              <path className="loop-post-out" d={outPath(i)} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.5" style={delay(i * STEP)} />
              <path className="loop-post-comet" d={outPath(i)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="1" style={delay(i * STEP)} />
            </React.Fragment>
          ))}
        </svg>

        {/* The weekly report */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[34%] lg:max-w-none', AT)} style={at(REPORT)}>
          <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            <span aria-hidden="true" className="loop-post-lit pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-brand-blue" />
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 type-small font-medium text-ink">
                <BrandBars size={13} /> {s.reportTitle}
              </span>
              <Chip tone="neutral">
                <Mail aria-hidden="true" size={11} strokeWidth={2} /> {s.reportKind}
              </Chip>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: l.occupancy, value: '84 %', delta: '+6' },
                  { label: l.adr, value: '142 €', delta: '+3,1 %' },
                  { label: l.revpar, value: '119 €', delta: '+9,4 %' },
                ].map((k) => (
                  <div className="flex flex-col gap-0.5" key={k.label}>
                    <span className="type-caption text-ink-3">{k.label}</span>
                    <span className="font-display text-lg font-medium leading-tight tnum text-ink">{k.value}</span>
                    <span className="type-caption font-medium tnum text-success-deep">{k.delta}</span>
                  </div>
                ))}
              </div>
              <svg aria-hidden="true" className="h-12 w-full" preserveAspectRatio="none" viewBox="0 0 100 32">
                <path d={`${curve(trend, 100, 32, 3)} L 100 32 L 0 32 Z`} fill="var(--brand-blue)" fillOpacity="0.14" />
                <path d={curve(lastYear, 100, 32, 3)} fill="none" stroke="var(--ink-3)" strokeDasharray="2 2.5" strokeWidth="1" />
                <path d={curve(trend, 100, 32, 3)} fill="none" stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="1.75" />
              </svg>
              <div className="flex flex-col gap-1.5 rounded-card-inner border border-line bg-surface px-3 py-2.5">
                <span className="loop-post-note flex items-center gap-2 type-caption font-medium text-ink-2" style={delay(-0.2)}>
                  <ResiMark size={16} /> {withResi(p.highlights)}
                </span>
                {p.points.map((point, k) => (
                  <span className="loop-post-note flex items-center gap-2 type-caption text-ink-2" key={point} style={delay(k * 0.35)}>
                    <i className="size-1.5 shrink-0 rounded-full bg-resi-mint" /> {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-yellow)" />

        {/* Scheduler */}
        {/* The dial sits on the wire; the schedule hangs below it. */}
        <div className={cn('relative z-10 flex flex-col items-center gap-2.5', AT)} style={at(NODE)}>
          <div className="relative grid size-28 place-items-center rounded-full border border-line-strong bg-surface-2 shadow-float">
            <span aria-hidden="true" className="loop-post-flash pointer-events-none absolute -inset-[3px] rounded-full border-2 border-brand-blue" />
            <svg aria-hidden="true" className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="44" stroke="var(--line)" strokeWidth="3" />
              <circle className="loop-post-ring" cx="50" cy="50" fill="none" pathLength={1} r="44" stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <svg aria-hidden="true" className="relative size-20" viewBox="0 0 80 80">
              {Array.from({ length: 12 }, (_, i) => (
                <line
                  key={i}
                  stroke="var(--ink-3)"
                  strokeLinecap="round"
                  strokeWidth={i % 3 === 0 ? 2 : 1}
                  transform={`rotate(${i * 30} 40 40)`}
                  x1="40"
                  x2="40"
                  y1="6"
                  y2={i % 3 === 0 ? 12 : 10}
                />
              ))}
              {/* Hour hand on 8, minute hand sweeps a full turn to 12 */}
              <line stroke="var(--ink)" strokeLinecap="round" strokeWidth="3" transform="rotate(240 40 40)" x1="40" x2="40" y1="40" y2="22" />
              <g className="loop-post-hand">
                <line stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="2.25" x1="40" x2="40" y1="40" y2="13" />
              </g>
              <circle cx="40" cy="40" fill="var(--ink)" r="3" />
            </svg>
          </div>
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-line bg-surface-2 px-2.5 py-1 type-caption font-medium text-ink-2 lg:absolute lg:left-1/2 lg:top-full lg:mt-3 lg:-translate-x-1/2">
            <Clock aria-hidden="true" className="text-brand-blue" size={13} strokeWidth={1.75} />
            {p.schedule} · {p.repeat}
          </span>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-blue)" out />

        {/* Recipients */}
        <div className="flex w-full max-w-md flex-col gap-2.5 lg:contents">
          {p.recipients.map((r, i) => {
            const Icon = r.kind === 'digest' ? Newspaper : LayoutDashboard
            return (
              <div className={cn('relative z-10 w-full lg:w-[27%]', AT)} key={r.name} style={at(RECIPIENTS[i])}>
                <div className="relative flex items-center gap-3 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                  <span aria-hidden="true" className="loop-post-glow pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-brand-blue" style={delay(i * STEP)} />
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-ink-2">
                    <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate type-small font-medium text-ink">{r.name}</span>
                    <span className="truncate type-caption text-ink-3">{r.via}</span>
                  </span>
                  <span className="grid justify-items-end">
                    <span className="loop-post-wait flex items-center gap-1 type-caption text-ink-3 [grid-area:1/1]" style={delay(i * STEP)}>
                      <Clock aria-hidden="true" size={11} strokeWidth={2} /> {p.scheduled}
                    </span>
                    <span className="loop-post-done [grid-area:1/1]" style={delay(i * STEP)}>
                      <Chip tone="green">
                        <Check aria-hidden="true" size={11} strokeWidth={3} /> {p.delivered}
                      </Chip>
                    </span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Frame>
  )
}
