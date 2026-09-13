import { describe, expect, it } from 'vitest'

import type { Plan } from '@subneo/sdk'
import { buildPricingModel, fillTemplate, type SubneoPricingSettings } from '@subneo/payload-pricing'

import { pick } from '@/endpoints/seed/content'
import { pricingSettings } from '@/endpoints/seed/pricing'
import { pricingFixtures } from '@/pricing/fixture'

const settings = pricingSettings(pick('de')) as SubneoPricingSettings

const build = (overrides: Partial<SubneoPricingSettings> = {}, plans: Record<string, Plan[] | undefined> = pricingFixtures) =>
  buildPricingModel({ settings: { ...settings, ...overrides }, plansByFamily: plans, source: 'fixture' })

describe('buildPricingModel', () => {
  it('orders families and plans, marks the featured plan and the contact plan', () => {
    const model = build()
    expect(model.status).toBe('ok')
    expect(model.currencies).toEqual(['EUR'])
    expect(model.periods).toEqual(['month', 'year'])
    expect(model.families.map((f) => f.code)).toEqual(['indicate-app', 'indicate-agent'])
    const app = model.families[0]
    expect(app.plans.map((p) => p.code)).toEqual(['core', 'pro', 'enterprise'])
    expect(app.plans[1].featured).toBe(true)
    expect(app.plans[1].badge).toBe('Beliebt')
    expect(app.plans[2].contact).toBe(true)
    expect(app.plans[2].cta.href).toBe('/contact')
  })

  it('computes prices per currency and period with savings and overages', () => {
    const core = build().families[0].plans[0]
    expect(core.prices.EUR.month.amount).toBe(100)
    expect(core.prices.EUR.year.amount).toBe(1080)
    expect(core.prices.EUR.year.perMonth).toBe(90)
    expect(core.prices.EUR.year.savingsPercent).toBe(10)
    expect(core.prices.EUR.month.savingsPercent).toBeUndefined()
    expect(core.prices.EUR.month.href).toBe('https://app.indicate-data.com/signup?plan=core&rate=monthly_eur')
    expect(core.prices.EUR.month.overages.map((o) => o.featureCode)).toEqual(['pipelines', 'agent_tokens', 'resi_credits'])
    expect(core.prices.EUR.month.overages[2]).toMatchObject({ amount: 5, packageSize: 100, label: 'Resi-Credits' })
  })

  it('lists the configured highlights with translated labels', () => {
    const pro = build().families[0].plans[1]
    expect(pro.highlights.map((h) => h.featureCode)).toEqual(['pipelines', 'dashboards', 'resi_credits', 'agent_tokens', 'sub_daily_sync', 'flying_kpis_ai_summary', 'data_sharing'])
    expect(pro.highlights[0]).toMatchObject({ label: 'Datenquellen', granted: true, value: { kind: 'allocation', included: { value: 10 } } })
    expect(pro.highlights[2].value).toMatchObject({ kind: 'consumable', included: { value: 500 }, reset: { period: 'month', count: 1 } })
  })

  it('falls back to the first five entitlements when nothing is highlighted', () => {
    const families = settings.families!.map((f) => ({ ...f, highlightFeatures: [] }))
    const core = build({ families }).families[0].plans[0]
    expect(core.highlights).toHaveLength(5)
    expect(core.highlights[0].featureCode).toBe('pipelines')
  })

  it('builds the comparison with group order, labels and hidden features removed', () => {
    const model = build({
      featureOverrides: [...settings.featureOverrides!, { featureCode: 'sla', hidden: true }],
      groupOverrides: [{ groupCode: 'support', label: 'Hilfe', order: 0 }],
    })
    const comparison = model.families[0].comparison!
    expect(comparison.plans.map((p) => p.code)).toEqual(['core', 'pro', 'enterprise'])
    expect(comparison.groups[0]).toMatchObject({ code: 'support', label: 'Hilfe' })
    expect(comparison.groups[0].rows.map((r) => r.featureCode)).toEqual(['support_channel', 'onboarding'])
    expect(comparison.groups.map((g) => g.code)).toEqual(['support', 'data', 'analytics', 'resi', 'team'])
    const pipelines = comparison.groups[1].rows[0]
    expect(pipelines.label).toBe('Datenquellen')
    expect(pipelines.cells.core).toMatchObject({ kind: 'allocation', included: { value: 3 } })
    expect(model.families[1].comparison).toBeUndefined()
  })

  it('hides plans, honours CMS featured over metadata and plan-level CTA overrides', () => {
    const model = build({
      families: settings.families!.map((f) => (f.role === 'app' ? { ...f, featuredPlanCode: 'core' } : f)),
      planOverrides: [
        { planCode: 'pro', hidden: true },
        { planCode: 'core', name: 'Basis', ctaLabel: 'Loslegen', ctaUrl: 'https://example.test/start?p={plan}' },
      ],
    })
    const app = model.families[0]
    expect(app.plans.map((p) => p.code)).toEqual(['core', 'enterprise'])
    expect(app.plans[0]).toMatchObject({ name: 'Basis', featured: true, cta: { label: 'Loslegen' } })
    expect(app.plans[0].prices.EUR.month.href).toBe('https://example.test/start?p=core')
  })

  it('reports partial and unavailable states without inventing data', () => {
    expect(build({}, { 'indicate-app': pricingFixtures['indicate-app'], 'indicate-agent': undefined }).status).toBe('partial')
    expect(build({}, { 'indicate-app': undefined, 'indicate-agent': undefined }).status).toBe('unavailable')
    expect(build({ families: [] }).status).toBe('unconfigured')
  })

  it("restricts to the block's families", () => {
    const model = buildPricingModel({ settings, plansByFamily: pricingFixtures, familyCodes: ['indicate-agent'], source: 'fixture' })
    expect(model.families.map((f) => f.code)).toEqual(['indicate-agent'])
    expect(model.periods).toEqual(['month'])
  })

  it('fills and encodes CTA templates', () => {
    expect(fillTemplate('https://x.test/?plan={plan}&rate={rate}&keep={other}', { plan: 'pro', rate: 'yearly eur' })).toBe(
      'https://x.test/?plan=pro&rate=yearly%20eur&keep={other}',
    )
  })
})
