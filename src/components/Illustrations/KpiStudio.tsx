import { Check } from 'lucide-react'
import React from 'react'

import { withResi } from '@/components/Resi'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const code = [
  ['{', ''],
  ['  "$project": [{', ''],
  ['    "$fn": "div",', ''],
  ['    "$operands": ["sum(net_revenue)", "rooms_available"],', ''],
  ['    "$as": "value"', ''],
  ['  }],', ''],
  ['  "$from": "hotel_data_source.reservation",', ''],
  ['  "$where": { "$ne": ["status", "cancelled"] }', 'hl'],
  ['}', ''],
] as const

/**
 * Looping scene (wide): a KPI definition (the JSON DSL of the semantic layer) is written in
 * KPI Studio, the dry-run preview updates from the old to the new value, and the new version
 * lands in the history and is released. Timing lives in loops.css (`.loop-studio`).
 */
export const KpiStudioIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes.studio

  return (
    <Frame className={cn('loop loop-studio w-full', className)} label="KPI Studio: eine Kennzahl wird als Definition geschrieben, geprüft und als neue Version freigegeben">
      <div className="grid overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Editor */}
        <div className="flex flex-col border-b border-line md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {l.scenes.kpiStudio}
            </span>
            <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[0.6875rem] leading-5 text-ink-2">{s.file}</span>
            <span className="ml-auto type-caption text-ink-3">{s.collection}</span>
          </div>
          <pre className="loop-studio-code m-0 overflow-hidden p-4 font-mono text-[0.75rem] leading-6 text-ink-3 md:p-5">
            {code.map(([line, hl], i) => (
              <span className={cn('block whitespace-pre', hl && 'rounded-sm bg-brand-yellow-soft/60 text-ink')} key={i}>
                <span className="mr-4 inline-block w-4 select-none text-right text-ink-3/60">{i + 1}</span>
                {line}
              </span>
            ))}
          </pre>
        </div>

        {/* Preview and versions */}
        <div className="flex flex-col gap-4 p-4 md:p-5">
          <div className="rounded-card-inner border border-line bg-surface p-3.5">
            <span className="type-caption text-ink-3">{s.preview}</span>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="type-caption text-ink-2">{l.revpar}</span>
                <span className="relative block h-7 min-w-[5rem] whitespace-nowrap font-display text-2xl font-medium leading-none tnum text-ink">
                  <span className="loop-studio-old absolute left-0 top-0">116 €</span>
                  <span className="loop-studio-new absolute left-0 top-0">119 €</span>
                </span>
              </div>
              <span className="loop-studio-new type-caption font-medium tnum text-success-deep">+9,4 % {l.vsLastYear}</span>
            </div>
            <Sparkline className="mt-3 h-10" height={40} points={[52, 58, 55, 66, 70, 78, 84]} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="type-caption text-ink-3">{s.dimensions}</span>
            <div className="flex flex-wrap gap-1.5">
              {s.dims.map((d) => (
                <Chip key={d} tone="neutral">{d}</Chip>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1.5">
            <span className="type-caption text-ink-3">{s.versions}</span>
            <ul className="flex flex-col gap-1 type-caption">
              {s.changelog.map((entry, i) => {
                const latest = i === s.changelog.length - 1
                return (
                  <li
                    className={cn(
                      'flex items-center gap-2 rounded-card-inner border border-line bg-surface px-3 py-1.5',
                      latest ? 'loop-studio-row text-ink' : 'text-ink-2',
                    )}
                    key={entry}
                  >
                    <span className="truncate">{entry}</span>
                    {latest && (
                      <Chip className="loop-studio-chip ml-auto" tone="green">
                        <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {s.released}
                      </Chip>
                    )}
                  </li>
                )
              })}
            </ul>
            <span className="loop-studio-chip px-1 pt-1 type-caption text-ink-3">{withResi(s.usedIn)}</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}
