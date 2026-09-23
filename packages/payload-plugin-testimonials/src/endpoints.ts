import type { Endpoint, Payload, PayloadRequest } from 'payload'

import { addDataAndFileToRequest } from 'payload'

import { countEligible, selectTestimonials } from './select'
import { loadPool } from './server'
import type { ResolvedOptions, TestimonialsBlockData } from './types'
import { findUsage } from './usage'

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })
const localeOf = (req: PayloadRequest) => (typeof req.locale === 'string' ? req.locale : undefined)

/** GET /api/<testimonials>/:id/usage — pages that show or reference this testimonial. */
export const createUsageEndpoint = (o: ResolvedOptions): Endpoint => ({
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    if (!o.usage) return Response.json({ usages: [] })
    const { collection, field, blockSlug } = o.usage
    const payload: Payload = req.payload
    // Only published pages count as "shown"; a collection without drafts has no _status to filter on.
    const hasDrafts = Boolean(payload.collections[collection as keyof typeof payload.collections]?.config.versions?.drafts)
    const [pool, pages] = await Promise.all([
      loadPool({ payload, slug: o.slugs.testimonials, locale: localeOf(req), linkCollections: o.linkCollections }),
      payload.find({
        collection: collection as Parameters<Payload['find']>[0]['collection'],
        depth: 0,
        pagination: false,
        overrideAccess: true,
        select: { title: true, [field]: true } as never,
        req,
        ...(hasDrafts ? { where: { _status: { equals: 'published' } } } : {}),
      }),
    ])
    const usages = findUsage({
      docs: pages.docs as never,
      field,
      blockSlug,
      pool,
      testimonialId: String(req.routeParams?.id),
    })
    return Response.json({ usages })
  },
})

/** POST /api/<testimonials>/preview — what a block would show with the given (unsaved) values. */
export const createPreviewEndpoint = (o: ResolvedOptions): Endpoint => ({
  path: '/preview',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    await addDataAndFileToRequest(req)
    const body = (req.data || {}) as { block?: TestimonialsBlockData; locale?: string }
    const block = body.block || {}
    const pool = await loadPool({
      payload: req.payload,
      slug: o.slugs.testimonials,
      locale: body.locale || localeOf(req),
      linkCollections: o.linkCollections,
    })
    const items = selectTestimonials({ pool, block }).map(({ testimonial, reason }) => ({
      id: testimonial.id,
      title: testimonial.title || testimonial.name || String(testimonial.id),
      reason,
    }))
    return Response.json({ items, matching: countEligible({ pool, block }) })
  },
})
