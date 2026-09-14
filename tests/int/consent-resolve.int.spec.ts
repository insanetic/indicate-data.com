import { describe, expect, it } from 'vitest'

import { defaults, defineConsent, fill, fnv1a, resolveConsent, stringsFor, textsHash, type ConsentGlobalDoc } from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: 'Nötig.' }, en: { label: 'Necessary', description: 'Needed.' } } },
    { key: 'analytics', signals: ['analytics_storage'], texts: { de: { label: 'Statistik', description: 'Zählt.' }, en: { label: 'Statistics', description: 'Counts.' } } },
    { key: 'marketing', texts: { de: { label: 'Marketing', description: 'Wirbt.' }, en: { label: 'Marketing', description: 'Ads.' } } },
  ],
  integrations: [gtm({ containerId: 'GTM-TEST' })],
})

describe('strings', () => {
  it('resolves by base language with English fallback', () => {
    expect(stringsFor('de-AT')).toBe(defaults.de)
    expect(stringsFor('en')).toBe(defaults.en)
    expect(stringsFor('xx')).toBe(defaults.en)
  })

  it('fills templates', () => {
    expect(fill('Hallo {name}, {name}!', { name: 'Welt' })).toBe('Hallo Welt, Welt!')
  })
})

describe('resolveConsent', () => {
  it('falls back to the code defaults when the global is empty', () => {
    const resolved = resolveConsent(null, 'de', setup)
    expect(resolved.enabled).toBe(true)
    expect(resolved.revision).toBe(1)
    expect(resolved.trigger).toEqual({ mode: 'link', position: 'bottom-left' })
    expect(resolved.texts.bannerTitle).toBe(defaults.de.bannerTitle)
    expect(resolved.texts.bannerText).toContain('Statistik und Marketing')
    expect(resolved.texts.bannerText).toContain('widerrufen')
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    expect(resolved.texts.categories[1].description).toBe('Zählt.')
    expect(resolved.privacyHref).toBeNull()
    expect(resolved.textsHash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('is disabled only when the global explicitly turns it off', () => {
    expect(resolveConsent({ enabled: false }, 'de', setup).enabled).toBe(false)
    expect(resolveConsent({ enabled: true }, 'de', setup).enabled).toBe(true)
  })

  it('prefers CMS texts, trigger and services field by field and drops unknown categories', () => {
    const global: ConsentGlobalDoc = {
      enabled: true,
      revision: 3,
      privacyPage: { id: 1, slug: 'privacy-policy' },
      imprintPage: { id: 2, slug: 'home' },
      trigger: { mode: 'floating', position: 'bottom-right' },
      banner: { title: 'Cookies?', text: null },
      categories: [
        {
          key: 'analytics',
          label: 'Statistik!',
          services: [{ id: 'svc-1', name: 'Google Analytics 4', provider: 'Google Ireland Limited', purpose: 'Reichweite', integration: 'gtm' }],
        },
        { key: 'unknown', label: 'Nope' },
      ],
    }
    const resolved = resolveConsent(global, 'de', setup)
    expect(resolved.revision).toBe(3)
    expect(resolved.trigger).toEqual({ mode: 'floating', position: 'bottom-right' })
    expect(resolved.texts.bannerTitle).toBe('Cookies?')
    // The banner text itself falls back to the default template, while {categories} uses the CMS label.
    expect(resolved.texts.bannerText).toBe(fill(defaults.de.bannerText, { categories: 'Statistik! und Marketing' }))
    expect(resolved.privacyHref).toBe('/de/privacy-policy')
    expect(resolved.imprintHref).toBe('/de')
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    const analytics = resolved.texts.categories[1]
    expect(analytics.label).toBe('Statistik!')
    expect(analytics.description).toBe('Zählt.')
    expect(analytics.services[0]).toEqual({
      id: 'svc-1',
      name: 'Google Analytics 4',
      provider: 'Google Ireland Limited',
      purpose: 'Reichweite',
      cookies: undefined,
      privacyUrl: undefined,
      integration: 'gtm',
    })
  })

  it('uses English for an unknown locale', () => {
    expect(resolveConsent(null, 'xx', setup).texts.acceptAll).toBe(defaults.en.acceptAll)
  })
})

describe('textsHash', () => {
  it('is stable for equal texts and changes with any visible text', () => {
    const a = resolveConsent(null, 'de', setup)
    const b = resolveConsent(null, 'de', setup)
    expect(a.textsHash).toBe(b.textsHash)
    const c = resolveConsent({ banner: { title: 'Anders' } }, 'de', setup)
    expect(c.textsHash).not.toBe(a.textsHash)
    expect(textsHash(a.texts)).toBe(a.textsHash)
    expect(fnv1a('')).toBe('811c9dc5')
    expect(fnv1a('a')).toBe('e40c292c')
  })
})
