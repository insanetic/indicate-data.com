import { describe, expect, it } from 'vitest'

import { negotiateLocale } from '@/i18n/negotiate'
import { localizeHref, splitLocale, switchLocale } from '@/i18n/href'

describe('negotiateLocale', () => {
  it('defaults to German', () => {
    expect(negotiateLocale(null)).toBe('de')
    expect(negotiateLocale('')).toBe('de')
    expect(negotiateLocale('fr-FR,fr;q=0.9')).toBe('de')
  })

  it('picks the highest ranked supported language', () => {
    expect(negotiateLocale('en-US,en;q=0.9,de;q=0.5')).toBe('en')
    expect(negotiateLocale('fr;q=0.9,de-AT;q=0.8,en;q=0.7')).toBe('de')
    expect(negotiateLocale('en')).toBe('en')
  })
})

describe('localizeHref', () => {
  it('prefixes internal paths', () => {
    expect(localizeHref('/', 'de')).toBe('/de')
    expect(localizeHref('/kontakt', 'en')).toBe('/en/kontakt')
    expect(localizeHref('/posts/hello?x=1#top', 'de')).toBe('/de/posts/hello?x=1#top')
  })

  it('leaves external, anchor and system links alone', () => {
    expect(localizeHref('https://app.indicate-data.com', 'de')).toBe('https://app.indicate-data.com')
    expect(localizeHref('mailto:hello@indicate-data.io', 'de')).toBe('mailto:hello@indicate-data.io')
    expect(localizeHref('#features', 'de')).toBe('#features')
    expect(localizeHref('/api/media/file/x.png', 'de')).toBe('/api/media/file/x.png')
    expect(localizeHref('/admin', 'de')).toBe('/admin')
  })

  it('does not double prefix', () => {
    expect(localizeHref('/en/kontakt', 'de')).toBe('/en/kontakt')
    expect(localizeHref('/de', 'de')).toBe('/de')
  })
})

describe('splitLocale / switchLocale', () => {
  it('splits a prefixed path', () => {
    expect(splitLocale('/de/kontakt')).toEqual({ locale: 'de', path: '/kontakt' })
    expect(splitLocale('/en')).toEqual({ locale: 'en', path: '/' })
    expect(splitLocale('/kontakt')).toEqual({ locale: null, path: '/kontakt' })
  })

  it('switches the locale of a path', () => {
    expect(switchLocale('/de/kontakt', 'en')).toBe('/en/kontakt')
    expect(switchLocale('/de', 'en')).toBe('/en')
  })
})
