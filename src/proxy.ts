import { NextResponse, type NextRequest } from 'next/server'

import { negotiateLocale } from '@/i18n/negotiate'
import { splitLocale } from '@/i18n/href'

/**
 * Sends requests without a locale prefix to the visitor's best language.
 * `/` → `/de` (or `/en` when the browser prefers English), `/kontakt` → `/de/kontakt`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (splitLocale(pathname).locale) return NextResponse.next()

  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search

  return NextResponse.redirect(url, 307)
}

export const config = {
  matcher: [
    // Everything except: API + admin, preview/seed routes, Next internals, media files,
    // sitemaps/robots and any path that looks like a file.
    '/((?!api|admin|next|_next|media|pages-sitemap\\.xml|posts-sitemap\\.xml|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
}
