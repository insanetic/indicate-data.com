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

/** Runtime settings of one integration, resolved on the server and sent to the browser. */
export type IntegrationRuntime = { enabled: boolean; options: Record<string, string> }

/** Environment the server resolves integrations from: `process.env`, or a mounted config file. */
export type RuntimeEnv = Readonly<Record<string, string | undefined>>

export type IntegrationContext = {
  choices: Choices
  locale: string
  signals: ConsentModeSignals
  /** The integration's own runtime options (see `ConsentIntegration.resolve`). */
  options: Record<string, string>
}

/**
 * One runtime value an editor can fill in the admin instead of setting it on the container.
 * The plugin renders a text field per entry under the integration's key, and the value overrides
 * the environment variable of the same `envKey` before `resolve()` runs.
 */
export type IntegrationSetting = {
  /**
   * Field name inside the integration's admin group, e.g. `containerId`. Never `id`: Payload's
   * schema builder skips a field of that name at any depth, so it would get no database column.
   */
  name: string
  /** Key this value takes in the `resolve()` environment, e.g. `GTM_ID`. */
  envKey: string
  /** Field label; a record is a per-admin-language label, as everywhere in Payload. */
  label: string | Record<string, string>
  description?: string | Record<string, string>
  placeholder?: string
  /** Rejects a malformed value in the admin. Never called with an empty value. */
  validate?: (value: string) => true | string
}

export type ConsentIntegration = {
  /** Stable identifier, also the value of the service row's `integration` select. */
  key: string
  /** Optional category this integration needs. */
  category: string
  /** False keeps the integration registered (select options, docs) but never loads it. Default true. */
  enabled?: boolean
  /**
   * Reads the integration's runtime settings on the server, once per request, from the environment
   * (ids, keys). Nothing here is compiled into the bundle, so a container can get its settings
   * from a mounted file. The result reaches the browser as `ResolvedConsent.integrations` and
   * `IntegrationContext.options`. Default: enabled, no options.
   */
  resolve?: (env: RuntimeEnv) => IntegrationRuntime
  /**
   * Runtime values the editor may set in the admin (ids, container names). They are merged over
   * the environment before `resolve()` is called, so the admin wins and the environment variable
   * stays as the fallback for a container that is configured from the outside.
   */
  settings?: readonly IntegrationSetting[]
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

/** Runtime settings of every statically active integration, keyed by integration key. */
export function resolveIntegrations(setup: ResolvedSetup, env: RuntimeEnv): Record<string, IntegrationRuntime> {
  return Object.fromEntries(
    setup.activeIntegrations.map((i) => [i.key, i.resolve ? i.resolve(env) : { enabled: true, options: {} }]),
  )
}

/** Integrations that are active and enabled at runtime, per the settings resolved on the server. */
export function runtimeIntegrations(
  setup: ResolvedSetup,
  settings: { integrations: Record<string, IntegrationRuntime> },
): readonly ConsentIntegration[] {
  return setup.activeIntegrations.filter((i) => settings.integrations[i.key]?.enabled)
}

/** `process.env` on the server, an empty object anywhere else. */
export const serverEnv = (): RuntimeEnv => (typeof process !== 'undefined' && process.env ? process.env : {})

/** The integrations that put a value in the admin, with their fields. Empty: no admin group. */
export const settingsOf = (setup: ResolvedSetup): readonly ConsentIntegration[] =>
  setup.activeIntegrations.filter((i) => (i.settings || []).length > 0)

/**
 * The environment `resolve()` sees: the container's own, with every value the editor filled in the
 * admin laid over it. A blank admin field changes nothing, so a site can be configured either way
 * and moved from one to the other without a deploy.
 */
export function integrationEnv(
  setup: ResolvedSetup,
  stored: Record<string, Record<string, unknown> | null | undefined> | null | undefined,
  base: RuntimeEnv,
): RuntimeEnv {
  if (!stored) return base
  const env: Record<string, string | undefined> = { ...base }
  for (const integration of settingsOf(setup)) {
    for (const setting of integration.settings || []) {
      const value = stored[integration.key]?.[setting.name]
      if (typeof value === 'string' && value.trim()) env[setting.envKey] = value.trim()
    }
  }
  return env
}

/** Typed identity helper for integration files. */
export const createIntegration = <T extends ConsentIntegration>(integration: T): T => integration
