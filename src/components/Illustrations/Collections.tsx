import { Briefcase, Building2, Check, Globe } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const icons = [Building2, Briefcase, Globe]

/**
 * Looping scene (wide): a KPI collection is released and shared. The collection card on the
 * left gets its "released" chip, the connectors draw to the three recipient groups on the
 * right (hotel group, clients, community) and a tick lands on every recipient one after
 * another. 8 s clock (`.loop-share-*` in loops.css); reduced motion shows everything delivered.
 */
export const CollectionsIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const c = l.scenes.collections
  const delay = (s: number) => ({ '--delay': `${s}s` }) as React.CSSProperties
  const rowY = (i: number) => ((i + 0.5) / c.groups.length) * 100
  const path = (i: number) => `M 0 50 C 55 50, 45 ${rowY(i)}, 100 ${rowY(i)}`

  return (
    <Frame className={cn('loop loop-share w-full', className)} label="Eine KPI-Sammlung wird freigegeben und mit Hotelgruppe, Kunden und Community geteilt">
      <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(3rem,6rem)_minmax(0,6fr)] md:items-center md:gap-0">
        {/* The collection */}
        <div className="flex flex-col gap-3 rounded-[1rem] border border-line-strong bg-surface-2 p-4 shadow-float md:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {c.title}
            </span>
            <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[0.6875rem] leading-5 text-ink-2">{c.version}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-xl font-medium leading-tight text-ink">{c.name}</span>
            <span className="type-caption text-ink-3">{c.counts}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {c.items.map((item) => (
              <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-[0.6875rem] font-medium leading-5 text-ink-2" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="type-caption text-ink-3">{c.owner}</span>
            <Chip className="loop-share-pub" tone="green">
              <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {c.released}
            </Chip>
          </div>
        </div>

        {/* Connectors: the collection to every group */}
        <svg aria-hidden="true" className="hidden h-full min-h-[12rem] w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 100">
          {c.groups.map((g, i) => (
            <path d={path(i)} fill="none" key={`g${g.name}`} stroke="var(--line-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
          {/* No non-scaling-stroke here: Chromium miscomputes the dash of a `pathLength` path with it. */}
          {c.groups.map((g, i) => (
            <path
              className="loop-share-path"
              d={path(i)}
              fill="none"
              key={g.name}
              pathLength={1}
              stroke="var(--brand-blue)"
              strokeLinecap="round"
              strokeWidth="1.6"
              style={delay(i * 0.6)}
            />
          ))}
        </svg>

        {/* Recipients */}
        <div className="flex flex-col gap-3">
          {c.groups.map((g, i) => {
            const Icon = icons[i]
            return (
              <div className="flex flex-col gap-2 rounded-card-inner border border-line bg-surface-2 px-3.5 py-3 shadow-card" key={g.name}>
                <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
                  <Icon aria-hidden="true" className="text-accent" size={14} strokeWidth={1.75} /> {g.name}
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {g.members.map((m, j) => (
                    <li className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-0.5 text-[0.6875rem] font-medium leading-5 text-ink" key={m}>
                      {m}
                      <Check aria-hidden="true" className="loop-share-tick text-[oklch(0.78_0.15_160)]" size={11} strokeWidth={2.5} style={delay(i * 0.6 + j * 0.2)} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
          <span className="px-1 type-caption text-ink-3">{c.readOnly}</span>
        </div>
      </div>
    </Frame>
  )
}
