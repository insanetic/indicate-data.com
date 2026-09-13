import { Check } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Bars, Chip, Frame, Sparkline } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const SLOT = 3

/**
 * Looping scene (wide): the cursor moves through three dashboard templates (a PMS, an ads
 * and a CRM template), the preview shows the widgets each one brings, and a chip confirms
 * that the template was applied and its KPIs mapped to the property's own sources.
 * Timing lives in loops.css (`.loop-slot-3`, `.loop-row-3`, `.loop-pop-3`).
 */
export const TemplatesIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const t = l.scenes.templates
  const sets = [t.widgets, t.adWidgets, t.crmWidgets]
  const values = [
    ['84 %', '142 €', '119 €', '61 k€'],
    ['4.900 €', '23 €', '6,4×', '312'],
    ['96', '71', '38 %', '2,1 h'],
  ]
  const delay = (i: number) => ({ '--delay': `${i * SLOT}s` }) as React.CSSProperties

  return (
    <Frame className={cn('loop w-full', className)} label="Dashboard-Vorlagen: eine Vorlage wird gewählt, angewendet und ihre Kennzahlen dem Haus zugeordnet" >
      <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float" style={{ '--loop': '9s' } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
            <BrandBars size={12} /> {t.title}
          </span>
          <span className="type-caption text-ink-3">{t.apply} Hotel Alpenrose</span>
        </div>

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="flex flex-col gap-1 border-b border-line p-3 md:border-b-0 md:border-r">
            {t.items.map((name, i) => (
              <li
                className="loop-row-3 flex flex-col gap-0.5 rounded-card-inner px-3 py-2.5 type-small"
                data-first={i === 0 || undefined}
                key={name}
                style={delay(i)}
              >
                <span className="font-medium">{name}</span>
                <span className="type-caption text-ink-3">{t.by[i]} · 4 Widgets</span>
              </li>
            ))}
          </ul>

          <div className="relative min-h-[15rem] p-4">
            {sets.map((widgets, i) => (
              <div className="loop-slot-3 absolute inset-4 flex flex-col gap-3" data-first={i === 0 || undefined} key={i} style={delay(i)}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {widgets.map((w, wi) => (
                    <div className="flex flex-col gap-1 rounded-card-inner border border-line bg-surface p-3" key={w}>
                      <span className="truncate type-caption text-ink-3">{w}</span>
                      <span className="font-display text-lg font-medium leading-none tnum text-ink">{values[i][wi]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-[3fr_2fr]">
                  <div className="rounded-card-inner border border-line bg-surface p-3">
                    <Sparkline className="h-14" color={i === 1 ? 'var(--brand-yellow)' : 'var(--brand-blue)'} height={60} points={[38, 46, 42, 55, 60, 58, 72, 70, 84]} />
                  </div>
                  <div className="h-20 rounded-card-inner border border-line bg-surface p-3">
                    <Bars color={i === 2 ? 'var(--brand-coral)' : 'var(--brand-blue)'} values={[46, 58, 52, 70, 64, 78]} />
                  </div>
                </div>
                <Chip className="loop-pop-3 absolute bottom-0 right-0" style={delay(i)} tone="green">
                  <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {t.applied} · {t.remap}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}
