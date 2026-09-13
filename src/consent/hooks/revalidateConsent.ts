import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateConsent: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating consent settings')
    // `expire: 0`: the whole route is cached, a stale copy would freeze old texts into it.
    revalidateTag('global_consent', { expire: 0 })
  }
  return doc
}
