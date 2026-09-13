import type { Plan } from '../types'

/**
 * The exact document the Go wire test (`api/http/v1/model/public/plan_test.go`,
 * `TestToPlanResponseWire`) asserts byte for byte. Use it to keep the TypeScript types honest.
 */
export const goldenPlan: Plan = {
  code: 'pro',
  name: 'Pro',
  metadata: { tier: '2' },
  version: {
    number: 3,
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    taxCode: 'txcd_10000000',
    metadata: {},
  },
  rates: [
    {
      code: 'monthly_usd',
      currency: 'USD',
      amountMicros: '49000000',
      msrpAmountMicros: '59000000',
      billingPeriod: 'month',
      billingPeriodCount: 1,
      trialPeriod: 'day',
      trialPeriodCount: 14,
      trialRequiresPaymentMethod: true,
      noticePeriod: 'month',
      noticePeriodCount: 1,
      etfKind: 'percent_remaining',
      etfPercent: '25',
      autoRenew: true,
      featureRates: [
        {
          featureCode: 'seats',
          pricingModel: 'graduated',
          tiers: [
            { upToUnits: '5', unitAmountMicros: '0', flatAmountMicros: '0' },
            { unitAmountMicros: '9000000', flatAmountMicros: '0' },
          ],
        },
        { featureCode: 'api_calls', pricingModel: 'flat', amountMicros: '1000', packageSize: 1000, packageRounding: 'up' },
      ],
    },
  ],
  entitlements: [
    {
      featureCode: 'seats',
      name: 'Seats',
      kind: 'allocation',
      group: { code: 'core', name: 'Core' },
      value: { min: '0', included: '5', max: 'infinite' },
      position: 0,
    },
    {
      featureCode: 'sso',
      name: 'Single sign-on',
      description: 'SAML and OIDC',
      kind: 'boolean',
      group: { code: 'security', name: 'Security' },
      value: { bool: true },
      position: 1,
    },
  ],
}

export const goldenPlanList = { data: [goldenPlan] }
