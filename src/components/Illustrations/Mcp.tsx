import { Check, Lock, ShieldCheck } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { findMcpClient } from '@/integrations/clients'
import { cn } from '@/utilities/ui'

import { mcpCopy } from './copy/mcp'
import { Chip } from './primitives'
import { Scene } from './Scene'
import { Connector, Lit, build, pos, slotDelay } from './stage'
import type { IllustrationProps } from './index'

/*
 * Desktop stage from `xl`: a 200 × 100 coordinate system on a 2 : 1 box, so SVG units and CSS
 * percentages line up and no stroke is stretched. Left to right: the assistants, the
 * conversation of the one asking, the MCP server, the space it reads from.
 */
const TILE_X = 11
const CARD = { x: 47, left: 25, right: 69 }
const SERVER = { x: 100, left: 79, right: 121 }
const SPACE = { x: 165, left: 135 }
/** Two lanes between the cards: the request travels on the upper one, the answer on the lower. */
const REQ_Y = 45
const RES_Y = 55

/** Assistants on the left; the last one only stands for "works in any MCP client". */
const assistants: { name: string; y: number }[] = [
  { name: 'Claude', y: 26 },
  { name: 'ChatGPT', y: 42 },
  { name: 'Langdock', y: 58 },
  { name: 'GitHub Copilot', y: 74 },
]

/** The space's KPI catalogue and sources. */
const catalogue = ['occupancy', 'adr', 'revpar', 'total_bookings', 'meta_ad_spend', 'cost_per_booking']
const sources = [
  { name: 'Mews', logo: '/integrations/mews.webp' },
  { name: 'Meta Ads', logo: '/integrations/meta_ads.svg' },
  { name: 'Google Ads', logo: '/integrations/google_ads.webp' },
]

/** Which assistant asks, which KPIs and sources its calls read, and whether it touches guest data. */
const turns: { asks: number; kpis: number[]; sources: number[]; guard: boolean }[] = [
  { asks: 0, kpis: [3, 4, 5], sources: [0, 1], guard: true },
  { asks: 1, kpis: [0, 1], sources: [0], guard: false },
  { asks: 2, kpis: [1, 2], sources: [0], guard: false },
]

/** Seconds into an exchange (on top of `slotDelay`) at which each hop starts, see mcp.css. */
const HOP = { tile: -0.6, request: -0.3, query: 0.15, lit: 0.55, back: 0.2, answer: 0.6, guard: 0.7 }

/** Tile wires start under the tile (tiles differ in width) and end at the conversation card. */
const tilePath = (i: number) => `M ${TILE_X} ${assistants[i].y} H ${CARD.left}`
const requestPath = `M ${CARD.right} ${REQ_Y} H ${SERVER.left}`
const queryPath = `M ${SERVER.right} ${REQ_Y} H ${SPACE.left}`
const backPath = `M ${SPACE.left} ${RES_Y} H ${SERVER.right}`
const answerPath = `M ${SERVER.left} ${RES_Y} H ${CARD.right}`

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

const Mark: React.FC<{ name: string; size: number; className?: string }> = ({ name, size, className }) => {
  const logo = findMcpClient(name)?.logo
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-white', className)}
      style={{ width: size + 12, height: size + 12 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark, rendered unaltered */}
      {logo && <img alt="" height={size} src={logo} style={{ width: size, height: size }} width={size} />}
    </span>
  )
}

/** A wire that draws once per exchange, with a yellow pulse riding it. */
const Hop: React.FC<{ d: string; slot: number; at: number; out?: boolean }> = ({ d, slot, at, out = false }) => (
  <>
    <path
      className={out ? 'loop-hub-draw-out' : 'loop-hub-draw'}
      d={d}
      data-slot={slot}
      fill="none"
      pathLength={1}
      stroke="var(--brand-blue)"
      strokeWidth="0.4"
      style={slotDelay(slot, at)}
    />
    <path
      className={out ? 'loop-hub-comet-out' : 'loop-hub-comet'}
      d={d}
      fill="none"
      pathLength={1}
      stroke="var(--brand-yellow)"
      strokeLinecap="round"
      strokeWidth="0.8"
      style={{ ...slotDelay(slot, at), '--comet': 0.3, '--comet-from': 0.35 } as React.CSSProperties}
    />
  </>
)

/**
 * Hero scene for the MCP page: Claude, ChatGPT and Langdock take turns asking the Indicate MCP
 * server. The asking assistant lights, its question appears in its own conversation, the
 * request travels to the server, the tool calls tick off, the KPIs they read light up in the
 * space, and the answer travels back into that assistant's conversation. In the first
 * exchange the question touches reservations: only aggregates travel back, the guest data row
 * stays locked. Three exchanges of 4 s on the 12 s clock (`.loop-hub-*`, `.loop-mcp-*`); below
 * `xl` the pieces stack. Reduced motion shows the first exchange, finished.
 */
export const McpIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = mcpCopy[locale === 'en' ? 'en' : 'de']

  const askedIn = (i: number) => turns.flatMap((t, slot) => (t.asks === i ? [slot] : []))
  const litBy = (key: 'kpis' | 'sources', i: number) => turns.flatMap((t, slot) => (t[key].includes(i) ? [slot] : []))

  return (
    <Scene className={cn('w-full', className)} label={c.label}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle lanes, and the hops that draw per exchange. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full xl:block" viewBox="0 0 200 100">
          <g className="scene-fade" style={{ '--build': '0.45s' } as React.CSSProperties}>
            {[...assistants.map((_, i) => tilePath(i)), requestPath, answerPath, queryPath, backPath].map((d) => (
              <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            ))}
          </g>
          {turns.map((turn, slot) => (
            <g key={slot}>
              <Hop at={HOP.tile} d={tilePath(turn.asks)} slot={slot} />
              <Hop at={HOP.request} d={requestPath} slot={slot} />
              <Hop at={HOP.query} d={queryPath} slot={slot} />
              <Hop at={HOP.back} d={backPath} out slot={slot} />
              <Hop at={HOP.answer} d={answerPath} out slot={slot} />
            </g>
          ))}
        </svg>

        {/* Assistants: a row on phones, a column on the desktop stage. */}
        <div className="flex flex-wrap justify-center gap-2 xl:contents">
          {assistants.map((a, i) => (
            <div
              className={cn('scene-build-in relative z-10', i === assistants.length - 1 && 'max-sm:hidden', AT)}
              key={a.name}
              style={{ ...pos({ x: TILE_X, y: a.y }), ...build(3 + i), '--from-x': '8px', '--from-y': '0px' } as React.CSSProperties}
            >
              <div className="hub-float" style={{ '--float-delay': `${-i * 1.7}s` } as React.CSSProperties}>
                <span className="relative flex items-center gap-2 rounded-[0.75rem] border border-line-strong bg-surface-2 py-1.5 pl-1.5 pr-2.5 shadow-card">
                  {askedIn(i).map((slot) => (
                    <span
                      aria-hidden="true"
                      className="loop-mcp-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
                      data-slot={slot}
                      key={slot}
                      style={slotDelay(slot)}
                    />
                  ))}
                  <Mark name={a.name} size={16} />
                  <span className="whitespace-nowrap type-caption font-medium text-ink-2">{a.name.replace('GitHub ', '')}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* The conversation of the assistant that is asking. */}
        <div
          className={cn('scene-build relative z-10 w-full max-w-md xl:w-[23%] xl:max-w-none', AT)}
          style={{ ...pos({ x: CARD.x, y: 50 }), ...build(1) }}
        >
          <div className="relative grid rounded-[1.125rem] border border-line-strong bg-surface-2 shadow-float">
            {turns.map((_, slot) => (
              <Lit key={slot} slot={slot} stagger={HOP.request} />
            ))}
            {turns.map((_, slot) => {
              const t = c.turns[slot]
              return (
                <div className="loop-mcp-turn flex flex-col [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
                  <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
                    <Mark name={t.client} size={12} />
                    <span className="type-caption font-medium text-ink-2">{t.client}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-3">
                    <p className="loop-mcp-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 text-[0.8125rem] leading-5 text-ink pretty" style={slotDelay(slot)}>
                      {t.q}
                    </p>
                    <div className="loop-mcp-a flex gap-2" style={slotDelay(slot)}>
                      <Mark className="mt-0.5" name={t.client} size={12} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface px-3 py-2.5">
                        <p className="text-[0.8125rem] leading-5 text-ink-2 pretty">{t.a}</p>
                        <span className="flex items-center gap-1.5 whitespace-nowrap type-caption text-ink-3">
                          <BrandBars size={10} /> {t.calls.length} {c.calls} {c.via}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* The MCP server, inside its guardrail. */}
        <div className={cn('scene-build relative z-10 w-full max-w-[17rem] xl:w-[21%] xl:max-w-none', AT)} style={{ ...pos({ x: SERVER.x, y: 47 }), ...build(0) }}>
          <span aria-hidden="true" className="pointer-events-none absolute -inset-2.5 rounded-[1.625rem] border border-brand-blue/25 bg-brand-blue/[0.04]" />
          <div className="relative rounded-[1.125rem] border border-line-strong bg-surface-2 p-3 shadow-float">
            {turns.map((_, slot) => (
              <Lit key={slot} slot={slot} />
            ))}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 type-caption font-medium text-ink">
                <BrandBars size={12} /> {c.server}
              </span>
              <Chip tone="green">
                <i className="size-1.5 rounded-full bg-current" /> {c.healthy}
              </Chip>
            </div>
            <code className="mt-2 block truncate rounded-md border border-line bg-surface px-2 py-1 font-mono text-[0.625rem] leading-4 text-ink-3">{c.endpoint}</code>
            <ul className="relative mt-2 grid font-mono text-[0.6875rem] leading-5">
              {turns.map((_, slot) => (
                <li className="flex flex-col [grid-area:1/1]" data-slot={slot} key={slot}>
                  {c.turns[slot].calls.map(([tool, args], i) => (
                    <span
                      className="loop-mcp-call flex items-center gap-1.5 whitespace-nowrap"
                      data-slot={slot}
                      key={`${tool}${args}`}
                      style={slotDelay(slot, i * 0.25)}
                    >
                      <span className="text-brand-yellow">→</span>
                      <span className="text-ink-2">{tool}</span>
                      <span className="min-w-0 truncate text-ink-3">{args}</span>
                      <Check aria-hidden="true" className="ml-auto shrink-0 text-success-deep" size={11} strokeWidth={2.5} />
                    </span>
                  ))}
                </li>
              ))}
              {/* Keeps the list three rows tall whichever exchange is showing. */}
              <li aria-hidden="true" className="invisible flex flex-col [grid-area:1/1]">
                <span>·</span>
                <span>·</span>
                <span>·</span>
              </li>
            </ul>
          </div>
          <span className="absolute inset-x-0 -bottom-2.5 flex translate-y-1/2 justify-center">
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-brand-blue/25 bg-surface-2 px-2.5 py-1 type-caption text-ink-2">
              <ShieldCheck aria-hidden="true" className="shrink-0 text-brand-blue" size={13} strokeWidth={1.75} />
              {c.guard}
            </span>
          </span>
        </div>

        <Connector className="mt-8 h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" out />

        {/* The space the server reads from. */}
        <div className={cn('scene-build relative w-full max-w-md xl:w-[30%] xl:max-w-none', AT)} style={{ ...pos({ x: SPACE.x, y: 50 }), ...build(2) }}>
          <div className="hub-float" style={{ '--float-delay': '-2.4s' } as React.CSSProperties}>
            <div className="relative rounded-[1.125rem] border border-line-strong bg-surface-2 p-3.5 shadow-float">
              <div className="flex items-center justify-between gap-3">
                <span className="type-caption font-medium text-ink">{c.space}</span>
                <span className="flex items-center gap-1.5">
                  {sources.map((src, i) => (
                    <span className="relative flex size-7 items-center justify-center rounded-[0.5rem] border border-line-strong bg-white" key={src.name} title={src.name}>
                      {litBy('sources', i).map((slot) => (
                        <Lit key={slot} slot={slot} stagger={HOP.lit} />
                      ))}
                      {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark */}
                      <img alt="" className="size-4 object-contain" height={16} src={src.logo} width={16} />
                    </span>
                  ))}
                </span>
              </div>

              <span className="mt-3 block type-caption text-ink-3">{c.kpis}</span>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {catalogue.map((kpi, i) => (
                  <span className="relative flex min-w-0 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[0.6875rem] leading-5 text-ink-2" key={kpi}>
                    {litBy('kpis', i).map((slot) => (
                      <Lit key={slot} slot={slot} stagger={HOP.lit + 0.1} />
                    ))}
                    <span className="truncate">{kpi}</span>
                  </span>
                ))}
              </div>

              <div className="relative mt-3 flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 type-caption">
                {turns.map((turn, slot) =>
                  turn.guard ? (
                    <span
                      aria-hidden="true"
                      className="loop-hub-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-yellow"
                      data-slot={slot}
                      key={slot}
                      style={{ ...slotDelay(slot, HOP.guard), '--glow': 'var(--brand-yellow)' } as React.CSSProperties}
                    />
                  ) : null,
                )}
                <Lock aria-hidden="true" className="shrink-0 text-brand-yellow" size={13} strokeWidth={2} />
                <span className="font-medium text-ink">{c.guest}</span>
                <span className="ml-auto truncate text-ink-3">{c.guestFields}</span>
              </div>
              <span className="relative mt-2 grid type-caption">
                {turns.map((turn, slot) =>
                  turn.guard ? (
                    <span className="loop-mcp-note flex items-center gap-1.5 text-ink-2 [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
                      <Check aria-hidden="true" className="shrink-0 text-success-deep" size={12} strokeWidth={2.5} />
                      {c.note}
                    </span>
                  ) : null,
                )}
                <span aria-hidden="true" className="invisible [grid-area:1/1]">
                  ·
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )
}
