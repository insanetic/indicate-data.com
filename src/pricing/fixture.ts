import type { Plan, PlanEntitlement, PlanRate } from '@subneo/sdk'

/**
 * Example plans in the exact shape `GET /v1/plans` returns, so the page can be built and shown
 * before the Subneo catalogue exists. Prices follow the app's current constants (Core 100 €,
 * Pro 500 €, 10 % yearly rebate, 20 €/100 € agent tokens, 5 € per extra pipeline); everything
 * else is illustrative. Names are single-language like in Subneo; the CMS overrides translate.
 */

const EUR = (amount: number) => String(Math.round(amount * 1_000_000))

type Kind = PlanEntitlement['kind']

const groups = {
  data: { code: 'data', name: 'Data & integrations' },
  analytics: { code: 'analytics', name: 'Dashboards & reporting' },
  resi: { code: 'resi', name: 'Resi, the AI agent' },
  team: { code: 'team', name: 'Team & governance' },
  support: { code: 'support', name: 'Support' },
} as const

type FeatureDef = { code: string; name: string; description?: string; kind: Kind; group: keyof typeof groups }

const features: FeatureDef[] = [
  { code: 'pipelines', name: 'Data connections', description: 'Connected systems, synced into your warehouse', kind: 'allocation', group: 'data' },
  { code: 'sub_daily_sync', name: 'Hourly sync', description: 'Sync connections every hour instead of once a day', kind: 'boolean', group: 'data' },
  { code: 'sync_15min', name: '15-minute sync', kind: 'boolean', group: 'data' },
  { code: 'premium_connectors', name: 'Premium connectors', description: 'PMS and channel systems with a premium multiplier', kind: 'boolean', group: 'data' },
  { code: 'csv_import', name: 'CSV import', kind: 'boolean', group: 'data' },
  { code: 'data_sharing', name: 'Share data products across spaces', kind: 'boolean', group: 'data' },
  { code: 'warehouse_export', name: 'Warehouse export', description: 'Download tables and the DDL of your warehouse', kind: 'boolean', group: 'data' },

  { code: 'dashboards', name: 'Dashboards', kind: 'allocation', group: 'analytics' },
  { code: 'templates', name: 'Template marketplace', kind: 'boolean', group: 'analytics' },
  { code: 'kpi_studio', name: 'KPI Studio', description: 'Own metrics in the semantic layer, versioned', kind: 'boolean', group: 'analytics' },
  { code: 'flying_kpis', name: 'Flying KPIs', description: 'Scheduled dashboard reports by e-mail', kind: 'boolean', group: 'analytics' },
  { code: 'flying_kpis_ai_summary', name: 'AI summary in reports', kind: 'boolean', group: 'analytics' },
  { code: 'brand_palettes', name: 'Brand palettes', kind: 'boolean', group: 'analytics' },

  { code: 'resi_chat', name: 'Chat with your data', kind: 'boolean', group: 'resi' },
  { code: 'resi_build', name: 'Build dashboards with Resi', kind: 'boolean', group: 'resi' },
  { code: 'resi_credits', name: 'Resi credits', description: 'One credit is one question, summary or dashboard step', kind: 'consumable', group: 'resi' },
  { code: 'resi_warehouse_access', name: 'Warehouse access for Resi', description: 'Resi may query beyond the metric catalogue', kind: 'boolean', group: 'resi' },
  { code: 'mcp_clients', name: 'MCP for Claude, ChatGPT and Langdock', kind: 'boolean', group: 'resi' },
  { code: 'agent_tokens', name: 'Agent tokens', description: 'Connect external assistants and agents', kind: 'allocation', group: 'resi' },

  { code: 'users', name: 'Users', kind: 'allocation', group: 'team' },
  { code: 'roles', name: 'Roles (reader, user, admin)', kind: 'boolean', group: 'team' },
  { code: 'mfa', name: 'Two-factor authentication', kind: 'boolean', group: 'team' },
  { code: 'audit_log_days', name: 'Audit log history (days)', kind: 'number', group: 'team' },
  { code: 'api_tokens', name: 'API tokens', kind: 'allocation', group: 'team' },
  { code: 'service_accounts', name: 'Service accounts', kind: 'allocation', group: 'team' },
  { code: 'org_branding', name: 'Organisation branding', kind: 'boolean', group: 'team' },

  { code: 'support_channel', name: 'Support', kind: 'string', group: 'support' },
  { code: 'onboarding', name: 'Guided onboarding', kind: 'boolean', group: 'support' },
  { code: 'sla', name: 'Service level agreement', kind: 'boolean', group: 'support' },
]

const byCode = Object.fromEntries(features.map((f) => [f.code, f])) as Record<string, FeatureDef>

type Value = PlanEntitlement['value']

const on: Value = { bool: true }
const off: Value = { bool: false }
const seats = (included: number | 'infinite', max: number | 'infinite' = 'infinite'): Value => ({
  min: '0',
  included: String(included),
  max: String(max),
})
const monthly = (included: number): Value => ({
  min: '0',
  included: String(included),
  max: 'infinite',
  resetPeriod: 'month',
  resetPeriodCount: 1,
  resetAnchor: 'calendar_aligned',
  rolloverEnabled: false,
})

/** Builds the entitlement list in the given order; `position` follows that order. */
const entitlements = (values: Record<string, Value>): PlanEntitlement[] =>
  Object.entries(values).map(([code, value], position) => {
    const f = byCode[code]
    if (!f) throw new Error(`unknown feature ${code}`)
    return {
      featureCode: code,
      name: f.name,
      ...(f.description ? { description: f.description } : {}),
      kind: f.kind,
      group: groups[f.group],
      value,
      position,
    }
  })

const appFeatureRates: PlanRate['featureRates'] = [
  { featureCode: 'pipelines', pricingModel: 'flat', amountMicros: EUR(5) },
  { featureCode: 'agent_tokens', pricingModel: 'flat', amountMicros: EUR(20) },
  { featureCode: 'resi_credits', pricingModel: 'flat', amountMicros: EUR(5), packageSize: 100, packageRounding: 'up' },
]

const rates = (monthlyAmount: number, options: { yearly?: boolean; featureRates?: PlanRate['featureRates'] } = {}): PlanRate[] => {
  const featureRates = options.featureRates || []
  const list: PlanRate[] = [
    {
      code: 'monthly_eur',
      currency: 'EUR',
      amountMicros: EUR(monthlyAmount),
      billingPeriod: 'month',
      billingPeriodCount: 1,
      trialRequiresPaymentMethod: false,
      noticePeriod: 'month',
      noticePeriodCount: 1,
      autoRenew: true,
      featureRates,
    },
  ]
  if (options.yearly !== false) {
    list.push({
      code: 'yearly_eur',
      currency: 'EUR',
      amountMicros: EUR(monthlyAmount * 12 * 0.9),
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
  return list
}

const version = { number: 1, effectiveFrom: '2026-09-01T00:00:00.000Z', metadata: {} }

export const appPlans: Plan[] = [
  {
    code: 'core',
    name: 'Core',
    metadata: { family: 'indicate-app', rank: '1', tagline: 'For a single hotel that wants clear numbers every morning.' },
    version,
    rates: rates(100, { featureRates: appFeatureRates }),
    entitlements: entitlements({
      pipelines: seats(3),
      sub_daily_sync: off,
      sync_15min: off,
      premium_connectors: off,
      csv_import: on,
      data_sharing: off,
      warehouse_export: on,
      dashboards: seats(10, 10),
      templates: on,
      kpi_studio: on,
      flying_kpis: on,
      flying_kpis_ai_summary: off,
      brand_palettes: off,
      resi_chat: on,
      resi_build: on,
      resi_credits: monthly(100),
      resi_warehouse_access: off,
      mcp_clients: on,
      agent_tokens: seats(1),
      users: seats('infinite'),
      roles: on,
      mfa: on,
      audit_log_days: { number: '2' },
      api_tokens: seats(0, 0),
      service_accounts: seats(0, 0),
      org_branding: off,
      support_channel: { text: 'E-mail' },
      onboarding: off,
      sla: off,
    }),
  },
  {
    code: 'pro',
    name: 'Pro',
    metadata: { family: 'indicate-app', rank: '2', featured: 'true', badge: 'Popular', tagline: 'For hotels and small groups that steer marketing and revenue together.' },
    version,
    rates: rates(500, { featureRates: appFeatureRates }),
    entitlements: entitlements({
      pipelines: seats(10),
      sub_daily_sync: on,
      sync_15min: off,
      premium_connectors: on,
      csv_import: on,
      data_sharing: on,
      warehouse_export: on,
      dashboards: seats('infinite'),
      templates: on,
      kpi_studio: on,
      flying_kpis: on,
      flying_kpis_ai_summary: on,
      brand_palettes: on,
      resi_chat: on,
      resi_build: on,
      resi_credits: monthly(500),
      resi_warehouse_access: on,
      mcp_clients: on,
      agent_tokens: seats(5),
      users: seats('infinite'),
      roles: on,
      mfa: on,
      audit_log_days: { number: '50' },
      api_tokens: seats(10),
      service_accounts: seats(10),
      org_branding: off,
      support_channel: { text: 'Priority e-mail' },
      onboarding: on,
      sla: off,
    }),
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    metadata: { family: 'indicate-app', rank: '3', tagline: 'For groups, agencies and software partners with their own requirements.' },
    version,
    rates: [],
    entitlements: entitlements({
      pipelines: seats(50),
      sub_daily_sync: on,
      sync_15min: on,
      premium_connectors: on,
      csv_import: on,
      data_sharing: on,
      warehouse_export: on,
      dashboards: seats('infinite'),
      templates: on,
      kpi_studio: on,
      flying_kpis: on,
      flying_kpis_ai_summary: on,
      brand_palettes: on,
      resi_chat: on,
      resi_build: on,
      resi_credits: monthly(2500),
      resi_warehouse_access: on,
      mcp_clients: on,
      agent_tokens: seats('infinite'),
      users: seats('infinite'),
      roles: on,
      mfa: on,
      audit_log_days: { number: '500' },
      api_tokens: seats('infinite'),
      service_accounts: seats('infinite'),
      org_branding: on,
      support_channel: { text: 'Dedicated contact' },
      onboarding: on,
      sla: on,
    }),
  },
]

export const agentPlans: Plan[] = [
  {
    code: 'agent-single',
    name: 'Agent token, single space',
    metadata: { family: 'indicate-agent', rank: '1', tagline: 'One external assistant on one space' },
    version,
    rates: rates(20, { yearly: false }),
    entitlements: entitlements({ agent_tokens: seats(1, 1), mcp_clients: on }),
  },
  {
    code: 'agent-multi',
    name: 'Agent token, all spaces',
    metadata: { family: 'indicate-agent', rank: '2', tagline: 'One token across every space of your organisation' },
    version,
    rates: rates(100, { yearly: false }),
    entitlements: entitlements({ agent_tokens: seats(1, 1), mcp_clients: on, data_sharing: on }),
  },
  {
    code: 'resi-credits-500',
    name: 'Resi credits, 500',
    metadata: { family: 'indicate-agent', rank: '3', tagline: 'For teams that ask Resi every day' },
    version,
    rates: rates(25, { yearly: false }),
    entitlements: entitlements({ resi_credits: monthly(500) }),
  },
  {
    code: 'resi-credits-2500',
    name: 'Resi credits, 2 500',
    metadata: { family: 'indicate-agent', rank: '4', tagline: 'For groups and agencies with many spaces' },
    version,
    rates: rates(100, { yearly: false }),
    entitlements: entitlements({ resi_credits: monthly(2500) }),
  },
]

/** Family code → plans, the shape `subneoPricingPlugin({ fixtures })` expects. */
export const pricingFixtures: Record<string, Plan[]> = {
  'indicate-app': appPlans,
  'indicate-agent': agentPlans,
}

export const pricingFamilyCodes = { app: 'indicate-app', agent: 'indicate-agent' } as const
