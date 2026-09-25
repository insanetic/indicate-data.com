import { Check, Clock, Database, Filter, Link2, Lock, ShieldCheck } from 'lucide-react'
import React from 'react'

import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Avatar, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { Connector, LOOP, Lit, SLOTS, perSlot, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Stage from `lg`: a 200 × 70 coordinate system on a 20 : 7 box, so SVG units and CSS
 * percentages line up and no stroke is stretched.
 */
const W = 200
const H = 70
const CONNECT: Pt = { x: 27, y: 35 }
const CONNECT_RIGHT = 54
const SOURCE: Pt = { x: 74, y: 35 }
const GATE: Pt = { x: 116, y: 35 }
const READY: Pt = { x: 168, y: 35 }
const READY_LEFT = 138
/** A packet's run from the source to the dataset; loops.css puts the gate at 42 / 64 of it. */
const RUN = READY_LEFT - SOURCE.x

const authPath = `M ${CONNECT_RIGHT} ${SOURCE.y} H ${SOURCE.x}`
const dataPath = `M ${SOURCE.x} ${SOURCE.y} H ${READY_LEFT}`

/** One connection per exchange: who connects it, which system, what it delivers. */
const connections = [
  { logo: '/integrations/mews.webp', name: 'Mews', tone: 'yellow' as const, rows: '18.432', dupes: 12, cleaned: 38 },
  { logo: '/integrations/google_ads.webp', name: 'Google Ads', tone: 'blue' as const, rows: '9.120', dupes: 7, cleaned: 21 },
  { logo: '/integrations/apaleo.png', name: 'apaleo', tone: 'coral' as const, rows: '6.204', dupes: 4, cleaned: 16 },
]

type Packet = { kind: 'row' | 'dup' | 'dirty' | 'new'; at: number }
/** The history burst (with duplicates and messy rows), then a few increments; seconds into the exchange. */
const packets: Packet[] = [
  ...(['row', 'dup', 'dirty', 'row', 'row', 'dup', 'dirty', 'row'] as const).map((kind, k) => ({ kind, at: 1.3 + k * 0.09 })),
  ...[2.35, 2.8, 3.25].map((at) => ({ kind: 'new' as const, at })),
]

/** Three values for the `loop-tri-*` classes, one per exchange. */
const tri = (pick: (slot: number) => string | number, delay = 0): React.CSSProperties =>
  ({
    ...Object.fromEntries(Array.from({ length: SLOTS }, (_, slot) => [`--s${slot}`, pick(slot)])),
    '--delay': `${delay}s`,
  }) as React.CSSProperties
const only = (slot: number) => (s: number) => (s === slot ? 1 : 0)

/** Within each exchange: switch method, connected ~1 s, data lands ~2.2 s. */
const SWITCH_AT = 0.2
const LANDED_AT = 2.2
/** The dataset is named once its source is connected, before its history fills the bar. */
const NAMED_AT = 1.0
/** `.loop-late` / `.loop-early` flip at ~2.5 s of their clock; this brings it to ~1 s. */
const CONNECTED = -1.5

const AT = 'lg:absolute lg:left-(--x) lg:top-(--y) lg:-translate-x-1/2 lg:-translate-y-1/2'
const at = (p: Pt) => pos(p, W, H)
const pkt = (at: number, extra: React.CSSProperties = {}) => ({ ...perSlot, '--delay': `${at}s`, '--run': `${RUN}px`, ...extra }) as React.CSSProperties

/**
 * Looping scene (wide), 12 s: an ELT sync from connection to use. Each exchange (4 s) connects
 * one system a different way: you sign in yourself, a colleague gets a single-use link, a
 * client gets a link that expires; nobody hands over a password. Once connected, the history
 * streams out as a burst of rows (blue), then only increments follow (yellow). On the way,
 * the dedupe & cleanse step holds back duplicates (rose) and turns messy rows (hollow) into
 * clean ones, counting both; the dataset on the right lights up with its rows, the history
 * bar and what it is ready for. Below `lg` the pieces stack. Reduced motion shows the first
 * connection, done. Timing: `.loop-sync-*`, `.loop-hub-*`, `.loop-tri-*` in loops.css.
 */
export const SyncIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes.sync

  return (
    <Frame className={cn('loop loop-sync w-full', className)} label={s.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center lg:block lg:aspect-[20/7]">
        {/* Stage wiring and packets */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[authPath, dataPath].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {connections.map((_, slot) => (
            <g key={slot}>
              <path className="loop-hub-draw" d={authPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeWidth="0.45" style={slotDelay(slot, -0.4)} />
              <path className="loop-hub-comet" d={authPath} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, -0.4), '--comet': 0.3, '--comet-from': 0.35 } as React.CSSProperties} />
              <path className="loop-hub-draw" d={dataPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeWidth="0.45" style={slotDelay(slot, 0.3)} />
            </g>
          ))}
          {packets.map((p, k) => {
            const box = { x: SOURCE.x - 1.2, y: SOURCE.y - 0.8, width: 2.4, height: 1.6, rx: 0.5 }
            if (p.kind === 'dirty')
              return (
                <g key={k}>
                  <rect {...box} className="loop-sync-dirty" fill="none" stroke="var(--ink-2)" strokeDasharray="0.6 0.5" strokeWidth="0.35" style={pkt(p.at)} />
                  <rect {...box} className="loop-sync-clean" fill="var(--brand-blue)" style={pkt(p.at)} />
                </g>
              )
            if (p.kind === 'dup')
              return (
                <g key={k}>
                  <rect {...box} className="loop-sync-dup" fill="var(--brand-coral)" style={pkt(p.at + 0.03)} />
                  <rect {...box} className="loop-sync-pkt" fill="var(--brand-blue)" style={pkt(p.at)} />
                </g>
              )
            return <rect {...box} className="loop-sync-pkt" fill={p.kind === 'new' ? 'var(--brand-yellow)' : 'var(--brand-blue)'} key={k} style={pkt(p.at)} />
          })}
        </svg>

        {/* Connect: yourself, a colleague, a client */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[27%] lg:max-w-none', AT)} style={at(CONNECT)}>
          <div className="rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3 type-small font-medium text-ink">
              <Link2 aria-hidden="true" className="text-brand-yellow" size={14} strokeWidth={2} /> {s.connect}
            </div>
            <div className="grid p-4">
              {s.methods.map((m, slot) => (
                <div className="loop-tri-show flex flex-col gap-3 [grid-area:1/1]" key={m.who} style={tri(only(slot), SWITCH_AT)}>
                  <span className="flex items-center gap-2.5">
                    <Avatar className="size-7 text-[0.625rem]" initials={m.who[0]} tone={connections[slot].tone} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate type-small font-medium leading-4 text-ink">{m.who}</span>
                      <span className="truncate type-caption leading-4 text-ink-3">{m.role}</span>
                    </span>
                  </span>
                  {slot === 0 ? (
                    <span className="flex items-center gap-2 self-start rounded-btn bg-white px-3 py-1.5 type-caption font-medium text-[oklch(0.2_0.02_262)]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark */}
                      <img alt="" className="size-4 object-contain" height={16} src={connections[0].logo} width={16} />
                      {m.action}
                    </span>
                  ) : (
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-1.5 type-caption text-ink-2">
                        <Lock aria-hidden="true" className="shrink-0 text-brand-yellow" size={12} strokeWidth={2} />
                        <span className="truncate tnum">indicate.io/c/••••••••</span>
                      </span>
                      <span className="type-caption text-ink-3">
                        {m.action} · {slot === 1 ? s.once : s.expires}
                      </span>
                    </span>
                  )}
                  <span className="grid justify-items-start">
                    <span className="loop-early [grid-area:1/1]" style={slotDelay(slot, CONNECTED - LOOP)}>
                      <Chip tone="neutral">
                        <Clock aria-hidden="true" size={11} strokeWidth={2} /> {s.waiting}
                      </Chip>
                    </span>
                    <span className="loop-late [grid-area:1/1]" style={slotDelay(slot, CONNECTED - LOOP)}>
                      <Chip tone="green">
                        <Check aria-hidden="true" size={11} strokeWidth={3} /> {slot === 0 ? s.connected : s.approved}
                      </Chip>
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 border-t border-line px-4 py-2.5 type-caption text-ink-3">
              <ShieldCheck aria-hidden="true" className="shrink-0 text-brand-blue" size={13} strokeWidth={1.75} /> {s.noPassword}
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-yellow)" />

        {/* The source that was just connected */}
        <div className={cn('relative z-10 flex flex-col items-center gap-2', AT)} style={at(SOURCE)}>
          <span className="relative grid size-14 place-items-center rounded-[0.875rem] border border-line-strong bg-white shadow-card">
            {connections.map((_, slot) => (
              <Lit key={slot} slot={slot} stagger={0.2} />
            ))}
            {connections.map((c, slot) => (
              // eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS
              <img alt="" className="loop-tri-show size-8 object-contain [grid-area:1/1]" height={32} key={c.name} src={c.logo} style={tri(only(slot), SWITCH_AT)} width={32} />
            ))}
          </span>
          <span className="grid justify-items-center type-caption font-medium text-ink-2 lg:absolute lg:left-1/2 lg:top-full lg:mt-2 lg:-translate-x-1/2">
            {connections.map((c, slot) => (
              <span className="loop-tri-show whitespace-nowrap [grid-area:1/1]" key={c.name} style={tri(only(slot), SWITCH_AT)}>
                {c.name}
              </span>
            ))}
          </span>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-blue)" />

        {/* Dedupe & cleanse */}
        <div className={cn('relative z-10 flex flex-col items-center gap-2.5', AT)} style={at(GATE)}>
          <span className="relative grid size-16 place-items-center rounded-[1.125rem] border border-line-strong bg-surface-2 shadow-float">
            {connections.map((_, slot) => (
              <Lit key={slot} slot={slot} stagger={0.5} />
            ))}
            <Filter aria-hidden="true" className="text-brand-blue" size={24} strokeWidth={1.75} />
          </span>
          <span className="flex flex-col items-center gap-1 whitespace-nowrap rounded-[0.75rem] border border-line bg-surface-2 px-3 py-2 lg:absolute lg:left-1/2 lg:top-full lg:mt-3 lg:-translate-x-1/2">
            <span className="type-caption font-medium text-ink">{s.gate}</span>
            <span className="grid">
              {connections.map((c, slot) => (
                <span className="loop-tri-show flex items-center gap-3 type-caption tnum text-ink-3 [grid-area:1/1]" key={c.name} style={tri(only(slot), 1.3)}>
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 rounded-[2px] bg-brand-coral" />
                    <span>
                      −<span className="loop-hub-tick" style={{ ...slotDelay(slot, 0.2 - LOOP), '--hub-to': c.dupes } as React.CSSProperties} />
                    </span>
                    {s.dupes}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 rounded-[2px] border border-dashed border-ink-2" />
                    <span className="loop-hub-tick" style={{ ...slotDelay(slot, 0.3 - LOOP), '--hub-to': c.cleaned } as React.CSSProperties} /> {s.cleaned}
                  </span>
                </span>
              ))}
            </span>
          </span>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--brand-blue)" out />

        {/* The dataset, ready for use */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[30%] lg:max-w-none', AT)} style={at(READY)}>
          <div className="relative rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            {connections.map((_, slot) => (
              <span
                aria-hidden="true"
                className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
                data-slot={slot}
                key={slot}
                style={{ ...slotDelay(slot, 0.7), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
              />
            ))}
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex min-w-0 items-center gap-2 type-small font-medium text-ink">
                <Database aria-hidden="true" className="shrink-0 text-brand-blue" size={14} strokeWidth={1.75} />
                <span className="grid min-w-0">
                  {s.datasets.map((d, slot) => (
                    <span className="loop-tri-show truncate [grid-area:1/1]" key={d} style={tri(only(slot), NAMED_AT)}>
                      {d}
                    </span>
                  ))}
                </span>
              </span>
              <Chip tone="green">
                <Check aria-hidden="true" size={11} strokeWidth={3} /> {s.upToDate}
              </Chip>
            </div>
            <div className="flex flex-col gap-3.5 p-4">
              <span className="flex items-baseline gap-2">
                <span className="grid">
                  {connections.map((c, slot) => (
                    <span className="loop-tri-show font-display text-2xl font-medium leading-none tnum text-ink [grid-area:1/1]" key={c.name} style={tri(only(slot), LANDED_AT)}>
                      {c.rows}
                    </span>
                  ))}
                </span>
                <span className="type-caption text-ink-3">{s.rows}</span>
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="flex justify-between gap-3 type-caption text-ink-3">
                  <span>{s.history}</span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-1.5 rounded-[2px] bg-brand-yellow" /> {s.then}
                  </span>
                </span>
                <span className="h-1.5 overflow-hidden rounded-pill bg-surface-3">
                  <span className="loop-sync-fill block h-full rounded-pill bg-brand-blue" style={perSlot} />
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 type-caption text-ink-3">
                {s.readyFor}
                {['Dashboards', 'Resi', 'MCP'].map((use) => (
                  <span className="rounded-pill border border-line bg-surface px-2 py-0.5 font-medium text-ink-2" key={use}>
                    {withResi(use)}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
