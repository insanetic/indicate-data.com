export const locales = ['de', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'de'

export const localeLabels: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
}

/** BCP 47 tags used for <html lang> and hreflang. */
export const localeTags: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en',
}

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value)
