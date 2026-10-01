import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

import { DEFAULT_CACHE_TAG } from './types'

/**
 * Drops the cached settings and plans when the global changes; pages that render pricing carry
 * the tag, so they re-render with the new prices, key or families at once.
 */
export const revalidatePricing: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('[subneo-pricing] revalidating plans')
    revalidateTag(DEFAULT_CACHE_TAG, { expire: 0 })
  }
  return doc
}
