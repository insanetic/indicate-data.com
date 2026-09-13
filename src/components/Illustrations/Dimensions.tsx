import { Link2 } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const SLOTS = 3
const LOOP = 9

/**
 * Looping scene (wide): dimensions. The pickup KPI is split by a grouping dimension; the
 * active tab moves from channel to room category to origin and the bars re-split each time
 * (`.loop-row-3`, `.loop-slot-3`, `.loop-rise-3`). On the right the perspective toggles
 * between booking date and arrival, and the KPI value flips with it (`.loop-dim-*`). One
 * 9 s clock; reduced motion shows the first grouping and the first perspective.
 */
export const DimensionsIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const d = l.scenes.dimensions
  const slot = (i: number) => ({ '--delay': `${(i * LOOP) / SLOTS}s` }) as React.CSSProperties
  const half = (i: number) => ({ '--delay': `${(i * LOOP) / 2}s` }) as React.CSSProperties
  const first = (i: number) => (i === 0 ? { 'data-first': '' } : {})

  return (
    <Frame className={cn('loop w-full', className)} label="Dimensionen: der Pickup wird nach Kanal, Zimmerkategorie und Herkunft aufgeteilt; die Perspektive wechselt zwischen Buchungsdatum und Ankunft" style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-5">
        {/* KPI split by the active grouping */}
        <div className="flex flex-col overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {d.kpi}
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="relative block h-6 w-8 text-right">
                {d.perspectives.map((p, i) => (
                  <span className="loop-dim-on absolute right-0 top-0 font-display text-xl font-medium leading-6 tnum text-ink" key={p.name} style={half(i)} {...first(i)}>
                    {p.value}
                  </span>
                ))}
              </span>
              <span className="type-caption text-ink-3">{d.nights}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 pt-3">
            <span className="type-caption text-ink-3">{d.grouping}</span>
            <ul className="flex flex-wrap gap-1">
              {d.groups.map((g, i) => (
                <li className="loop-row-3 rounded-pill px-2.5 py-0.5 text-[0.6875rem] font-medium leading-5 text-ink-2" key={g.name} style={slot(i)} {...first(i)}>
                  {g.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[10rem] flex-1">
            {d.groups.map((g, i) => (
              <div className="loop-slot-3 absolute inset-0 flex items-end gap-3 px-4 pb-3 pt-4 md:gap-4" key={g.name} style={slot(i)} {...first(i)}>
                {g.bars.map(([name, v], j) => (
                  <div className="flex h-full flex-1 flex-col justify-end gap-1.5" key={name}>
                    <div className="flex h-full items-end">
                      <div
                        className={cn('loop-rise-3 w-full rounded-[4px]', j === 0 ? 'bg-brand-blue' : 'bg-brand-blue/45')}
                        style={{ height: `${v}%`, ...slot(i) }}
                      />
                    </div>
                    <span className="truncate text-center text-[0.6875rem] leading-4 text-ink-3">{name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <span className="border-t border-line px-4 py-2 type-caption text-ink-3">{d.inWidgets}</span>
        </div>

        {/* Perspective and cross-collection links */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-[1rem] border border-line bg-surface-2 p-4">
            <span className="type-caption text-ink-3">{d.perspective}</span>
            <ul className="flex flex-col gap-1">
              {d.perspectives.map((p, i) => (
                <li className="loop-dim-row flex items-center justify-between gap-3 rounded-card-inner border border-line px-3 py-2" key={p.name} style={half(i)} {...first(i)}>
                  <span className="flex flex-col">
                    <span className="type-small font-medium text-ink">{p.name}</span>
                    <span className="font-mono text-[0.6875rem] text-ink-3">{p.field}</span>
                  </span>
                  <span className="font-display text-lg font-medium tnum text-ink">{p.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 rounded-[1rem] border border-line bg-surface-2 p-4">
            <span className="type-caption text-ink-3">{d.linked}</span>
            <div className="flex flex-wrap items-center gap-2 rounded-card-inner border border-line bg-surface px-3 py-2">
              <Chip tone="neutral">{d.link[0]}</Chip>
              <span className="flex items-center gap-1.5 type-small text-ink-2">
                <Link2 aria-hidden="true" className="text-accent" size={13} strokeWidth={1.75} /> {d.link[1]}
              </span>
              <Chip className="ml-auto" tone="green">{d.link[2]}</Chip>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
