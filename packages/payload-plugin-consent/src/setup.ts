/** Google Consent Mode v2 signals a category can grant. */
export type ConsentModeSignal = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage'
export type ConsentModeSignals = Record<ConsentModeSignal, 'granted' | 'denied'>

/** One boolean per optional category key. */
export type Choices = Record<string, boolean>

export type CategoryTexts = { label: string; description: string }

export type CategoryConfig = {
  key: string
  /** Exactly one category is required; it is always on and cannot be withdrawn. */
  required?: boolean
  /** Consent Mode signals set to "granted" when this category is granted. */
  signals?: readonly ConsentModeSignal[]
  /** Default label and description per base language; CMS rows override field by field. */
  texts: Record<string, CategoryTexts>
}

export type IntegrationContext = { choices: Choices; locale: string; signals: ConsentModeSignals }

export type ConsentIntegration = {
  /** Stable identifier, also the value of the service row's `integration` select. */
  key: string
  /** Optional category this integration needs. */
  category: string
  /** False keeps the integration registered (select options, docs) but never loads it. Default true. */
  enabled?: boolean
  /** Cookie name patterns removed when the category is withdrawn or the record is invalidated. */
  cookies: readonly RegExp[]
  /** Inline head script that runs before hydration when the layer is enabled (e.g. Consent Mode defaults). */
  bootstrap?: string
  /** Called once per page load after a decision that grants `category`. Must be idempotent. */
  load: (ctx: IntegrationContext) => void
  /** Called on every decision after `load` (e.g. `gtag('consent','update')`). */
  update?: (ctx: IntegrationContext) => void
  /** Prefilled admin labels for the service row. */
  service: { name: string; provider?: string; privacyUrl?: string }
}

export type ConsentSetup = {
  /** Cookie holding the consent record. Default `consent`. */
  cookieName?: string
  /** Validity of a decision. Default 365; 180 is the strictest common reading. */
  maxAgeDays?: number
  categories: readonly CategoryConfig[]
  integrations: readonly ConsentIntegration[]
  /** Adds the `consent-logs` collection and `POST /api/consent/log`. */
  logging?: boolean
}

export type ResolvedSetup = {
  cookieName: string
  maxAgeDays: number
  categories: readonly CategoryConfig[]
  integrations: readonly ConsentIntegration[]
  activeIntegrations: readonly ConsentIntegration[]
  logging: boolean
  requiredKey: string
  optionalKeys: readonly string[]
  integrationsFor: (category: string) => readonly ConsentIntegration[]
  /**
   * Cookie patterns of every registered integration in the category, disabled ones included:
   * an integration switched off after it already ran still has cookies to clean up.
   */
  purgePatternsFor: (category: string) => readonly RegExp[]
}

/** Validates a site's consent setup once, at import time, and derives the helpers the runtime uses. */
export function defineConsent(setup: ConsentSetup): ResolvedSetup {
  const keys = setup.categories.map((c) => c.key)
  if (new Set(keys).size !== keys.length) throw new Error('consent: duplicate category keys')
  const required = setup.categories.filter((c) => c.required)
  if (required.length !== 1) throw new Error('consent: exactly one category must be required')
  const optionalKeys = setup.categories.filter((c) => !c.required).map((c) => c.key)

  const integrationKeys = setup.integrations.map((i) => i.key)
  if (new Set(integrationKeys).size !== integrationKeys.length) throw new Error('consent: duplicate integration keys')
  for (const integration of setup.integrations) {
    if (!optionalKeys.includes(integration.category)) {
      throw new Error(
        `consent: integration "${integration.key}" targets unknown or required category "${integration.category}"`,
      )
    }
  }

  const activeIntegrations = setup.integrations.filter((i) => i.enabled !== false)
  const integrationsFor = (category: string) => activeIntegrations.filter((i) => i.category === category)

  return {
    cookieName: setup.cookieName || 'consent',
    maxAgeDays: setup.maxAgeDays ?? 365,
    categories: setup.categories,
    integrations: setup.integrations,
    activeIntegrations,
    logging: Boolean(setup.logging),
    requiredKey: required[0].key,
    optionalKeys,
    integrationsFor,
    purgePatternsFor: (category) =>
      setup.integrations.filter((i) => i.category === category).flatMap((i) => i.cookies),
  }
}

/** Typed identity helper for integration files. */
export const createIntegration = <T extends ConsentIntegration>(integration: T): T => integration
