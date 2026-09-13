'use client'

import React from 'react'

import type { PriceView } from '@subneo/payload-pricing'

import type { Locale } from '@/i18n/config'
import { cn } from '@/utilities/ui'

import { fill, money, periodSuffix, type Labels } from './format'

type Props = {
  price: PriceView | undefined
  contact: boolean
  unit?: string
  labels: Labels
  locale: Locale
  size?: 'lg' | 'md'
}

/** The big number with its unit lines. Swaps with a short rise when the period changes. */
export const Price: React.FC<Props> = ({ price, contact, unit, labels: t, locale, size = 'lg' }) => {
  const big = cn('font-display font-medium leading-none tracking-tight tnum text-ink', size === 'lg' ? 'text-[2.75rem]' : 'text-[2rem]')
  if (contact || !price) {
    return (
      <div className="flex min-h-[4.25rem] flex-col justify-end gap-1.5">
        <p className={big}>{t.custom}</p>
        <p className="type-caption text-ink-3">{t.onRequest}</p>
      </div>
    )
  }
  const perMonth = price.months > 1
  const shown = perMonth ? price.perMonth : price.amount
  return (
    <div className="flex min-h-[4.25rem] flex-col justify-end gap-1.5">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="price-swap" key={`${price.currency}-${price.period}`}>
          <span className={big}>{money(shown, price.currency, locale)}</span>
        </span>
        <span className="type-small text-ink-3">{perMonth ? t.perMonth : periodSuffix(price, t)}</span>
        {price.listAmount !== undefined && (
          <span className="type-small text-ink-3 line-through tnum">{money(perMonth ? price.listAmount / price.months : price.listAmount, price.currency, locale)}</span>
        )}
      </p>
      {(unit || perMonth) && (
        <p className="type-caption text-ink-3">
          {unit}
          {unit && perMonth ? ' · ' : ''}
          {perMonth ? fill(t.billedYearly, { amount: money(price.amount, price.currency, locale) }) : ''}
        </p>
      )}
    </div>
  )
}
