import { describe, expect, it } from 'vitest'

import { defaults, resolveConsent } from '@/consent/defaults'
import type { Consent } from '@/payload-types'

describe('resolveConsent', () => {
  it('falls back to the code defaults when the global is empty', () => {
    const resolved = resolveConsent(null, 'de')
    expect(resolved.revision).toBe(1)
    expect(resolved.texts.bannerTitle).toBe(defaults.de.bannerTitle)
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    expect(resolved.privacyHref).toBeNull()
  })

  it('prefers CMS texts and services field by field', () => {
    const global = {
      enabled: true,
      revision: 3,
      privacyPage: { id: 1, slug: 'privacy-policy' },
      banner: { title: 'Cookies?', text: null },
      categories: [
        {
          key: 'analytics',
          label: 'Statistik',
          services: [{ name: 'Google Analytics 4', provider: 'Google Ireland Limited', purpose: 'Reichweite' }],
        },
      ],
    } as unknown as Consent
    const resolved = resolveConsent(global, 'de')
    expect(resolved.revision).toBe(3)
    expect(resolved.texts.bannerTitle).toBe('Cookies?')
    expect(resolved.texts.bannerText).toBe(defaults.de.bannerText)
    expect(resolved.privacyHref).toBe('/de/privacy-policy')
    const analytics = resolved.texts.categories.find((c) => c.key === 'analytics')!
    expect(analytics.label).toBe('Statistik')
    expect(analytics.description).toBe(defaults.de.categories.analytics.description)
    expect(analytics.services[0].name).toBe('Google Analytics 4')
  })

  it('uses English for an unknown locale', () => {
    expect(resolveConsent(null, 'xx' as never).texts.acceptAll).toBe(defaults.en.acceptAll)
  })
})
