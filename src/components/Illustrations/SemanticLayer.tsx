import { Check, LayoutDashboard, Lock } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { findMcpClient } from '@/integrations/clients'
import { ResiMark } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const SLOTS = 3
const LOOP = 9

/**
 * Looping scene (wide): the semantic layer. A KPI in the catalogue on the left lights up, its
 * definition unfolds in the middle (formula, dimensions, version, no guest data), and the
 * three consumers on the right (dashboard, Resi, Claude via MCP) receive the same value one
 * after another. Three KPIs take turns on one 9 s clock (`.loop-slot-3`, `.loop-row-3` and
 * `.loop-sem-value` in loops.css). Reduced motion shows the first KPI, finished.
 */
export const SemanticLayerIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes.semantic
  const slot = (i: number, extra = 0) => ({ '--delay': `${(i * LOOP) / SLOTS + extra}s` }) as React.CSSProperties
  const first = (i: number) => (i === 0 ? { 'data-first': '' } : {})
  const outY = (i: number) => ((i + 0.5) / s.consumers.length) * 100
  const claude = findMcpClient('Claude')

  const marks = [
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-surface-3 text-ink-2" key="dash">
      <LayoutDashboard aria-hidden="true" size={13} strokeWidth={1.75} />
    </span>,
    <ResiMark key="resi" size={24} />,
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-white" key="claude">
      {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
      {claude?.logo && <img alt="" height={14} src={claude.logo} style={{ width: 14, height: 14 }} width={14} />}
    </span>,
  ]

  return (
    <Frame className={cn('loop w-full', className)} label="Semantic Layer: eine Kennzahl aus dem Katalog, ihre Definition, dasselbe Ergebnis im Dashboard, bei Resi und in Claude" style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="grid gap-5 md:grid-cols-[minmax(0,9fr)_minmax(2rem,3rem)_minmax(0,13fr)_minmax(2rem,3rem)_minmax(0,10fr)] md:items-center md:gap-0">
        {/* Catalogue */}
        <div className="flex flex-col overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {s.catalogue}
            </span>
          </div>
          <ul className="flex flex-col gap-0.5 p-2">
            {s.kpis.map((k, i) => (
              <li
                className="loop-row-3 flex items-center justify-between gap-2 rounded-card-inner px-2.5 py-2 type-small text-ink-2"
                key={k.name}
                style={slot(i)}
                {...first(i)}
              >
                <span className="truncate font-medium">{k.name}</span>
                <i className="size-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.15_160)]" />
              </li>
            ))}
            {s.others.map((name) => (
              <li className="flex items-center justify-between gap-2 rounded-card-inner px-2.5 py-2 type-small text-ink-3" key={name}>
                <span className="truncate">{name}</span>
                <i className="size-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.15_160)]" />
              </li>
            ))}
          </ul>
          <span className="border-t border-line px-4 py-2 type-caption text-ink-3">{s.collection}</span>
        </div>

        {/* Connector: catalogue to definition */}
        <svg aria-hidden="true" className="hidden h-full w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="flow-line" d="M 0 50 L 100 50" fill="none" stroke="var(--brand-blue)" strokeOpacity="0.6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Definition: three panels take turns */}
        <div className="relative min-h-[17rem] overflow-hidden rounded-[1rem] border border-accent/40 bg-surface-2 shadow-float">
          {s.kpis.map((k, i) => (
            <div className="loop-slot-3 absolute inset-0 flex flex-col gap-3 p-4 md:p-5" key={k.name} style={slot(i)} {...first(i)}>
              <div className="flex items-center justify-between gap-3">
                <span className="type-caption text-ink-3">{s.definition}</span>
                <Chip tone="yellow">{k.name} · {k.version}</Chip>
              </div>
              <div className="flex flex-col gap-1">
                <span className="type-caption text-ink-3">{s.formula}</span>
                <code className="rounded-card-inner border border-line bg-surface px-3 py-2 font-mono text-[0.75rem] leading-5 text-ink">
                  {k.name.toLowerCase().replace(' ', '_')} = {k.formula}
                </code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="type-caption text-ink-3">{s.dimensions}</span>
                <span className="type-small text-ink-2">{k.dims}</span>
              </div>
              <span className="mt-auto flex items-center gap-2 type-caption text-ink-2">
                <Lock aria-hidden="true" className="shrink-0 text-accent" size={13} strokeWidth={1.75} /> {s.guests}
              </span>
            </div>
          ))}
        </div>

        {/* Connectors: definition to every consumer */}
        <svg aria-hidden="true" className="hidden h-full min-h-[10rem] w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 100">
          {s.consumers.map((name, i) => (
            <path
              className="flow-line"
              d={`M 0 50 C 55 50, 45 ${outY(i)}, 100 ${outY(i)}`}
              fill="none"
              key={name}
              stroke="var(--brand-blue)"
              strokeOpacity="0.6"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Consumers: every one gets the same value */}
        <ul className="flex flex-col gap-3">
          {s.consumers.map((name, i) => (
            <li className="flex items-center gap-3 rounded-card-inner border border-line bg-surface-2 px-3 py-2.5 shadow-card" key={name}>
              {marks[i]}
              <span className="flex min-w-0 flex-col">
                <span className="truncate type-caption text-ink-3">{name}</span>
                <span className="relative block h-5 w-[3.5rem]">
                  {s.kpis.map((k, j) => (
                    <span
                      className="loop-sem-value absolute left-0 top-0 whitespace-nowrap font-display text-base font-medium leading-5 tnum text-ink"
                      key={k.name}
                      style={slot(j, i * 0.25)}
                      {...(j === 0 ? { 'data-first': '' } : {})}
                    >
                      {k.value}
                    </span>
                  ))}
                </span>
              </span>
              <Check aria-hidden="true" className="ml-auto shrink-0 text-[oklch(0.78_0.15_160)]" size={13} strokeWidth={2.5} />
            </li>
          ))}
          <li className="px-1 type-caption text-ink-3">{s.same}</li>
        </ul>
      </div>
    </Frame>
  )
}
