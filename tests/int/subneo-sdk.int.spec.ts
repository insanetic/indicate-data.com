import { describe, expect, it, vi } from 'vitest'

import {
  SUBNEO_API_VERSION,
  buildComparison,
  createSubneoClient,
  entitlementView,
  filterByFamily,
  findRate,
  formatMoney,
  goldenPlan,
  goldenPlanList,
  isSubneoError,
  microsToAmount,
  monthlyEquivalent,
  parseCapacity,
  parsePlanList,
  percentOff,
  periodKey,
  periodKeysOf,
  savingsPercent,
  sortPlans,
  type Plan,
} from '@subneo/sdk'

import { appPlans } from '@/pricing/fixture'

describe('money', () => {
  it('converts micros strings exactly and formats per locale', () => {
    expect(microsToAmount('49000000')).toBe(49)
    expect(microsToAmount('1000')).toBe(0.001)
    expect(microsToAmount(undefined)).toBe(0)
    expect(() => microsToAmount('49.5')).toThrow(RangeError)
    // Intl separates the amount and the symbol with a non-breaking space.
    expect(formatMoney(100, 'EUR', 'de-DE')).toBe('100\u00a0€')
    expect(formatMoney(12.5, 'EUR', 'en')).toBe('€12.50')
    expect(percentOff(100, 90)).toBe(10)
    expect(percentOff(100, 120)).toBe(0)
  })
})

describe('golden plan (Go wire test)', () => {
  it('passes the shape check and reads as expected', () => {
    expect(parsePlanList(goldenPlanList)).toHaveLength(1)
    expect(() => parsePlanList({})).toThrow(/data/)
    expect(() => parsePlanList({ data: [{ code: 'x' }] })).toThrow(/missing/)

    const rate = goldenPlan.rates[0]
    expect(periodKey(rate)).toBe('month')
    expect(monthlyEquivalent(rate)).toBe(49)
    expect(rate.featureRates[1].packageSize).toBe(1000)

    expect(entitlementView(goldenPlan.entitlements[0])).toEqual({
      kind: 'allocation',
      min: { infinite: false, value: 0 },
      included: { infinite: false, value: 5 },
      max: { infinite: true },
    })
    expect(entitlementView(goldenPlan.entitlements[1])).toEqual({ kind: 'boolean', enabled: true })
    expect(parseCapacity('infinite')).toEqual({ infinite: true })
    expect(parseCapacity(undefined)).toBeUndefined()
  })
})

describe('catalogue helpers', () => {
  const core = appPlans.find((p) => p.code === 'core')!

  it('finds rates by period and computes yearly savings', () => {
    expect(periodKeysOf(appPlans)).toEqual(['month', 'year'])
    expect(findRate(core, 'EUR', 'month')?.code).toBe('monthly_eur')
    expect(periodKey(findRate(core, 'EUR', 'year')!)).toBe('year')
    expect(monthlyEquivalent(findRate(core, 'EUR', 'year')!)).toBe(90)
    expect(savingsPercent(core, 'EUR')).toBe(10)
    expect(savingsPercent(core, 'USD')).toBeUndefined()
  })

  it('orders by rank, then price, contact plans last, and stays stable', () => {
    const shuffled = [appPlans[2], appPlans[1], appPlans[0]]
    expect(sortPlans(shuffled).map((p) => p.code)).toEqual(['core', 'pro', 'enterprise'])

    const unranked: Plan[] = appPlans.map((p) => ({ ...p, metadata: {} }))
    expect(sortPlans([unranked[1], unranked[2], unranked[0]]).map((p) => p.code)).toEqual(['core', 'pro', 'enterprise'])
  })

  it('narrows by metadata family and keeps untagged plans', () => {
    expect(filterByFamily(appPlans, 'indicate-app')).toHaveLength(3)
    expect(filterByFamily(appPlans, 'other')).toHaveLength(0)
    expect(filterByFamily([goldenPlan], 'other')).toHaveLength(1)
  })

  it('builds the comparison in group and position order', () => {
    const groups = buildComparison(appPlans)
    expect(groups.map((g) => g.code)).toEqual(['data', 'analytics', 'resi', 'team', 'support'])
    const data = groups[0]
    expect(data.features[0].code).toBe('pipelines')
    expect(data.features[0].byPlan.core?.value.included).toBe('3')
    expect(data.features[0].byPlan.enterprise?.value.included).toBe('50')
  })
})

describe('client', () => {
  it('sends the bearer key and version header and parses the list', async () => {
    const fetchMock = vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
      expect(String(url)).toBe('https://api.example.test/v1/plans?family=app')
      const headers = init?.headers as Record<string, string>
      expect(headers.Authorization).toBe('Bearer sneo_test')
      expect(headers['Subneo-Version']).toBe(SUBNEO_API_VERSION)
      return new Response(JSON.stringify(goldenPlanList), { status: 200, headers: { 'content-type': 'application/json' } })
    })
    const client = createSubneoClient({ apiKey: 'sneo_test', baseUrl: 'https://api.example.test/v1/', fetch: fetchMock as typeof fetch })
    const plans = await client.listPlans({ family: 'app' })
    expect(plans[0].code).toBe('pro')
  })

  it('turns problem documents into SubneoError', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ status: 403, title: 'Forbidden', code: 'credential_not_bound' }), {
        status: 403,
        headers: { 'content-type': 'application/problem+json' },
      }),
    )
    const client = createSubneoClient({ apiKey: 'sneo_test', fetch: fetchMock as unknown as typeof fetch })
    await expect(client.listPlans({ family: 'app' })).rejects.toMatchObject({ status: 403, code: 'credential_not_bound' })
    try {
      await client.listPlans({ family: 'app' })
    } catch (error) {
      expect(isSubneoError(error)).toBe(true)
    }
    expect(() => createSubneoClient({ apiKey: '' })).toThrow(/missing/)
  })
})
