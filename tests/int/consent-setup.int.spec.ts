import { describe, expect, it } from 'vitest'

import { createIntegration, defineConsent, type ConsentIntegration } from '@subneo/payload-consent'

const noop = () => {}

const fake = (key: string, category: string, enabled = true): ConsentIntegration =>
  createIntegration({
    key,
    category,
    enabled,
    cookies: [new RegExp(`^_${key}`)],
    load: noop,
    service: { name: key.toUpperCase() },
  })

const categories = [
  { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: 'n' }, en: { label: 'Necessary', description: 'n' } } },
  { key: 'analytics', signals: ['analytics_storage' as const], texts: { de: { label: 'Statistik', description: 's' }, en: { label: 'Statistics', description: 's' } } },
  { key: 'marketing', texts: { de: { label: 'Marketing', description: 'm' }, en: { label: 'Marketing', description: 'm' } } },
]

describe('defineConsent', () => {
  it('fills defaults and derives keys and helpers', () => {
    const setup = defineConsent({ categories, integrations: [fake('gtm', 'analytics'), fake('pixel', 'marketing', false)] })
    expect(setup.cookieName).toBe('consent')
    expect(setup.maxAgeDays).toBe(365)
    expect(setup.logging).toBe(false)
    expect(setup.requiredKey).toBe('necessary')
    expect(setup.optionalKeys).toEqual(['analytics', 'marketing'])
    expect(setup.activeIntegrations.map((i) => i.key)).toEqual(['gtm'])
    expect(setup.integrationsFor('analytics').map((i) => i.key)).toEqual(['gtm'])
    expect(setup.purgePatternsFor('marketing').map(String)).toEqual(['/^_pixel/'])
    expect(setup.purgePatternsFor('necessary')).toEqual([])
  })

  it('rejects duplicate category keys', () => {
    expect(() => defineConsent({ categories: [...categories, categories[1]], integrations: [] })).toThrow(/duplicate category/)
  })

  it('requires exactly one required category', () => {
    expect(() => defineConsent({ categories: categories.slice(1), integrations: [] })).toThrow(/exactly one/)
  })

  it('rejects integrations that target unknown or required categories', () => {
    expect(() => defineConsent({ categories, integrations: [fake('x', 'nope')] })).toThrow(/unknown or required category/)
    expect(() => defineConsent({ categories, integrations: [fake('x', 'necessary')] })).toThrow(/unknown or required category/)
  })

  it('rejects duplicate integration keys', () => {
    expect(() => defineConsent({ categories, integrations: [fake('gtm', 'analytics'), fake('gtm', 'marketing')] })).toThrow(
      /duplicate integration/,
    )
  })
})
