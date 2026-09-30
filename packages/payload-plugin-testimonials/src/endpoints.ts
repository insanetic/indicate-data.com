import type { Endpoint, Payload, PayloadRequest } from 'payload'

import { addDataAndFileToRequest } from 'payload'

import { parsePreviewBody, previewSelection } from './preview'
import { loadPool } from './server'
import type { ResolvedOptions } from './types'
import { findUsage } from './usage'

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })
const localeOf = (req: PayloadRequest) => (typeof req.locale === 'string' ? req.locale : undefined)

/** `content.layout` → `{ content: { layout: true } }`, merged into `select`. */
const selectPath = (select: Record<string, unknown>, path: string) => {
  const keys = path.split('.')
  let node = select
  keys.forEach((key, i) => {
    if (i === keys.length - 1) node[key] = true
    else node = (node[key] = typeof node[key] === 'object' && node[key] ? node[key] : {}) as Record<string, unknown>
  })
  return select
}

/** GET /api/<testimonials>/:id/usage — documents that show or reference this testimonial. */
export const createUsageEndpoint = (o: ResolvedOptions): Endpoint => ({
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    if (!o.usage || o.locations.length === 0) return Response.json({ usages: [] })
    const payload: Payload = req.payload
    const byCollection = new Map<string, typeof o.locations>()
    for (const loc of o.locations) byCollection.set(loc.collection, [...(byCollection.get(loc.collection) || []), loc])
    const pool = await loadPool({ payload, locale: localeOf(req) })
    const perCollection = await Promise.all(
      [...byCollection].map(async ([collection, locations]) => {
        const config = payload.collections[collection as keyof typeof payload.collections]?.config
        if (!config) return []
        // Only published documents count as "shown"; a collection without drafts has no _status to filter on.
        const hasDrafts = Boolean(config.versions?.drafts)
        const titleField = config.admin?.useAsTitle || 'id'
        const select = locations.reduce((acc, loc) => selectPath(acc, loc.path), { [titleField]: true } as Record<string, unknown>)
        const docs = await payload.find({
          collection: collection as Parameters<Payload['find']>[0]['collection'],
          depth: 0,
          pagination: false,
          overrideAccess: true,
          select: select as never,
          req,
          ...(hasDrafts ? { where: { _status: { equals: 'published' } } } : {}),
        })
        return locations.flatMap((loc) =>
          findUsage({
            collection,
            docs: docs.docs as never,
            path: loc.path,
            titleField,
            blockSlug: loc.blockSlug,
            pool,
            testimonialId: String(req.routeParams?.id),
          }),
        )
      }),
    )
    return Response.json({ usages: perCollection.flat() })
  },
})

/**
 * POST /api/<testimonials>/preview — what a block would show with the given (unsaved) values.
 * With `layout` (the page's blocks up to and including this one) and `blockIndex` it resolves the
 * page as the site does; a bare `block` (older clients) is previewed on its own.
 */
export const createPreviewEndpoint = (): Endpoint => ({
  path: '/preview',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    await addDataAndFileToRequest(req)
    const { localization } = req.payload.config
    const parsed = parsePreviewBody(req.data, {
      localeCodes: localization ? localization.localeCodes : undefined,
      fallbackLocale: localeOf(req),
    })
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })
    const pool = await loadPool({ payload: req.payload, locale: parsed.request.locale })
    return Response.json(previewSelection({ pool, request: parsed.request }))
  },
})
