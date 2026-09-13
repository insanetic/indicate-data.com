import { formatMoney, type EntitlementView } from '@subneo/sdk'
import type { HighlightModel, OverageModel, PlanModel, PriceView } from '@subneo/payload-pricing'

import { localeTags, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'

export type Labels = Dictionary['pricing']

export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m))

export const money = (amount: number, currency: string, locale: Locale): string =>
  formatMoney(amount, currency, localeTags[locale])

export const integer = (n: number, locale: Locale): string => new Intl.NumberFormat(localeTags[locale]).format(n)

/** "pro Monat" / "alle 3 Monate". */
export const resetLabel = (reset: { period: string; count: number } | undefined, t: Labels): string | undefined => {
  if (!reset) return undefined
  if (reset.count <= 1) return fill(t.per, { period: t.periods[reset.period] || reset.period })
  return fill(t.every, { count: reset.count, period: t.periodsPlural[reset.period] || reset.period })
}

/** "weitere 5 € je 100" for a usage price. */
export const overageLabel = (overage: OverageModel | undefined, t: Labels, locale: Locale): string | undefined => {
  if (!overage) return undefined
  if (overage.pricingModel === 'flat' && overage.amount !== undefined) {
    const price = money(overage.amount, overage.currency, locale)
    return overage.packageSize && overage.packageSize > 1
      ? fill(t.thenPackage, { price, n: integer(overage.packageSize, locale) })
      : fill(t.then, { price })
  }
  const paid = overage.tiers?.find((tier) => tier.unitAmount > 0)
  return paid ? fill(t.then, { price: money(paid.unitAmount, overage.currency, locale) }) : undefined
}

export type Cell = { kind: 'check' } | { kind: 'dash' } | { kind: 'text'; text: string; hint?: string }

/** What a comparison cell shows for an entitlement (and the usage price behind it, if any). */
export const cellFor = (view: EntitlementView | undefined, overage: OverageModel | undefined, t: Labels, locale: Locale): Cell => {
  const hint = overageLabel(overage, t, locale)
  if (!view) return hint ? { kind: 'text', text: t.addon, hint } : { kind: 'dash' }
  switch (view.kind) {
    case 'boolean':
      return view.enabled ? { kind: 'check' } : { kind: 'dash' }
    case 'string':
      return view.text ? { kind: 'text', text: view.text } : { kind: 'dash' }
    case 'number':
      return { kind: 'text', text: integer(view.value, locale) }
    case 'allocation':
    case 'consumable': {
      const reset = view.kind === 'consumable' ? resetLabel(view.reset, t) : undefined
      const suffix = reset ? ` ${reset}` : ''
      const included = view.included
      if (included?.infinite) return { kind: 'text', text: t.unlimited }
      if (included?.value) return { kind: 'text', text: `${integer(included.value, locale)}${suffix}`, hint }
      const max = view.max
      if (max && (max.infinite || (max.value || 0) > 0)) {
        return { kind: 'text', text: max.infinite ? t.unlimited : fill(t.upTo, { n: integer(max.value || 0, locale) }), hint }
      }
      return hint ? { kind: 'text', text: t.addon, hint } : { kind: 'dash' }
    }
  }
}

export type HighlightLine = { value?: string; label: string; suffix?: string; hint?: string }

/** One card row: "**3** Datenquellen", "**500** Resi-Credits / Monat", "Flying KPIs". */
export const highlightLine = (h: HighlightModel, overage: OverageModel | undefined, t: Labels, locale: Locale): HighlightLine | undefined => {
  const view = h.value
  if (!view || !h.granted) return undefined
  const hint = overageLabel(overage, t, locale)
  switch (view.kind) {
    case 'boolean':
      return { label: h.label }
    case 'string':
      return { label: `${h.label}: ${view.text}` }
    case 'number':
      return { value: integer(view.value, locale), label: h.label }
    case 'allocation':
    case 'consumable': {
      const included = view.included
      const value = included?.infinite ? t.unlimited : included?.value ? integer(included.value, locale) : undefined
      const suffix = view.kind === 'consumable' ? resetLabel(view.reset, t) : undefined
      return { value, label: h.label, suffix, hint }
    }
  }
}

/** The price to show: exact match, else the plan's own period in that currency, else anything. */
export const pickPrice = (plan: PlanModel, currency: string | undefined, period: string): PriceView | undefined => {
  const inCurrency = (currency && plan.prices[currency]) || Object.values(plan.prices)[0]
  if (!inCurrency) return undefined
  return inCurrency[period] || inCurrency.month || Object.values(inCurrency)[0]
}

/** Largest saving any plan offers for a period, for the toggle's tag. */
export const bestSavings = (plans: PlanModel[], currency: string | undefined, period: string): number | undefined => {
  let best: number | undefined
  for (const plan of plans) {
    const price = currency ? plan.prices[currency]?.[period] : undefined
    if (price?.savingsPercent && (best === undefined || price.savingsPercent > best)) best = price.savingsPercent
  }
  return best
}

/** "/ Monat" for monthly, "/ Jahr" for yearly, "alle 3 Monate" otherwise. */
export const periodSuffix = (price: PriceView, t: Labels): string => {
  if (price.period === 'month') return t.perMonth
  if (price.period === 'year') return t.perYear
  const [count, unit] = price.period.split('-')
  return fill(t.every, { count, period: t.periodsPlural[unit] || unit })
}
