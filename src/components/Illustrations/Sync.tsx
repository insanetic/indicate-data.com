import { Check, Link2 } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/**
 * Looping scene (wide): four connections refresh one after another on their own schedule
 * (row highlights, "refreshing" turns into "up to date"), the history bar fills from the first
 * day, and a connect link shows how a hotel authorises its PMS itself.
 * Timing lives in loops.css (`.loop-sync`, 8 s).
 */
export const SyncIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes.sync
  const delay = (i: number) => ({ '--delay': `${i * 1.3}s` }) as React.CSSProperties

  return (
    <Frame className={cn('loop loop-sync w-full', className)} label="Verbindungen aktualisieren sich nacheinander, die Historie füllt sich, ein Verbindungslink wird genutzt">
      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6">
        {/* Connections */}
        <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {s.title}
            </span>
            <span className="type-caption tnum text-ink-3">4 · {l.sourcesOk}</span>
          </div>
          <ul className="flex flex-col gap-1 p-3">
            {s.rows.map(([name, datasets, schedule], i) => (
              <li className="loop-sync-row grid grid-cols-[1.2fr_1.6fr_auto] items-center gap-3 rounded-card-inner px-3 py-2.5 type-small" key={name} style={delay(i)}>
                <span className="flex items-center gap-2.5 font-medium text-ink">
                  <span className="inline-flex size-7 items-center justify-center rounded-md border border-line bg-surface font-display text-[0.7rem] font-medium text-ink-2">
                    {name.slice(0, 2)}
                  </span>
                  {name}
                </span>
                <span className="flex flex-col">
                  <span className="truncate type-caption text-ink-2">{datasets}</span>
                  <span className="type-caption text-ink-3">{schedule}</span>
                </span>
                <span className="relative h-5 w-[6.5rem] text-right type-caption tnum">
                  <span className="loop-sync-busy absolute inset-y-0 right-0 flex items-center gap-1.5 text-ink-2" style={delay(i)}>
                    <BrandBars size={10} thinking /> {s.busy}
                  </span>
                  <span className="loop-sync-ok absolute inset-y-0 right-0 flex items-center gap-1 text-success-deep" style={delay(i)}>
                    <Check aria-hidden="true" size={12} strokeWidth={2.5} /> {s.ok}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          {/* History */}
          <div className="flex flex-col gap-3 rounded-[1rem] border border-line bg-surface-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="type-caption font-medium text-ink-2">{s.history}</span>
              <span className="type-caption tnum text-ink-3">{s.historyNote}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-pill bg-surface-3">
              <div className="loop-sync-bar h-full w-full rounded-pill bg-brand-blue" />
            </div>
            <div className="flex justify-between type-caption tnum text-ink-3">
              <span>{s.historyStart}</span>
              <span>{s.historyEnd}</span>
            </div>
          </div>

          {/* Connect link */}
          <div className="flex flex-1 flex-col gap-3 rounded-[1rem] border border-line bg-surface-2 p-4">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <Link2 aria-hidden="true" className="text-accent" size={14} strokeWidth={1.75} /> {s.invite}
            </span>
            <p className="type-caption text-ink-3 pretty">{s.inviteText}</p>
            <ol className="mt-auto flex items-center gap-2 type-caption text-ink-2">
              {s.inviteSteps.map((step, i) => (
                <li className="flex items-center gap-2" key={step}>
                  <span className="inline-flex size-5 items-center justify-center rounded-full border border-line bg-surface font-display text-[0.65rem] font-medium tnum text-accent">{i + 1}</span>
                  <span className="whitespace-nowrap">{step}</span>
                  {i < s.inviteSteps.length - 1 && <span aria-hidden="true" className="h-px w-3 bg-line-strong" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Frame>
  )
}
