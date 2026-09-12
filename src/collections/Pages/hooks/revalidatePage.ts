import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { locales } from '@/i18n/config'

const pathsFor = (slug?: string | null) =>
  locales.map((locale) => (slug === 'home' ? `/${locale}` : `/${locale}/${slug}`))

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const path of pathsFor(doc.slug)) {
        payload.logger.info(`Revalidating page at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      for (const oldPath of pathsFor(previousDoc.slug)) {
        payload.logger.info(`Revalidating old page at path: ${oldPath}`)
        revalidatePath(oldPath)
      }
      revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    for (const path of pathsFor(doc?.slug)) revalidatePath(path)
    revalidateTag('pages-sitemap', 'max')
  }

  return doc
}
