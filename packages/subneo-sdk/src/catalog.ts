/**
 * Pure helpers that turn the wire model into the questions a pricing page asks:
 * which currencies and billing periods exist, what a plan costs per month, which plan is
 * featured, and how entitlements line up across plans. Everything is deterministic and
 * side-effect free so it can run on the server and in tests alike.
 */
import { microsToAmount, percentOff } from './money'
import type {
  Cadence,
  Capacity,
  EntitlementKind,
  Metadata,
  Plan,
  PlanEntitlement,
  PlanFeatureRate,
  PlanRate,
  ResetAnchor,
  ResetPeriod,
} from './types'
import { INFINITE } from './types'

/* ------------------------------------------------------------------ */
/* Metadata                                                              */
/* ------------------------------------------------------------------ */

/** Metadata keys the pricing helpers understand. Values are strings in the Subneo console. */
export const META = {
  /** Ascending display order within a family (`"1"`, `"2"`, …). */
  rank: 'rank',
  /** `"true"` marks the plan to highlight. */
  featured: 'featured',
  /** Family code, for client-side narrowing until the API filters by family. */
  family: 'family',
  tagline: 'tagline',
  badge: 'badge',
  ctaUrl: 'ctaUrl',
  ctaLabel: 'ctaLabel',
} as const

export const metaString = (meta: Metadata | undefined, key: string): string | undefined => {
  const value = meta?.[key]
  if (typeof value === 'string') return value.trim() || undefined
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return undefined
}

export const metaNumber = (meta: Metadata | undefined, key: string): number | undefined => {
  const value = metaString(meta, key)
  if (value === undefined) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export const metaBool = (meta: Metadata | undefined, key: string): boolean =>
  ['true', '1', 'yes'].includes((metaString(meta, key) || '').toLowerCase())

/* ------------------------------------------------------------------ */
/* Quantities                                                            */
/* ------------------------------------------------------------------ */

export interface Quantity {
  infinite: boolean
  /** Present when finite. */
  value?: number
}

export const parseCapacity = (capacity: Capacity | undefined | null): Quantity | undefined => {
  if (capacity === undefined || capacity === null || capacity === '') return undefined
  if (capacity === INFINITE) return { infinite: true }
  const n = Number(capacity)
  return Number.isFinite(n) ? { infinite: false, value: n } : undefined
}

export interface ResetWindow {
  period: ResetPeriod
  count: number
  anchor?: ResetAnchor
}

/** The entitlement value as a discriminated union on `kind`, with capacities parsed. */
export type EntitlementView =
  | { kind: 'boolean'; enabled: boolean }
  | { kind: 'string'; text: string }
  | { kind: 'number'; value: number }
  | { kind: 'allocation'; min?: Quantity; included?: Quantity; max?: Quantity }
  | {
      kind: 'consumable'
      min?: Quantity
      included?: Quantity
      max?: Quantity
      reset?: ResetWindow
      rollover?: { enabled: boolean; maxCarry?: Quantity }
    }

export const entitlementView = (entitlement: PlanEntitlement): EntitlementView => {
  const v = entitlement.value
  switch (entitlement.kind) {
    case 'boolean':
      return { kind: 'boolean', enabled: v.bool === true }
    case 'string':
      return { kind: 'string', text: v.text || '' }
    case 'number':
      return { kind: 'number', value: v.number === undefined ? 0 : Number(v.number) }
    case 'allocation':
      return { kind: 'allocation', min: parseCapacity(v.min), included: parseCapacity(v.included), max: parseCapacity(v.max) }
    case 'consumable':
      return {
        kind: 'consumable',
        min: parseCapacity(v.min),
        included: parseCapacity(v.included),
        max: parseCapacity(v.max),
        reset: v.resetPeriod ? { period: v.resetPeriod, count: v.resetPeriodCount || 1, anchor: v.resetAnchor } : undefined,
        rollover: v.rolloverEnabled === undefined ? undefined : { enabled: v.rolloverEnabled, maxCarry: parseCapacity(v.rolloverMaxCarry) },
      }
  }
}

/** True when the entitlement grants something (a checkmark, a text, a number, or a non-zero capacity). */
export const isGranted = (view: EntitlementView): boolean => {
  switch (view.kind) {
    case 'boolean':
      return view.enabled
    case 'string':
      return view.text !== ''
    case 'number':
      return view.value !== 0
    default: {
      const q = view.included || view.max
      return Boolean(q && (q.infinite || (q.value || 0) > 0))
    }
  }
}

export const findEntitlement = (plan: Plan, featureCode: string): PlanEntitlement | undefined =>
  plan.entitlements.find((e) => e.featureCode === featureCode)

export const findFeatureRate = (rate: PlanRate | undefined, featureCode: string): PlanFeatureRate | undefined =>
  rate?.featureRates.find((f) => f.featureCode === featureCode)

/* ------------------------------------------------------------------ */
/* Billing periods and prices                                            */
/* ------------------------------------------------------------------ */

/** `"month"`, `"year"`, or `"<count>-<cadence>"` for anything else (`"3-month"`, `"2-week"`). */
export type PeriodKey = string

const MONTHS_PER: Record<Cadence, number> = { day: 1 / 30, week: 12 / 52, month: 1, year: 12 }

export const periodKey = (rate: Pick<PlanRate, 'billingPeriod' | 'billingPeriodCount'>): PeriodKey => {
  const count = rate.billingPeriodCount || 1
  if (count === 1) return rate.billingPeriod
  if (rate.billingPeriod === 'month' && count === 12) return 'year'
  return `${count}-${rate.billingPeriod}`
}

/** Length of a billing period in months (a year is 12, a week is 12/52). */
export const monthsIn = (rate: Pick<PlanRate, 'billingPeriod' | 'billingPeriodCount'>): number =>
  MONTHS_PER[rate.billingPeriod] * (rate.billingPeriodCount || 1)

export const rateAmount = (rate: PlanRate): number => microsToAmount(rate.amountMicros)

/** What the rate costs per month, for comparing a yearly rate against a monthly one. */
export const monthlyEquivalent = (rate: PlanRate): number => rateAmount(rate) / monthsIn(rate)

export const isContactPlan = (plan: Plan): boolean => plan.rates.length === 0

/** Currencies offered by any of the plans, alphabetically. */
export const currenciesOf = (plans: Plan[]): string[] =>
  [...new Set(plans.flatMap((p) => p.rates.map((r) => r.currency)))].sort()

/** Billing periods offered by any of the plans, shortest first. */
export const periodKeysOf = (plans: Plan[]): PeriodKey[] => {
  const seen = new Map<PeriodKey, number>()
  for (const plan of plans) for (const rate of plan.rates) seen.set(periodKey(rate), monthsIn(rate))
  return [...seen.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map(([key]) => key)
}

/** The rate for a currency and period; the cheapest one when a plan lists several. */
export const findRate = (plan: Plan, currency: string, period: PeriodKey): PlanRate | undefined =>
  plan.rates
    .filter((r) => r.currency === currency && periodKey(r) === period)
    .sort((a, b) => rateAmount(a) - rateAmount(b) || a.code.localeCompare(b.code))[0]

/** Percentage saved per month when choosing `to` (default yearly) over `from` (default monthly). */
export const savingsPercent = (plan: Plan, currency: string, from: PeriodKey = 'month', to: PeriodKey = 'year'): number | undefined => {
  const a = findRate(plan, currency, from)
  const b = findRate(plan, currency, to)
  if (!a || !b) return undefined
  return percentOff(monthlyEquivalent(a), monthlyEquivalent(b))
}

/** Cheapest monthly-equivalent price of a plan in a currency, across all its periods. */
export const lowestMonthly = (plan: Plan, currency?: string): number | undefined => {
  const rates = plan.rates.filter((r) => !currency || r.currency === currency)
  if (rates.length === 0) return undefined
  return Math.min(...rates.map(monthlyEquivalent))
}

/* ------------------------------------------------------------------ */
/* Plan ordering                                                         */
/* ------------------------------------------------------------------ */

export const isFeatured = (plan: Plan): boolean => metaBool(plan.metadata, META.featured)

/**
 * Keeps plans that belong to `family` by metadata; plans without a family key are kept, so
 * the filter is a no-op until Subneo tags them (or narrows the API response itself).
 */
export const filterByFamily = (plans: Plan[], family: string): Plan[] =>
  plans.filter((p) => {
    const tagged = metaString(p.metadata, META.family)
    return !tagged || tagged === family
  })

/**
 * Display order: metadata `rank` ascending, then cheapest monthly price, then code.
 * Plans without rates (contact plans) go last. Stable and pure.
 */
export const sortPlans = (plans: Plan[], currency?: string): Plan[] =>
  [...plans].sort((a, b) => {
    const contact = Number(isContactPlan(a)) - Number(isContactPlan(b))
    if (contact !== 0) return contact
    const ra = metaNumber(a.metadata, META.rank)
    const rb = metaNumber(b.metadata, META.rank)
    if (ra !== undefined || rb !== undefined) {
      if (ra === undefined) return 1
      if (rb === undefined) return -1
      if (ra !== rb) return ra - rb
    }
    const pa = lowestMonthly(a, currency) ?? Number.POSITIVE_INFINITY
    const pb = lowestMonthly(b, currency) ?? Number.POSITIVE_INFINITY
    if (pa !== pb) return pa - pb
    return a.code.localeCompare(b.code)
  })

/* ------------------------------------------------------------------ */
/* Comparison matrix                                                     */
/* ------------------------------------------------------------------ */

export interface ComparisonFeature {
  code: string
  name: string
  description?: string
  kind: EntitlementKind
  /** The entitlement per plan code; absent when the plan does not carry the feature. */
  byPlan: Record<string, PlanEntitlement | undefined>
}

export interface ComparisonGroup {
  code: string
  name: string
  features: ComparisonFeature[]
}

/**
 * Lines every entitlement of the given plans up by feature group. Groups follow their first
 * appearance walking plans in the given order and entitlements by position; features inside a
 * group sort by their lowest position, then code. Name, description and kind come from the
 * first plan that carries the feature.
 */
export const buildComparison = (plans: Plan[]): ComparisonGroup[] => {
  const groups = new Map<string, ComparisonGroup & { order: Map<string, number> }>()
  for (const plan of plans) {
    for (const e of [...plan.entitlements].sort((a, b) => a.position - b.position)) {
      let group = groups.get(e.group.code)
      if (!group) {
        group = { code: e.group.code, name: e.group.name, features: [], order: new Map() }
        groups.set(e.group.code, group)
      }
      let feature = group.features.find((f) => f.code === e.featureCode)
      if (!feature) {
        feature = { code: e.featureCode, name: e.name, description: e.description, kind: e.kind, byPlan: {} }
        group.features.push(feature)
      }
      feature.byPlan[plan.code] = e
      group.order.set(e.featureCode, Math.min(group.order.get(e.featureCode) ?? Number.POSITIVE_INFINITY, e.position))
    }
  }
  return [...groups.values()].map(({ order, ...group }) => ({
    ...group,
    features: [...group.features].sort(
      (a, b) => (order.get(a.code) ?? 0) - (order.get(b.code) ?? 0) || a.code.localeCompare(b.code),
    ),
  }))
}
