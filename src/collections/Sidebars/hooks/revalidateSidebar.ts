import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Sidebar } from '../../../payload-types'

/**
 * Any page may embed any sidebar, and a sidebar carries no back-reference to the pages that
 * use it, so an edit revalidates the whole dynamic page route rather than single paths.
 */
const PAGE_ROUTE = '/(frontend)/[locale]/[slug]'

export const revalidateSidebar: CollectionAfterChangeHook<Sidebar> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating pages after sidebar change: ${PAGE_ROUTE}`)
    revalidatePath(PAGE_ROUTE, 'page')
  }

  return doc
}

export const revalidateSidebarDelete: CollectionAfterDeleteHook<Sidebar> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating pages after sidebar deletion: ${PAGE_ROUTE}`)
    revalidatePath(PAGE_ROUTE, 'page')
  }

  return doc
}
