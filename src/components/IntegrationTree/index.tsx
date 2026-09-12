import { BarChart3, Mail, Sparkles, type LucideIcon } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { Media } from '@/components/Media'
import type { Locale } from '@/i18n/config'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

export type TreeSystem = { name: string; logo?: MediaType | number | null }

const copy = {
  de: {
    label: 'Datenquellen leuchten nacheinander auf und ihre Leitung zeichnet sich bis zu Indicate; darunter versorgt Indicate Dashboards, Agent und Reports',
    centre: 'Indicate',
    outputs: ['Dashboards & Reports', 'Agent & MCP', 'Flying KPIs'],
  },
  en: {
    label: 'Data sources light up one after another and their line draws into Indicate; below, Indicate feeds dashboards, the agent and reports',
    centre: 'Indicate',
    outputs: ['Dashboards & reports', 'Agent & MCP', 'Flying KPIs'],
  },
}

const outputIcons: LucideIcon[] = [BarChart3, Sparkles, Mail]

/**
 * Tile slots in percent of the stage (x = centre, y = centre). Two staggered rows above the
 * centre block, like ClickHouse's integration tree. Ten slots; extra systems go to the list
 * under the diagram.
 */
const slots: { x: number; y: number }[] = [
  { x: 9, y: 10 },
  { x: 27, y: 10 },
  { x: 43, y: 8 },
  { x: 57, y: 8 },
  { x: 73, y: 10 },
  { x: 91, y: 10 },
  { x: 18, y: 30 },
  { x: 35, y: 32 },
  { x: 65, y: 32 },
  { x: 82, y: 30 },
]

const BUS_Y = 47
const CENTRE = { x: 50, y: 60 }
const OUT_Y = 90
const OUT_X = [22, 50, 78]

/**
 * Sources sit on tiles above a central Indicate block and are wired to it with orthogonal
 * lines. Every 6 s each source takes its turn: the tile lights up and its line draws to the
 * centre. Three outputs hang under the centre with a dash travelling towards them.
 * Pure CSS on the shared clock (`.loop-tree` in loops.css); reduced motion shows all lines.
 * Below `md` the same content renders as a plain grid without lines.
 */
export const IntegrationTree: React.FC<{ systems: TreeSystem[]; locale?: Locale | null; className?: string }> = ({
  systems,
  locale,
  className,
}) => {
  const t = copy[locale === 'en' ? 'en' : 'de']
  // Systems with a logo fill the tiles first; the rest is listed under the diagram anyway.
  const tiles = [...systems]
    .sort((a, b) => Number(Boolean(b.logo && typeof b.logo === 'object')) - Number(Boolean(a.logo && typeof a.logo === 'object')))
    .slice(0, slots.length)
  const step = 6 / tiles.length

  const sourcePath = (i: number) => {
    const { x, y } = slots[i]
    return `M ${x} ${y + 7} V ${BUS_Y} H ${CENTRE.x} V ${CENTRE.y - 8}`
  }
  const outputPath = (i: number) => `M ${CENTRE.x} ${CENTRE.y + 8} V ${(CENTRE.y + OUT_Y) / 2} H ${OUT_X[i]} V ${OUT_Y - 6}`

  const tile = (sys: TreeSystem, className?: string, style?: React.CSSProperties) => (
    <span
      className={cn(
        'flex size-14 items-center justify-center overflow-hidden rounded-[0.75rem] border bg-surface-2 border-line-strong',
        className,
      )}
      style={style}
      title={sys.name}
    >
      {sys.logo && typeof sys.logo === 'object' ? (
        <Media htmlElement={null} imgClassName="size-7 object-contain" resource={sys.logo} />
      ) : (
        <span className="font-display text-base font-medium text-ink-2">{initials(sys.name)}</span>
      )}
    </span>
  )

  const centre = (
    <span className="flex flex-col items-center justify-center gap-1 rounded-[0.875rem] bg-accent px-5 py-4 text-accent-ink shadow-float">
      <BrandBars size={26} />
      <span className="font-display text-base font-medium">{t.centre}</span>
    </span>
  )

  const output = (label: string, i: number) => {
    const Ico = outputIcons[i]
    return (
      <span className="flex items-center gap-2.5 rounded-[0.75rem] border border-line-strong bg-surface-2 px-3.5 py-2.5" key={label}>
        <Ico aria-hidden="true" className="shrink-0 text-accent" size={16} strokeWidth={1.75} />
        <span className="whitespace-nowrap type-caption font-medium text-ink">{label}</span>
      </span>
    )
  }

  return (
    <div aria-label={t.label} className={cn('loop loop-tree select-none', className)} role="img">
      {/* Desktop: absolute tiles wired with SVG */}
      <div className="relative hidden aspect-[16/8] md:block">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {tiles.map((_, i) => (
            <path d={sourcePath(i)} fill="none" key={`g${i}`} stroke="var(--line-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
          {t.outputs.map((_, i) => (
            <path d={outputPath(i)} fill="none" key={`go${i}`} stroke="var(--line-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
          {tiles.map((_, i) => (
            <path
              className="loop-tree-path"
              d={sourcePath(i)}
              fill="none"
              key={`a${i}`}
              pathLength={1}
              stroke="var(--accent)"
              strokeLinejoin="round"
              strokeWidth="2"
              style={{ '--delay': `${(i * step).toFixed(2)}s` } as React.CSSProperties}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {t.outputs.map((_, i) => (
            <path
              className="loop-tree-out"
              d={outputPath(i)}
              fill="none"
              key={`ao${i}`}
              pathLength={1}
              stroke="var(--brand-blue)"
              strokeLinecap="round"
              strokeWidth="2"
              style={{ '--delay': `${-i * 0.7}s` } as React.CSSProperties}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {tiles.map((sys, i) => (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2"
            key={i}
            style={{ left: `${slots[i].x}%`, top: `${slots[i].y}%` }}
          >
            {tile(sys, 'loop-tree-tile', { '--delay': `${(i * step).toFixed(2)}s` } as React.CSSProperties)}
          </span>
        ))}

        <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${CENTRE.x}%`, top: `${CENTRE.y}%` }}>
          {centre}
        </span>

        {t.outputs.map((label, i) => (
          <span className="absolute -translate-x-1/2 -translate-y-1/2" key={label} style={{ left: `${OUT_X[i]}%`, top: `${OUT_Y}%` }}>
            {output(label, i)}
          </span>
        ))}
      </div>

      {/* Phones: the same pieces as a grid */}
      <div className="flex flex-col items-center gap-6 md:hidden">
        <div className="flex flex-wrap justify-center gap-3">{tiles.map((sys, i) => <React.Fragment key={i}>{tile(sys)}</React.Fragment>)}</div>
        {centre}
        <div className="flex flex-wrap justify-center gap-2">{t.outputs.map((label, i) => output(label, i))}</div>
      </div>
    </div>
  )
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2)
}
