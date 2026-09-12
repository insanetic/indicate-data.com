import { isLocale, type Locale } from './config'

const EXTERNAL = /^(https?:|mailto:|tel:|sms:|#|\/\/)/i
const UNPREFIXED = /^\/(api|admin|next|_next|media)(\/|$)/

/** Splits a pathname into its locale prefix (if any) and the rest of the path. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first = '', ...rest] = pathname.split('/')
  if (isLocale(first)) {
    const path = '/' + rest.join('/')
    return { locale: first, path: path === '/' ? '/' : path.replace(/\/$/, '') }
  }
  return { locale: null, path: pathname || '/' }
}

/**
 * Prefixes an internal href with the locale: `/kontakt` → `/de/kontakt`.
 * External links, anchors, API/admin paths and already-prefixed paths are returned as-is.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (!href) return href
  if (EXTERNAL.test(href) || UNPREFIXED.test(href)) return href
  if (!href.startsWith('/')) return href

  const [pathname, suffix = ''] = splitSuffix(href)
  if (splitLocale(pathname).locale) return href

  const path = pathname === '/' ? '' : pathname.replace(/\/$/, '')
  return `/${locale}${path}${suffix}`
}

/** Returns the same path in another locale. */
export function switchLocale(pathname: string, locale: Locale): string {
  const { path } = splitLocale(pathname)
  return localizeHref(path, locale)
}

function splitSuffix(href: string): [string, string] {
  const match = href.match(/^([^?#]*)(.*)$/)
  return match ? [match[1] || '/', match[2] || ''] : [href, '']
}
