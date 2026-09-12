import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    // `expire: 0` so the next request renders fresh data instead of a stale-while-revalidate copy
    // (the whole route is cached, so serving stale here would freeze the old header/footer into it).
    revalidateTag('global_header', { expire: 0 })
  }

  return doc
}
