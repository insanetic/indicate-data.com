/**
 * Turns Subneo plans plus the CMS settings into the view model the page renders. Pure: no I/O,
 * deterministic order, so it is unit-testable and the same on every render.
 */
import {
  META,
  buildComparison,
  entitlementView,
  filterByFamily,
  findRate,
  isContactPlan,
  isFeatured,
  isGranted,
  metaString,
  microsToAmount,
  monthlyEquivalent,
  monthsIn,
  periodKey,
  periodKeysOf,
  rateAmount,
  savingsPercent,
  sortPlans,
  currenciesOf,
  type Plan,
  type PlanEntitlement,
  type PlanRate,
} from '@subneo/sdk'

import type {
  ComparisonModel,
  FamilyModel,
  FamilySetting,
  HighlightModel,
  OverageModel,
  PlanModel,
  PriceView,
  PricingModel,
  PricingSource,
  SubneoPricingSettings,
} from './types'

export interface BuildPricingModelArgs {
  settings: SubneoPricingSettings
  /** Fetched (or fixture) plans by family code. A missing key means the fetch failed. */
  plansByFamily: Record<string, Plan[] | undefined>
  /** Restrict to these family codes, in the settings' order. Empty: all configured. */
  familyCodes?: string[]
  source: PricingSource
}

const DEFAULT_HIGHLIGHTS = 5

/** Merges every override row for a feature code: any `hidden` hides, the first text wins. */
const featureOverride = (settings: SubneoPricingSettings, featureCode: string) => {
  const rows = (settings.featureOverrides || []).filter((o) => o.featureCode === featureCode)
  return {
    hidden: rows.some((o) => o.hidden),
    label: rows.map((o) => o.label?.trim()).find(Boolean),
    description: rows.map((o) => o.description?.trim()).find(Boolean),
  }
}

export const buildPricingModel = ({ settings, plansByFamily, familyCodes = [], source }: BuildPricingModelArgs): PricingModel => {
  const configured = (settings.families || []).filter((f) => f.code)
  const wanted = familyCodes.length > 0 ? configured.filter((f) => familyCodes.includes(f.code)) : configured

  const families = wanted.map((family) => buildFamily(family, plansByFamily[family.code], settings))
  const allPlans = families.flatMap((f) => f.plans)
  const currencies = [...new Set(allPlans.flatMap((p) => Object.keys(p.prices)))].sort()
  const periods = periodKeysOf(wanted.flatMap((f) => plansByFamily[f.code] || []))
  const failed = families.filter((f) => f.error).length

  const status: PricingModel['status'] =
    wanted.length === 0 ? 'unconfigured' : failed === 0 ? 'ok' : failed === families.length ? 'unavailable' : 'partial'

  return {
    status,
    source,
    currencies,
    defaultCurrency: currencies.includes('EUR') ? 'EUR' : currencies[0],
    periods,
    families,
  }
}

const buildFamily = (family: FamilySetting, fetched: Plan[] | undefined, settings: SubneoPricingSettings): FamilyModel => {
  const role = family.role || 'app'
  const hiddenPlans = new Set((settings.planOverrides || []).filter((o) => o.hidden).map((o) => o.planCode))
  const plans = sortPlans(filterByFamily(fetched || [], family.code)).filter((p) => !hiddenPlans.has(p.code))

  const featuredPlanCode = family.featuredPlanCode?.trim() || plans.find(isFeatured)?.code
  const highlightCodes = (family.highlightFeatures || []).map((h) => h.featureCode).filter(Boolean)

  const model: FamilyModel = {
    code: family.code,
    role,
    label: family.label || undefined,
    lead: family.lead || undefined,
    unit: family.unit || undefined,
    featuredPlanCode,
    error: fetched === undefined ? true : undefined,
    plans: plans.map((plan) => buildPlan(plan, { featured: plan.code === featuredPlanCode, highlightCodes, settings })),
  }
  if (role === 'app' && family.showInComparison !== false && plans.length > 0) {
    model.comparison = buildComparisonModel(plans, settings)
  }
  return model
}

interface PlanContext {
  featured: boolean
  highlightCodes: string[]
  settings: SubneoPricingSettings
}

const buildPlan = (plan: Plan, { featured, highlightCodes, settings }: PlanContext): PlanModel => {
  const override = (settings.planOverrides || []).find((o) => o.planCode === plan.code)
  const contact = isContactPlan(plan)
  const ctaUrl = override?.ctaUrl?.trim() || metaString(plan.metadata, META.ctaUrl)
  const ctaLabel = override?.ctaLabel?.trim() || metaString(plan.metadata, META.ctaLabel)

  const prices: PlanModel['prices'] = {}
  for (const currency of currenciesOf([plan])) {
    prices[currency] = {}
    for (const period of periodKeysOf([plan])) {
      const rate = findRate(plan, currency, period)
      if (rate) prices[currency][period] = buildPrice(plan, rate, { settings, ctaUrl })
    }
  }

  return {
    code: plan.code,
    name: override?.name?.trim() || plan.name,
    tagline: override?.tagline?.trim() || metaString(plan.metadata, META.tagline),
    badge: override?.badge?.trim() || metaString(plan.metadata, META.badge),
    featured,
    contact,
    prices,
    highlights: buildHighlights(plan, highlightCodes, settings),
    cta: {
      label: ctaLabel,
      href: contact ? ctaUrl || settings.contactUrl?.trim() || undefined : ctaUrl,
    },
  }
}

const buildPrice = (plan: Plan, rate: PlanRate, { settings, ctaUrl }: { settings: SubneoPricingSettings; ctaUrl?: string }): PriceView => {
  const amount = rateAmount(rate)
  const listAmount = rate.msrpAmountMicros ? microsToAmount(rate.msrpAmountMicros) : undefined
  const period = periodKey(rate)
  const savings = period === 'month' ? undefined : savingsPercent(plan, rate.currency, 'month', period)
  const template = ctaUrl || settings.defaultCtaUrl?.trim()
  return {
    rateCode: rate.code,
    currency: rate.currency,
    period,
    amount,
    perMonth: monthlyEquivalent(rate),
    months: monthsIn(rate),
    listAmount: listAmount !== undefined && listAmount > amount ? listAmount : undefined,
    savingsPercent: savings && savings > 0 ? savings : undefined,
    trial: rate.trialPeriod ? { period: rate.trialPeriod, count: rate.trialPeriodCount || 1, requiresPaymentMethod: rate.trialRequiresPaymentMethod } : undefined,
    notice: rate.noticePeriod ? { period: rate.noticePeriod, count: rate.noticePeriodCount || 1 } : undefined,
    commitment: rate.commitmentPeriod ? { period: rate.commitmentPeriod, count: rate.commitmentPeriodCount || 1 } : undefined,
    overages: rate.featureRates.map((f) => buildOverage(plan, rate, f.featureCode, settings)).filter((o): o is OverageModel => Boolean(o)),
    href: template ? fillTemplate(template, { plan: plan.code, rate: rate.code }) : undefined,
  }
}

const buildOverage = (plan: Plan, rate: PlanRate, featureCode: string, settings: SubneoPricingSettings): OverageModel | undefined => {
  const featureRate = rate.featureRates.find((f) => f.featureCode === featureCode)
  if (!featureRate) return undefined
  const entitlement = plan.entitlements.find((e) => e.featureCode === featureCode)
  const override = featureOverride(settings, featureCode)
  if (override.hidden) return undefined
  return {
    featureCode,
    label: override.label || entitlement?.name || featureCode,
    pricingModel: featureRate.pricingModel,
    currency: rate.currency,
    amount: featureRate.amountMicros ? microsToAmount(featureRate.amountMicros) : undefined,
    packageSize: featureRate.packageSize,
    tiers: featureRate.tiers?.map((t) => ({
      upTo: t.upToUnits ? Number(t.upToUnits) : undefined,
      unitAmount: microsToAmount(t.unitAmountMicros),
      flatAmount: microsToAmount(t.flatAmountMicros),
    })),
  }
}

const buildHighlights = (plan: Plan, highlightCodes: string[], settings: SubneoPricingSettings): HighlightModel[] => {
  const hidden = new Set(plan.entitlements.map((e) => e.featureCode).filter((code) => featureOverride(settings, code).hidden))
  const byPosition = [...plan.entitlements].sort((a, b) => a.position - b.position)
  const chosen: { code: string; entitlement?: PlanEntitlement }[] =
    highlightCodes.length > 0
      ? highlightCodes.map((code) => ({ code, entitlement: plan.entitlements.find((e) => e.featureCode === code) }))
      : byPosition.filter((e) => !hidden.has(e.featureCode)).slice(0, DEFAULT_HIGHLIGHTS).map((e) => ({ code: e.featureCode, entitlement: e }))

  return chosen
    .filter(({ code }) => !hidden.has(code) && !featureOverride(settings, code).hidden)
    .map(({ code, entitlement }) => {
      const override = featureOverride(settings, code)
      const value = entitlement ? entitlementView(entitlement) : undefined
      return {
        featureCode: code,
        label: override.label || entitlement?.name || code,
        description: override.description || entitlement?.description || undefined,
        value,
        granted: value ? isGranted(value) : false,
      }
    })
}

const buildComparisonModel = (plans: Plan[], settings: SubneoPricingSettings): ComparisonModel => {
  const groupOverrides = settings.groupOverrides || []
  const groups = buildComparison(plans)
    .map((group, index) => {
      const override = groupOverrides.find((o) => o.groupCode === group.code)
      return {
        code: group.code,
        label: override?.label?.trim() || group.name,
        order: override?.order ?? undefined,
        index,
        rows: group.features
          .filter((f) => !featureOverride(settings, f.code).hidden)
          .map((f) => {
            const fo = featureOverride(settings, f.code)
            const cells: Record<string, ReturnType<typeof entitlementView> | undefined> = {}
            for (const plan of plans) {
              const e = f.byPlan[plan.code]
              cells[plan.code] = e ? entitlementView(e) : undefined
            }
            return {
              featureCode: f.code,
              label: fo.label || f.name,
              description: fo.description || f.description || undefined,
              kind: f.kind,
              cells,
            }
          }),
      }
    })
    .filter((g) => g.rows.length > 0)
    .sort((a, b) => {
      if (a.order !== undefined || b.order !== undefined) {
        if (a.order === undefined) return 1
        if (b.order === undefined) return -1
        if (a.order !== b.order) return a.order - b.order
      }
      return a.index - b.index
    })
    .map(({ order: _order, index: _index, ...group }) => group)

  return { plans: plans.map((p) => ({ code: p.code, name: p.name })), groups }
}

export const fillTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? encodeURIComponent(values[key]) : match))
