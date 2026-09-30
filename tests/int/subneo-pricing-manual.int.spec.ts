import { describe, expect, it } from 'vitest'

import {
  buildPricingModel,
  manualToPlans,
  parseManualValue,
  plansToManual,
  validateManualEntitlement,
  type SubneoPricingSettings,
} from '@subneo/payload-pricing'

import { pick } from '@/endpoints/seed/content'
import { pricingSettings } from '@/endpoints/seed/pricing'
import { pricingFixtures } from '@/pricing/fixture'

const settings = pricingSettings(pick('de')) as SubneoPricingSettings

describe('parseManualValue', () => {
  it('reads on/off in German and English', () => {
    expect(parseManualValue('boolean', 'Ja')).toEqual({ ok: true, value: { bool: true } })
    expect(parseManualValue('boolean', 'no')).toEqual({ ok: true, value: { bool: false } })
    expect(parseManualValue('boolean', 'vielleicht').ok).toBe(false)
  })

  it('reads amounts with and without a maximum', () => {
    expect(parseManualValue('allocation', '3')).toEqual({ ok: true, value: { min: '0', included: '3', max: 'infinite' } })
    expect(parseManualValue('allocation', '10 / 10')).toEqual({ ok: true, value: { min: '0', included: '10', max: '10' } })
    expect(parseManualValue('allocation', 'unbegrenzt')).toEqual({ ok: true, value: { min: '0', included: 'infinite', max: 'infinite' } })
    expect(parseManualValue('allocation', '1.000')).toMatchObject({ ok: true, value: { included: '1000' } })
    expect(parseManualValue('allocation', 'viele').ok).toBe(false)
  })

  it('makes a monthly allowance reset each calendar month', () => {
    expect(parseManualValue('consumable', '500')).toMatchObject({
      ok: true,
      value: { included: '500', resetPeriod: 'month', resetPeriodCount: 1, resetAnchor: 'calendar_aligned' },
    })
  })

  it('keeps text as typed and refuses empty values', () => {
    expect(parseManualValue('string', ' Priority e-mail ')).toEqual({ ok: true, value: { text: 'Priority e-mail' } })
    expect(parseManualValue('number', '')).toEqual({ ok: false, error: 'empty' })
  })
})

describe('manual plans', () => {
  const manual = plansToManual(pricingFixtures)

  it('copies the example data into the manual fields', () => {
    expect(manual.manualGroups.map((g) => g.code)).toEqual(['data', 'analytics', 'resi', 'team', 'support'])
    expect(manual.manualFeatures).toHaveLength(29)
    const [core, pro, enterprise] = manual.manualPlans
    expect(core).toMatchObject({ code: 'core', family: 'indicate-app', monthlyPrice: 100, yearlyPrice: 1080, featured: false })
    expect(pro).toMatchObject({ featured: true, badge: 'Popular' })
    expect(enterprise).toMatchObject({ monthlyPrice: null, yearlyPrice: null, featureRates: [] })
    expect(core.featureRates).toContainEqual({ featureCode: 'resi_credits', price: 5, packageSize: 100 })
    expect(core.entitlements).toContainEqual({ featureCode: 'dashboards', value: '10/10' })
    expect(core.entitlements).toContainEqual({ featureCode: 'pipelines', value: '3' })
  })

  it('renders the same page as the example data it was copied from', () => {
    const plans = manualToPlans(manual)
    const fromFixture = buildPricingModel({ settings, plansByFamily: pricingFixtures, source: 'fixture' })
    const fromManual = buildPricingModel({ settings: { ...settings, ...manual }, plansByFamily: plans, source: 'fixture' })
    expect(fromManual).toEqual(fromFixture)
  })

  it('ranks plans by their order within the family and drops unknown features', () => {
    const plans = manualToPlans({
      manualGroups: [{ code: 'g', name: 'G' }],
      manualFeatures: [{ code: 'users', name: 'Users', kind: 'allocation', group: 'g' }],
      manualPlans: [
        { code: 'b', name: 'B', family: 'f', monthlyPrice: 10, entitlements: [{ featureCode: 'users', value: '5' }, { featureCode: 'gone', value: 'ja' }] },
        { code: 'a', name: 'A', family: 'f' },
      ],
    })
    expect(plans.f.map((p) => [p.code, p.metadata.rank])).toEqual([['b', '1'], ['a', '2']])
    expect(plans.f[0].entitlements.map((e) => e.featureCode)).toEqual(['users'])
    expect(plans.f[0].rates.map((r) => r.code)).toEqual(['monthly_eur'])
    expect(plans.f[1].rates).toEqual([])
  })

  it('names the problem when an editor saves a bad value', () => {
    expect(validateManualEntitlement(manual, 'dashboards', '10/10')).toBe(true)
    expect(validateManualEntitlement(manual, 'dashboards', 'viele')).toMatch(/10\/10/)
    expect(validateManualEntitlement(manual, 'nope', 'ja')).toMatch(/nope/)
  })
})
