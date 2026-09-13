import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

import { DEFAULT_CACHE_TAG } from './types'

/** Drops the cached plans when the settings change, so a new key or family shows up at once. */
export const revalidatePricing: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('[subneo-pricing] revalidating plans')
    revalidateTag(DEFAULT_CACHE_TAG, { expire: 0 })
  }
  return doc
}
