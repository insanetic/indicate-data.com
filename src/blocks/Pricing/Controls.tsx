'use client'

import React from 'react'

import type { Locale } from '@/i18n/config'
import { cn } from '@/utilities/ui'

import { Segmented } from './Segmented'
import { fill, type Labels } from './format'

type Props = {
  periods: string[]
  period: string
  onPeriod: (p: string) => void
  savings: Record<string, number | undefined>
  currencies: string[]
  currency: string | undefined
  onCurrency: (c: string) => void
  labels: Labels
  locale: Locale
}

const periodName = (key: string, t: Labels): string => {
  if (key === 'month') return t.monthly
  if (key === 'year') return t.yearly
  const [count, unit] = key.split('-')
  return fill(t.every, { count, period: t.periodsPlural[unit] || unit })
}

/** Billing period switch (with the saving tag) and, when needed, a currency select. */
export const Controls: React.FC<Props> = ({ periods, period, onPeriod, savings, currencies, currency, onCurrency, labels: t }) => {
  if (periods.length < 2 && currencies.length < 2) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {periods.length > 1 && (
        <Segmented
          ariaLabel={t.billing}
          onChange={onPeriod}
          options={periods.map((p) => {
            const save = savings[p]
            const active = p === period
            return {
              value: p,
              label: periodName(p, t),
              tag: save ? (
                <span
                  className={cn(
                    'rounded-[3px] px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none tnum transition-colors duration-200',
                    active ? 'bg-brand-yellow text-accent-ink' : 'bg-brand-yellow-soft text-brand-yellow',
                  )}
                >
                  {fill(t.savePercent, { percent: save })}
                </span>
              ) : undefined,
            }
          })}
          role="radiogroup"
          value={period}
        />
      )}
      {currencies.length > 1 && (
        <label className="inline-flex h-11 items-center gap-2 rounded-btn border border-line bg-surface-2 px-3 type-small text-ink-2">
          <span className="sr-only">{t.currency}</span>
          <select className="bg-transparent font-medium text-ink outline-none" onChange={(e) => onCurrency(e.target.value)} value={currency}>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
