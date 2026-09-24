import { addDataAndFileToRequest, APIError, commitTransaction, initTransaction, killTransaction, type CollectionSlug, type Endpoint } from 'payload'

import { copyBlockToPage, parseCopyBody } from './copyBlock'

/** POST /api/<collection>/copy-block — `{ sourceId, targetId, blockId }` → appends the block to the target's draft. */
export const createCopyBlockEndpoint = ({ collection, field }: { collection: CollectionSlug; field: string }): Endpoint => ({
  path: '/copy-block',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    await addDataAndFileToRequest(req)
    const parsed = parseCopyBody(req.data)
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

    const shouldCommit = await initTransaction(req)
    try {
      const result = await copyBlockToPage({ ...parsed.body, collection, field, req })
      if (shouldCommit) await commitTransaction(req)
      return Response.json(result)
    } catch (error) {
      await killTransaction(req)
      const status = error instanceof APIError ? error.status : 500
      if (status >= 500) req.payload.logger.error({ err: error, msg: 'blockTools: copy-block failed' })
      return Response.json({ error: status >= 500 ? 'Copy failed' : (error as Error).message }, { status })
    }
  },
})
