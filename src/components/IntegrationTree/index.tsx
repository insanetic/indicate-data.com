import { BarChart3, Check, Mail, Sparkles, type LucideIcon } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { Connector, type Pt } from '@/components/Illustrations/stage'
import { Media } from '@/components/Media'
import { ResiMark } from '@/components/Resi'
import type { Locale } from '@/i18n/config'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

/** A system on a tile: an uploaded logo from the CMS, or a static mark from the connector catalogue. */
export type TreeSystem = { name: string; logo?: MediaType | number | null; logoSrc?: string | null }

const copy = {
  de: {
    label: 'Datenquellen leuchten nacheinander auf und ihre Leitung zeichnet sich bis zu Indicate; darunter versorgt Indicate Dashboards, Agent und Reports',
    centre: 'Indicate',
    dashboards: { title: 'Dashboards & Reports', detail: 'Umsatz · ADR · Kanalmix' },
    agent: { title: 'Agent & MCP', detail: 'Resi · Claude · ChatGPT · Langdock' },
    flying: { title: 'Flying KPIs', scheduled: 'Wochenreport · Mo 08:00', sent: 'An 3 Empfänger gesendet', detail: 'PDF + Digest per E-Mail' },
  },
  en: {
    label: 'Data sources light up one after another and their line draws into Indicate; below, Indicate feeds dashboards, the agent and reports',
    centre: 'Indicate',
    dashboards: { title: 'Dashboards & reports', detail: 'Revenue · ADR · channel mix' },
    agent: { title: 'Agent & MCP', detail: 'Resi · Claude · ChatGPT · Langdock' },
    flying: { title: 'Flying KPIs', scheduled: 'Weekly report · Mon 08:00', sent: 'Sent to 3 recipients', detail: 'PDF + digest by email' },
  },
}

/*
 * Stage from `lg`: a 200 × 110 coordinate system on a 20 : 11 box, so SVG units and CSS
 * percentages line up and no stroke is stretched (no dashed, stuttering lines).
 */
const W = 200
const H = 110
/** Tile slots: two staggered rows above the bus, like ClickHouse's integration tree. */
const slots: Pt[] = [
  { x: 18, y: 12 },
  { x: 54, y: 12 },
  { x: 86, y: 10 },
  { x: 114, y: 10 },
  { x: 146, y: 12 },
  { x: 182, y: 12 },
  { x: 36, y: 34 },
  { x: 70, y: 36 },
  { x: 130, y: 36 },
  { x: 164, y: 34 },
]
const BUS = 52
const CENTRE: Pt = { x: 100, y: 66 }
const OUT_BUS = 80
const OUTPUTS: Pt[] = [
  { x: 36, y: 96 },
  { x: 100, y: 96 },
  { x: 164, y: 96 },
]
const LOOP = 8
const R = 3

const place = (p: Pt) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` })
const delay = (s: number) => ({ '--delay': `${s.toFixed(2)}s` }) as React.CSSProperties

/** Down from the tile, along the bus with rounded corners, down into the centre block. */
function sourcePath({ x, y }: Pt): string {
  const top = CENTRE.y - 4
  if (Math.abs(x - CENTRE.x) < 0.01) return `M ${x} ${y} V ${top}`
  const dx = Math.sign(CENTRE.x - x)
  return `M ${x} ${y} V ${BUS - R} Q ${x} ${BUS} ${x + dx * R} ${BUS} H ${CENTRE.x - dx * R} Q ${CENTRE.x} ${BUS} ${CENTRE.x} ${BUS + R} V ${top}`
}
/** Down from the centre, along the lower bus, down into the output card. */
function outputPath({ x, y }: Pt): string {
  const from = CENTRE.y + 4
  const to = y - 6
  if (Math.abs(x - CENTRE.x) < 0.01) return `M ${x} ${from} V ${to}`
  const dx = Math.sign(x - CENTRE.x)
  return `M ${CENTRE.x} ${from} V ${OUT_BUS - R} Q ${CENTRE.x} ${OUT_BUS} ${CENTRE.x + dx * R} ${OUT_BUS} H ${x - dx * R} Q ${x} ${OUT_BUS} ${x} ${OUT_BUS + R} V ${to}`
}

const bars = [38, 52, 46, 64, 58, 76, 88]
const clients = [
  { name: 'Claude', src: '/clients/claude.svg' },
  { name: 'ChatGPT', src: '/clients/openai.svg' },
  { name: 'Langdock', src: '/clients/langdock.svg' },
]

/**
 * Sources sit on logo tiles above Indicate, wired to it with rounded orthogonal lines. On an
 * 8 s clock every source takes its turn: the tile lights, its line draws into the centre and a
 * pulse rides it; idle lines carry a slow dotted flow. Below, three output cards take turns
 * too: a line draws out, the card lights and its content plays (bars build, assistants light
 * up, the report goes from scheduled to sent). Pure CSS (`.loop-tree-*` in loops.css); reduced
 * motion shows the wiring still and every card finished. Below `lg` the pieces stack.
 */
export const IntegrationTree: React.FC<{ systems: TreeSystem[]; locale?: Locale | null; className?: string }> = ({
  systems,
  locale,
  className,
}) => {
  const t = copy[locale === 'en' ? 'en' : 'de']
  // Systems with a logo fill the tiles first; the rest is listed under the diagram anyway.
  const hasMark = (s: TreeSystem) => Boolean((s.logo && typeof s.logo === 'object') || s.logoSrc)
  const tiles = [...systems].sort((a, b) => Number(hasMark(b)) - Number(hasMark(a))).slice(0, slots.length)
  const step = LOOP / tiles.length
  const outDelay = (i: number) => 0.4 + (i * LOOP) / OUTPUTS.length

  const tile = (sys: TreeSystem, i: number) => (
    <span
      className={cn(
        'relative flex size-12 items-center justify-center rounded-[0.875rem] border border-line-strong shadow-card lg:size-14',
        // Marks are drawn for light backgrounds; text tiles stay on the dark surface.
        hasMark(sys) ? 'bg-white' : 'bg-surface-2',
      )}
      title={sys.name}
    >
      <span aria-hidden="true" className="loop-tree-lit pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-brand-blue" style={delay(i * step)} />
      {/* The catalogue mark wins over a CMS upload, so tiles and the directory show the same logo. */}
      {sys.logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- static mark, sized by CSS
        <img alt="" className="size-6 object-contain lg:size-7" height={28} src={sys.logoSrc} width={28} />
      ) : sys.logo && typeof sys.logo === 'object' ? (
        <Media htmlElement={null} imgClassName="size-6 object-contain lg:size-7" resource={sys.logo} />
      ) : (
        <span className="font-display text-base font-medium text-ink-2">{initials(sys.name)}</span>
      )}
    </span>
  )

  // White so the three brand colours of the mark stay visible; a blue light travels around it.
  const centre = (
    <span className="loop-tree-centre relative inline-flex rounded-[calc(1rem+2px)] p-[2px] shadow-float">
      <span className="flex flex-col items-center justify-center gap-1 rounded-[1rem] bg-white px-6 py-4 text-[oklch(0.2_0.02_262)]">
        <BrandBars size={26} />
        <span className="font-display text-base font-medium">{t.centre}</span>
      </span>
    </span>
  )

  const card = (i: number, Icon: LucideIcon, title: string, body: React.ReactNode) => (
    <div className="relative flex w-full flex-col gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 p-3.5 shadow-card" key={title}>
      <span aria-hidden="true" className="loop-tree-glow pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-resi-mint" style={delay(outDelay(i))} />
      <span className="flex items-center gap-2 type-caption font-medium text-ink">
        <Icon aria-hidden="true" className="shrink-0 text-resi-teal" size={15} strokeWidth={1.75} />
        {title}
      </span>
      {body}
    </div>
  )

  const outputs = [
    card(
      0,
      BarChart3,
      t.dashboards.title,
      <>
        <div className="flex h-9 items-end gap-[3px]">
          {bars.map((v, k) => (
            <span className="loop-tree-grow flex-1 rounded-t-[2px] bg-brand-blue" key={k} style={{ height: `${v}%`, ...delay(outDelay(0) + k * 0.04) }} />
          ))}
        </div>
        <span className="type-caption text-ink-3">{t.dashboards.detail}</span>
      </>,
    ),
    card(
      1,
      Sparkles,
      t.agent.title,
      <>
        <div className="flex h-9 items-center gap-2">
          <span className="loop-tree-pop" style={delay(outDelay(1))}>
            <ResiMark size={28} />
          </span>
          {clients.map((c, k) => (
            <span className="loop-tree-pop inline-flex size-7 items-center justify-center rounded-full bg-white" key={c.name} style={delay(outDelay(1) + 0.12 * (k + 1))}>
              {/* eslint-disable-next-line @next/next/no-img-element -- vendor mark, shown unaltered */}
              <img alt="" className="size-4 object-contain" height={16} src={c.src} width={16} />
            </span>
          ))}
        </div>
        <span className="type-caption text-ink-3">{t.agent.detail}</span>
      </>,
    ),
    card(
      2,
      Mail,
      t.flying.title,
      <>
        <div className="flex h-9 items-center">
          <span className="grid w-full">
            <span className="loop-tree-sched flex items-center justify-between gap-2 rounded-btn border border-line bg-surface px-2.5 py-1.5 type-caption text-ink-2 [grid-area:1/1]" style={delay(outDelay(2))}>
              {t.flying.scheduled}
              <i className="size-1.5 rounded-full bg-ink-3" />
            </span>
            <span className="loop-tree-sent flex items-center gap-2 rounded-btn border border-resi-mint/40 bg-surface px-2.5 py-1.5 type-caption text-ink [grid-area:1/1]" style={delay(outDelay(2))}>
              <Check aria-hidden="true" className="text-resi-mint" size={13} strokeWidth={2.5} />
              {t.flying.sent}
            </span>
          </span>
        </div>
        <span className="type-caption text-ink-3">{t.flying.detail}</span>
      </>,
    ),
  ]

  return (
    <div aria-label={t.label} className={cn('loop loop-tree select-none', className)} role="img" style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      {/* Stage */}
      <div className="relative hidden aspect-[20/11] lg:block">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${W} ${H}`}>
          {tiles.map((_, i) => (
            <path className="hub-dots" d={sourcePath(slots[i])} fill="none" key={`g${i}`} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {OUTPUTS.map((p, i) => (
            <path className="hub-dots" d={outputPath(p)} fill="none" key={`go${i}`} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {tiles.map((_, i) => (
            <React.Fragment key={`a${i}`}>
              <path className="loop-tree-path" d={sourcePath(slots[i])} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.5" style={delay(i * step)} />
              <path className="loop-tree-comet" d={sourcePath(slots[i])} fill="none" pathLength={1} stroke="var(--resi-teal)" strokeLinecap="round" strokeWidth="1" style={delay(i * step)} />
            </React.Fragment>
          ))}
          {OUTPUTS.map((p, i) => (
            <React.Fragment key={`o${i}`}>
              <path className="loop-tree-out" d={outputPath(p)} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeLinejoin="round" strokeWidth="0.5" style={delay(outDelay(i) - 0.5)} />
              <path className="loop-tree-out-comet" d={outputPath(p)} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="1" style={delay(outDelay(i) - 0.5)} />
            </React.Fragment>
          ))}
        </svg>

        {tiles.map((sys, i) => (
          <span className="absolute -translate-x-1/2 -translate-y-1/2" key={i} style={place(slots[i])}>
            <span className="hub-float block" style={{ '--float-delay': `${-i * 1.3}s` } as React.CSSProperties}>
              {tile(sys, i)}
            </span>
          </span>
        ))}

        <span className="absolute -translate-x-1/2 -translate-y-1/2" style={place(CENTRE)}>
          {centre}
        </span>

        {OUTPUTS.map((p, i) => (
          <div className="absolute w-[27%] -translate-x-1/2 -translate-y-1/2" key={i} style={place(p)}>
            {outputs[i]}
          </div>
        ))}
      </div>

      {/* Phones: the same pieces stacked */}
      <div className="flex flex-col items-center lg:hidden">
        <div className="flex flex-wrap justify-center gap-2.5">{tiles.map((sys, i) => <React.Fragment key={i}>{tile(sys, i)}</React.Fragment>)}</div>
        <Connector />
        {centre}
        <Connector out />
        <div className="flex w-full max-w-sm flex-col gap-2.5">{outputs}</div>
      </div>
    </div>
  )
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2)
}
