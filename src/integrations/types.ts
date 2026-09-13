import type { Locale } from '@/i18n/config'

/** How the directory groups connectors. Order here is the order of the filter chips. */
export const integrationCategories = ['pms', 'sales', 'marketing', 'web', 'operations', 'data'] as const
export type IntegrationCategory = (typeof integrationCategories)[number]

export type IntegrationStatus = 'available' | 'beta' | 'on-request'

export type Integration = {
  /** Stable id, also the logo filename under /public/integrations (without extension). */
  slug: string
  name: string
  category: IntegrationCategory
  /** One line, per language. */
  description: Record<Locale, string>
  /** Search terms that are not in the name (vendor, product family, old names). */
  aliases?: string[]
  /** Path of the mark, relative to the site root. Absent = text tile. */
  logo?: string
  status: IntegrationStatus
  /** Public documentation for this connector, if any. */
  docsUrl?: string
  /** Shown as "popular" in the directory (sorted first). */
  featured?: boolean
}
