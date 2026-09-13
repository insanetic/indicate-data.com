import type { Cadence, EntitlementKind, EntitlementView, PeriodKey, Plan, PriceModel, Quantity } from '@subneo/sdk'

/* ------------------------------------------------------------------ */
/* Plugin options                                                        */
/* ------------------------------------------------------------------ */

export interface SubneoPricingPluginOptions {
  /** Set to `false` to leave the config untouched (keeps the schema, disables nothing else). */
  enabled?: boolean
  /** Slug of the settings global; default `subneo-pricing`. */
  globalSlug?: string
  /** Admin sidebar group of the global; default "Subneo". */
  adminGroup?: string | Record<string, string>
  /** Example plans by family code, served when the global's source is "Example data". */
  fixtures?: Record<string, Plan[]>
  /** Cache tag for the fetched plans; default `subneo-pricing`. */
  cacheTag?: string
  /** Environment variable names used when the global leaves a value empty. */
  env?: {
    /** Default `SUBNEO_API_KEY`. */
    apiKey?: string
    /** Default `SUBNEO_API_URL`. */
    baseUrl?: string
    /** Default `SUBNEO_REFRESH_SECRET`; bearer token accepted by the refresh endpoint. */
    refreshSecret?: string
  }
}

export interface ResolvedPluginOptions {
  globalSlug: string
  adminGroup: string | Record<string, string>
  fixtures: Record<string, Plan[]>
  cacheTag: string
  env: { apiKey: string; baseUrl: string; refreshSecret: string }
}

export const DEFAULT_GLOBAL_SLUG = 'subneo-pricing'
export const DEFAULT_CACHE_TAG = 'subneo-pricing'

export const resolveOptions = (options: SubneoPricingPluginOptions = {}): ResolvedPluginOptions => ({
  globalSlug: options.globalSlug || DEFAULT_GLOBAL_SLUG,
  adminGroup: options.adminGroup || 'Subneo',
  fixtures: options.fixtures || {},
  cacheTag: options.cacheTag || DEFAULT_CACHE_TAG,
  env: {
    apiKey: options.env?.apiKey || 'SUBNEO_API_KEY',
    baseUrl: options.env?.baseUrl || 'SUBNEO_API_URL',
    refreshSecret: options.env?.refreshSecret || 'SUBNEO_REFRESH_SECRET',
  },
})

/* ------------------------------------------------------------------ */
/* Settings (the global, as read for one locale)                        */
/* ------------------------------------------------------------------ */

export type PricingSource = 'subneo' | 'fixture'

export type FamilyRole = 'app' | 'addon'

export interface FamilySetting {
  code: string
  role?: FamilyRole | null
  label?: string | null
  lead?: string | null
  /** Shown under the price, e.g. "per property and month". */
  unit?: string | null
  featuredPlanCode?: string | null
  /** Entitlements the plan cards list, in this order. Empty: first five by position. */
  highlightFeatures?: { featureCode: string }[] | null
  showInComparison?: boolean | null
}

export interface PlanOverride {
  planCode: string
  name?: string | null
  tagline?: string | null
  badge?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  hidden?: boolean | null
}

export interface FeatureOverride {
  featureCode: string
  label?: string | null
  description?: string | null
  hidden?: boolean | null
}

export interface GroupOverride {
  groupCode: string
  label?: string | null
  order?: number | null
}

export interface SubneoPricingSettings {
  source?: PricingSource | null
  baseUrl?: string | null
  apiKey?: string | null
  apiVersion?: string | null
  cacheSeconds?: number | null
  families?: FamilySetting[] | null
  planOverrides?: PlanOverride[] | null
  featureOverrides?: FeatureOverride[] | null
  groupOverrides?: GroupOverride[] | null
  /** Template for plan buttons; `{plan}` and `{rate}` are replaced with the codes. */
  defaultCtaUrl?: string | null
  /** Button target of plans without rates. */
  contactUrl?: string | null
}

/* ------------------------------------------------------------------ */
/* View model (locale-specific labels, locale-independent numbers)      */
/* ------------------------------------------------------------------ */

export type PricingStatus =
  /** Every family loaded. */
  | 'ok'
  /** At least one family failed; its plans are empty. */
  | 'partial'
  /** Nothing could be loaded. */
  | 'unavailable'
  /** No families configured (or no key in live mode). */
  | 'unconfigured'

export interface PricingModel {
  status: PricingStatus
  source: PricingSource
  /** ISO 4217 codes present in any plan, alphabetically. */
  currencies: string[]
  defaultCurrency: string | undefined
  /** Billing periods present in any plan, shortest first (`month`, `year`, …). */
  periods: PeriodKey[]
  families: FamilyModel[]
}

export interface FamilyModel {
  code: string
  role: FamilyRole
  label?: string
  lead?: string
  unit?: string
  featuredPlanCode?: string
  /** True when the fetch for this family failed. */
  error?: boolean
  plans: PlanModel[]
  comparison?: ComparisonModel
}

export interface PlanModel {
  code: string
  name: string
  tagline?: string
  badge?: string
  featured: boolean
  /** No rates: price on request. */
  contact: boolean
  /** By currency, then billing period. */
  prices: Record<string, Record<PeriodKey, PriceView>>
  highlights: HighlightModel[]
  cta: { label?: string; href?: string }
}

export interface PriceView {
  rateCode: string
  currency: string
  period: PeriodKey
  /** Whole charge for the period. */
  amount: number
  /** Per-month equivalent of `amount`. */
  perMonth: number
  months: number
  /** List price when the rate carries an MSRP above the amount. */
  listAmount?: number
  /** Percent saved per month against the plan's monthly rate in the same currency. */
  savingsPercent?: number
  trial?: { period: Cadence; count: number; requiresPaymentMethod: boolean }
  notice?: { period: Cadence; count: number }
  commitment?: { period: Cadence; count: number }
  overages: OverageModel[]
  /** Button target for this rate. */
  href?: string
}

export interface OverageModel {
  featureCode: string
  label: string
  pricingModel: PriceModel
  currency: string
  /** Flat model: price per unit or per package. */
  amount?: number
  packageSize?: number
  /** Graduated and volume models. */
  tiers?: { upTo?: number; unitAmount: number; flatAmount: number }[]
}

export interface HighlightModel {
  featureCode: string
  label: string
  description?: string
  /** Absent when the plan does not carry the feature. */
  value?: EntitlementView
  granted: boolean
}

export interface ComparisonModel {
  plans: { code: string; name: string }[]
  groups: ComparisonGroupModel[]
}

export interface ComparisonGroupModel {
  code: string
  label: string
  rows: ComparisonRowModel[]
}

export interface ComparisonRowModel {
  featureCode: string
  label: string
  description?: string
  kind: EntitlementKind
  cells: Record<string, EntitlementView | undefined>
}

export type { EntitlementView, Quantity }
