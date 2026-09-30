import {
  INFINITE,
  amountToMicros,
  metaBool,
  metaString,
  microsToAmount,
  type Capacity,
  type EntitlementKind,
  type EntitlementValue,
  type Plan,
  type PlanEntitlement,
  type PlanFeatureRate,
  type PlanRate,
} from '@subneo/sdk'

/**
 * Plans maintained by hand in the settings global while the Subneo catalogue is not live. The
 * editor keeps a flat, single-currency (EUR) shape; `manualToPlans` turns it into exactly what
 * `GET /v1/plans` returns, so the view model and the page cannot tell the sources apart.
 */

export interface ManualGroup {
  code: string
  name: string
}

export interface ManualFeature {
  code: string
  name: string
  description?: string | null
  kind: EntitlementKind
  /** Code of a `ManualGroup`. */
  group: string
}

export interface ManualFeatureRate {
  featureCode: string
  /** Euros per unit, or per package when `packageSize` is set. */
  price: number
  packageSize?: number | null
}

export interface ManualEntitlement {
  featureCode: string
  /** Text form of the value, see `parseManualValue`. */
  value: string
}

export interface ManualPlan {
  code: string
  name: string
  /** Family code; plans are ranked by their order within the family. */
  family: string
  featured?: boolean | null
  badge?: string | null
  tagline?: string | null
  /** Euros per month on the monthly rate. Both prices empty: price on request. */
  monthlyPrice?: number | null
  /** Euros for the whole year on the yearly rate. */
  yearlyPrice?: number | null
  featureRates?: ManualFeatureRate[] | null
  entitlements?: ManualEntitlement[] | null
}

export interface ManualCatalogue {
  manualGroups?: ManualGroup[] | null
  manualFeatures?: ManualFeature[] | null
  manualPlans?: ManualPlan[] | null
}

export const MANUAL_CURRENCY = 'EUR'
export const MANUAL_RATE_CODES = { month: 'monthly_eur', year: 'yearly_eur' } as const

/* ------------------------------------------------------------------ */
/* Values                                                               */
/* ------------------------------------------------------------------ */

const YES = ['ja', 'yes', 'true', 'x', '✓', '1']
const NO = ['nein', 'no', 'false', '-', '–', '—', '0']
const UNLIMITED = ['unbegrenzt', 'unlimited', '∞', 'infinite']

export type ParseResult = { ok: true; value: EntitlementValue } | { ok: false; error: string }

const capacity = (raw: string): Capacity | undefined => {
  const s = raw.trim().toLowerCase().replace(/[.\s]/g, '')
  if (UNLIMITED.includes(s)) return INFINITE
  return /^\d+$/.test(s) ? String(Number(s)) : undefined
}

/**
 * Reads the text an editor typed for one entitlement:
 * - on/off: `ja` or `nein`
 * - amount: `3` (3 included, more can be added) or `10/10` (included / maximum); `unbegrenzt`
 * - monthly allowance: `500` or `unbegrenzt`, reset each calendar month
 * - number: `50`
 * - text: shown as typed
 */
export const parseManualValue = (kind: EntitlementKind, raw: string | null | undefined): ParseResult => {
  const text = (raw ?? '').trim()
  if (!text) return { ok: false, error: 'empty' }
  switch (kind) {
    case 'boolean': {
      const s = text.toLowerCase()
      if (YES.includes(s)) return { ok: true, value: { bool: true } }
      if (NO.includes(s)) return { ok: true, value: { bool: false } }
      return { ok: false, error: 'ja / nein' }
    }
    case 'allocation': {
      const [includedRaw, maxRaw, ...rest] = text.split('/')
      const included = capacity(includedRaw)
      const max = maxRaw === undefined ? INFINITE : capacity(maxRaw)
      if (!included || !max || rest.length) return { ok: false, error: '3, 10/10 oder unbegrenzt' }
      return { ok: true, value: { min: '0', included, max } }
    }
    case 'consumable': {
      const included = capacity(text)
      if (!included) return { ok: false, error: '500 oder unbegrenzt' }
      return {
        ok: true,
        value: { min: '0', included, max: INFINITE, resetPeriod: 'month', resetPeriodCount: 1, resetAnchor: 'calendar_aligned', rolloverEnabled: false },
      }
    }
    case 'number': {
      const n = text.replace(/[.\s]/g, '')
      return /^-?\d+$/.test(n) ? { ok: true, value: { number: String(Number(n)) } } : { ok: false, error: 'eine ganze Zahl' }
    }
    case 'string':
      return { ok: true, value: { text } }
  }
}

const capacityText = (c: Capacity | undefined): string => (c === INFINITE ? 'unbegrenzt' : c || '0')

/** The inverse of `parseManualValue`, used to copy existing plans into the manual fields. */
export const formatManualValue = (kind: EntitlementKind, value: EntitlementValue): string => {
  switch (kind) {
    case 'boolean':
      return value.bool ? 'ja' : 'nein'
    case 'allocation':
      return value.max === undefined || value.max === INFINITE ? capacityText(value.included) : `${capacityText(value.included)}/${capacityText(value.max)}`
    case 'consumable':
      return capacityText(value.included)
    case 'number':
      return value.number || '0'
    case 'string':
      return value.text || ''
  }
}

/* ------------------------------------------------------------------ */
/* Manual → wire                                                        */
/* ------------------------------------------------------------------ */

const VERSION = { number: 1, effectiveFrom: '2026-01-01T00:00:00.000Z', metadata: {} }

const toFeatureRate = (r: ManualFeatureRate): PlanFeatureRate => ({
  featureCode: r.featureCode,
  pricingModel: 'flat',
  amountMicros: amountToMicros(Number(r.price) || 0),
  ...(r.packageSize && r.packageSize > 1 ? { packageSize: r.packageSize, packageRounding: 'up' as const } : {}),
})

const toRates = (plan: ManualPlan): PlanRate[] => {
  const featureRates = (plan.featureRates || []).filter((r) => r.featureCode).map(toFeatureRate)
  const rates: PlanRate[] = []
  if (typeof plan.monthlyPrice === 'number') {
    rates.push({
      code: MANUAL_RATE_CODES.month,
      currency: MANUAL_CURRENCY,
      amountMicros: amountToMicros(plan.monthlyPrice),
      billingPeriod: 'month',
      billingPeriodCount: 1,
      trialRequiresPaymentMethod: false,
      noticePeriod: 'month',
      noticePeriodCount: 1,
      autoRenew: true,
      featureRates,
    })
  }
  if (typeof plan.yearlyPrice === 'number') {
    rates.push({
      code: MANUAL_RATE_CODES.year,
      currency: MANUAL_CURRENCY,
      amountMicros: amountToMicros(plan.yearlyPrice),
      billingPeriod: 'year',
      billingPeriodCount: 1,
      trialRequiresPaymentMethod: false,
      commitmentPeriod: 'year',
      commitmentPeriodCount: 1,
      noticePeriod: 'month',
      noticePeriodCount: 3,
      autoRenew: true,
      featureRates,
    })
  }
  return rates
}

/**
 * Plans by family code. Entitlements keep the plan's own order, as in Subneo; an entitlement whose
 * feature is unknown or whose value does not parse is left out (the admin refuses to save those,
 * so this only guards against data saved before a feature was renamed).
 */
export const manualToPlans = (catalogue: ManualCatalogue): Record<string, Plan[]> => {
  const groups = new Map((catalogue.manualGroups || []).map((g) => [g.code, g]))
  const byCode = new Map((catalogue.manualFeatures || []).map((f) => [f.code, f]))
  const rankInFamily: Record<string, number> = {}
  const out: Record<string, Plan[]> = {}

  for (const plan of catalogue.manualPlans || []) {
    if (!plan.code || !plan.family) continue
    const rank = (rankInFamily[plan.family] = (rankInFamily[plan.family] || 0) + 1)

    const entitlements: PlanEntitlement[] = []
    for (const e of plan.entitlements || []) {
      const feature = byCode.get(e.featureCode)
      if (!feature) continue
      const parsed = parseManualValue(feature.kind, e.value)
      if (!parsed.ok) continue
      const group = groups.get(feature.group)
      entitlements.push({
        featureCode: feature.code,
        name: feature.name,
        ...(feature.description ? { description: feature.description } : {}),
        kind: feature.kind,
        group: { code: feature.group, name: group?.name || feature.group },
        value: parsed.value,
        position: entitlements.length,
      })
    }

    const metadata: Record<string, string> = { family: plan.family, rank: String(rank) }
    if (plan.featured) metadata.featured = 'true'
    if (plan.badge) metadata.badge = plan.badge
    if (plan.tagline) metadata.tagline = plan.tagline

    ;(out[plan.family] ||= []).push({ code: plan.code, name: plan.name, metadata, version: VERSION, rates: toRates(plan), entitlements })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Wire → manual                                                        */
/* ------------------------------------------------------------------ */

/**
 * Copies plans in the wire shape into the manual fields, e.g. the example data when an editor
 * starts maintaining prices by hand. Only EUR monthly and yearly rates carry over; features and
 * groups are collected in the order they first appear.
 */
export const plansToManual = (plansByFamily: Record<string, Plan[]>): { manualGroups: ManualGroup[]; manualFeatures: ManualFeature[]; manualPlans: ManualPlan[] } => {
  const groups = new Map<string, ManualGroup>()
  const features = new Map<string, ManualFeature>()
  const plans: ManualPlan[] = []

  for (const [family, list] of Object.entries(plansByFamily)) {
    const ranked = [...list].sort((a, b) => Number(metaString(a.metadata, 'rank') ?? 0) - Number(metaString(b.metadata, 'rank') ?? 0))
    for (const plan of ranked) {
      for (const e of [...plan.entitlements].sort((a, b) => a.position - b.position)) {
        if (!groups.has(e.group.code)) groups.set(e.group.code, { code: e.group.code, name: e.group.name })
        if (!features.has(e.featureCode)) {
          features.set(e.featureCode, { code: e.featureCode, name: e.name, description: e.description || null, kind: e.kind, group: e.group.code })
        }
      }
      const monthly = plan.rates.find((r) => r.currency === MANUAL_CURRENCY && r.billingPeriod === 'month' && r.billingPeriodCount === 1)
      const yearly = plan.rates.find((r) => r.currency === MANUAL_CURRENCY && r.billingPeriod === 'year' && r.billingPeriodCount === 1)
      plans.push({
        code: plan.code,
        name: plan.name,
        family,
        featured: metaBool(plan.metadata, 'featured'),
        badge: metaString(plan.metadata, 'badge') || null,
        tagline: metaString(plan.metadata, 'tagline') || null,
        monthlyPrice: monthly ? microsToAmount(monthly.amountMicros) : null,
        yearlyPrice: yearly ? microsToAmount(yearly.amountMicros) : null,
        featureRates: ((monthly || yearly)?.featureRates ?? [])
          .filter((r) => r.pricingModel === 'flat')
          .map((r) => ({ featureCode: r.featureCode, price: microsToAmount(r.amountMicros), packageSize: r.packageSize ?? null })),
        entitlements: [...plan.entitlements].sort((a, b) => a.position - b.position).map((e) => ({ featureCode: e.featureCode, value: formatManualValue(e.kind, e.value) })),
      })
    }
  }
  return { manualGroups: [...groups.values()], manualFeatures: [...features.values()], manualPlans: plans }
}

/* ------------------------------------------------------------------ */
/* Admin validation                                                     */
/* ------------------------------------------------------------------ */

/** Error text for one entitlement row, or `true`. Used by the global's field validation. */
export const validateManualEntitlement = (catalogue: ManualCatalogue | undefined, featureCode: string | undefined, value: string | undefined): true | string => {
  if (!featureCode) return true
  const feature = (catalogue?.manualFeatures || []).find((f) => f.code === featureCode)
  if (!feature) return `Unbekannter Feature-Code „${featureCode}“ / Unknown feature code`
  const parsed = parseManualValue(feature.kind, value)
  return parsed.ok ? true : `Erwartet / Expected: ${parsed.error}`
}
