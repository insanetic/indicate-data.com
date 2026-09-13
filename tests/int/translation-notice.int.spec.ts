import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { shouldShowTranslationNotice, TranslationNotice } from '@/components/DocumentLayout/TranslationNotice'
import { getDictionary } from '@/i18n/dictionaries'

describe('shouldShowTranslationNotice', () => {
  it('shows only when reading a non-binding language', () => {
    expect(shouldShowTranslationNotice('en', 'de')).toBe(true)
    expect(shouldShowTranslationNotice('de', 'de')).toBe(false)
    expect(shouldShowTranslationNotice('de', 'en')).toBe(true)
    expect(shouldShowTranslationNotice('en', 'none')).toBe(false)
    expect(shouldShowTranslationNotice('en', null)).toBe(false)
    expect(shouldShowTranslationNotice('en', undefined)).toBe(false)
  })
})

describe('document dictionary', () => {
  it('has the notice with a language placeholder in both languages', () => {
    for (const locale of ['de', 'en'] as const) {
      const d = getDictionary(locale)
      expect(d.translationNotice).toContain('{language}')
      expect(d.onThisPage).toBeTruthy()
      expect(d.previousVersions).toBeTruthy()
    }
  })
})

describe('TranslationNotice component', () => {
  it('renders when viewing a translation with correct attributes and text', () => {
    const html = renderToStaticMarkup(
      React.createElement(TranslationNotice, { locale: 'en', binding: 'de', slug: 'privacy-policy' }),
    )
    expect(html).toContain('href="/de/privacy-policy"')
    expect(html).toContain('hrefLang="de-DE"')
    expect(html).toContain('Deutsch')
    expect(html).not.toContain('{language}')
    expect(html).toContain('role="note"')
  })

  it('returns empty string when viewing the binding language', () => {
    const html = renderToStaticMarkup(
      React.createElement(TranslationNotice, { locale: 'de', binding: 'de', slug: 'privacy-policy' }),
    )
    expect(html).toBe('')
  })
})
