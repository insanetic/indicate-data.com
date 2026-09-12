import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

import { defaultLocale, isLocale } from '@/i18n/config'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  locale?: string | null
}

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  const localeCode = isLocale(locale) ? locale : defaultLocale

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)
  const pagePath = collection === 'pages' && slug === 'home' ? '' : `/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    path: `/${localeCode}${collectionPrefixMap[collection]}${pagePath}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
