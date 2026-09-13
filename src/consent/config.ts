/**
 * Consent categories and their Google Consent Mode v2 signals. Project-specific: add a category
 * here, give it texts in ./defaults.ts and add the option to the `key` select in ./global.ts.
 */
export type CategoryKey = 'necessary' | 'analytics' | 'marketing'
export type OptionalCategoryKey = Exclude<CategoryKey, 'necessary'>

export type ConsentSignal = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage'

export type CategoryConfig = {
  key: CategoryKey
  required: boolean
  /** Consent Mode signals set to "granted" when the category is granted. */
  signals: readonly ConsentSignal[]
  /** Cookie name patterns deleted when the category is withdrawn. */
  purge: readonly RegExp[]
}

export const consentConfig = {
  cookieName: 'consent',
  maxAgeDays: 365,
  categories: [
    { key: 'necessary', required: true, signals: [], purge: [] },
    { key: 'analytics', required: false, signals: ['analytics_storage'], purge: [/^_ga($|_)/, /^_gid$/] },
    {
      key: 'marketing',
      required: false,
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      purge: [/^_gcl_/, /^_fbp$/],
    },
  ] as readonly CategoryConfig[],
} as const

export const optionalCategories = consentConfig.categories.filter((c) => !c.required) as readonly (CategoryConfig & {
  key: OptionalCategoryKey
})[]

export const optionalKeys = optionalCategories.map((c) => c.key) as readonly OptionalCategoryKey[]
