import { describe, expect, it } from 'vitest'

import {
  buildPricingModel,
  manualToPlans,
  parseManualValue,
  plansToManual,
  resolveManualValue,
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
    expect(core.entitlements).toContainEqual({ featureCode: 'resi_credits', value: '100 pro Monat' })
    expect(core.entitlements).toContainEqual({ featureCode: 'api_tokens', value: '0' })
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

  it('accepts any value and refuses only unknown feature codes', () => {
    expect(validateManualEntitlement(manual, 'dashboards', '10/10')).toBe(true)
    expect(validateManualEntitlement(manual, 'dashboards', 'bis zu 5')).toBe(true)
    expect(validateManualEntitlement(manual, 'nope', 'ja')).toMatch(/nope/)
    // partial admin form data: no feature list to check against
    expect(validateManualEntitlement({}, 'dashboards', '3')).toBe(true)
  })

  it('lets the typed value decide its type', () => {
    // new features carry the hidden default hint "boolean"
    expect(resolveManualValue('boolean', 'ja')).toEqual({ kind: 'boolean', value: { bool: true } })
    expect(resolveManualValue('boolean', '1')).toMatchObject({ kind: 'allocation', value: { included: '1', max: 'infinite' } })
    expect(resolveManualValue('boolean', '0')).toMatchObject({ kind: 'allocation', value: { included: '0', max: '0' } })
    expect(resolveManualValue('boolean', '10/10')).toMatchObject({ kind: 'allocation', value: { included: '10', max: '10' } })
    expect(resolveManualValue('boolean', '500 pro Monat')).toMatchObject({ kind: 'consumable', value: { included: '500', resetPeriod: 'month' } })
    expect(resolveManualValue(undefined, 'unbegrenzt')).toMatchObject({ kind: 'allocation', value: { included: 'infinite' } })
    expect(resolveManualValue('boolean', 'bis zu 5')).toEqual({ kind: 'string', value: { text: 'bis zu 5' } })
    // a stored hint wins when the value fits it (copied example data)
    expect(resolveManualValue('consumable', '100')).toMatchObject({ kind: 'consumable', value: { included: '100' } })
    expect(resolveManualValue('number', '50')).toEqual({ kind: 'number', value: { number: '50' } })
    expect(resolveManualValue('allocation', ' ')).toBeUndefined()
    expect(resolveManualValue('weird' as never, 'Priority')).toEqual({ kind: 'string', value: { text: 'Priority' } })
    const plans = manualToPlans({
      manualGroups: [{ code: 'g', name: 'G' }],
      manualFeatures: [{ code: 'users', name: 'Users', kind: 'allocation', group: 'g' }],
      manualPlans: [{ code: 'a', name: 'A', family: 'f', entitlements: [{ featureCode: 'users', value: '24/7 Support' }] }],
    })
    expect(plans.f[0].entitlements[0]).toMatchObject({ kind: 'string', value: { text: '24/7 Support' } })
  })
})
