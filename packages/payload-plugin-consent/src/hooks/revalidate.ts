import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/** Drops the cached global. `expire: 0` because the whole route is cached and would freeze old texts. */
export const createRevalidateHook =
  (cacheTag: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`[consent] revalidating ${cacheTag}`)
      revalidateTag(cacheTag, { expire: 0 })
    }
    return doc
  }
