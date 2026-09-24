import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { defaultLocale, localeTags, locales, type Locale } from '@/i18n/config'

export const SITE_NAME = 'Indicate Data'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/og-default.png'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

type SeoFields = { title?: string | null; description?: string | null; image?: Media | number | null }

export const seoOf = (doc: Partial<Page> | Partial<Post> | null): SeoFields => {
  if (!doc) return {}
  if ('seo' in doc && doc.seo && (doc.seo.title || doc.seo.description || doc.seo.image)) {
    return doc.seo as SeoFields
  }
  return (doc.meta as SeoFields) || {}
}

/** Builds hreflang alternates for a path such as `/kontakt` or `/posts/hallo`. */
export const localizedAlternates = (path: string, locale: Locale): Metadata['alternates'] => {
  const base = getServerSideURL()
  const suffix = path === '/' ? '' : path
  const languages: Record<string, string> = {}
  for (const code of locales) {
    languages[localeTags[code]] = `${base}/${code}${suffix}`
  }
  languages['x-default'] = `${base}/${defaultLocale}${suffix}`
  return {
    canonical: `${base}/${locale}${suffix}`,
    languages,
  }
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  locale?: Locale
  path?: string
}): Promise<Metadata> => {
  const { doc, locale = defaultLocale, path = '/' } = args
  const seo = seoOf(doc)

  const ogImage = getImageURL(seo.image)

  const title = seo.title ? `${seo.title} | ${SITE_NAME}` : SITE_NAME

  return {
    title,
    description: seo.description || undefined,
    alternates: localizedAlternates(path, locale),
    openGraph: mergeOpenGraph({
      description: seo.description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: localeTags[locale].replace('-', '_'),
      title,
      url: `/${locale}${path === '/' ? '' : path}`,
    }),
  }
}
