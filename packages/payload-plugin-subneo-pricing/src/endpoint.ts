import type { Endpoint } from 'payload'

import { revalidateTag } from 'next/cache'

import type { ResolvedPluginOptions } from './types'

/**
 * `POST /api/subneo-pricing/refresh` drops the cached plans. Accepts a logged-in admin session or
 * `Authorization: Bearer <refresh secret>` for webhooks and cron jobs.
 */
export const createRefreshEndpoint = ({ cacheTag, env }: ResolvedPluginOptions): Endpoint => ({
  path: '/subneo-pricing/refresh',
  method: 'post',
  handler: async (req) => {
    const secret = process.env[env.refreshSecret]
    const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const allowed = Boolean(req.user) || (Boolean(secret) && bearer === secret)
    if (!allowed) return Response.json({ error: 'unauthorized' }, { status: 401 })

    revalidateTag(cacheTag, { expire: 0 })
    req.payload.logger.info('[subneo-pricing] refresh requested')
    return Response.json({ revalidated: true, tag: cacheTag })
  },
})
