import { defaultLocale, isLocale, locales, type Locale } from './config'

/**
 * Picks the best site locale for an `Accept-Language` header.
 * Falls back to the default locale (German) when nothing matches.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale

  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
      const quality = q ? Number.parseFloat(q.slice(2)) : 1
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index }
    })
    .filter((entry) => entry.tag && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)

  for (const { tag } of ranked) {
    const primary = tag.split('-')[0]
    if (isLocale(primary)) return primary
  }

  return locales.includes(defaultLocale) ? defaultLocale : locales[0]
}
