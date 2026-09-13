import { describe, expect, it } from 'vitest'

import { shouldShowTranslationNotice } from '@/components/DocumentLayout/TranslationNotice'
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
