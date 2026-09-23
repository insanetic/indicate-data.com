import type { Payload } from 'payload'

import { unstable_cache } from 'next/cache'

import { selectForLayout, selectTestimonials } from './select'
import { DEFAULT_CACHE_TAG, type Selected, type Testimonial, type TestimonialsBlockData } from './types'

export { countEligible, selectForLayout, selectTestimonials } from './select'

const POOL_REVALIDATE_SECONDS = 86400

export interface LoadPoolArgs {
  payload: Payload
  locale?: string
  /** Include drafts (site draft mode / live preview). */
  draft?: boolean
  slug?: string
  linkCollections?: string[]
}

/**
 * Loads every testimonial that may be shown, in one query. The pool is small (hundreds at most),
 * so one list per locale is cheaper than a query per block. Linked docs are reduced to slug and
 * title so a case-study link does not drag a whole page layout along.
 */
export const loadPool = async ({ payload, locale, draft = false, slug = 'testimonials', linkCollections = ['pages', 'posts'] }: LoadPoolArgs): Promise<Testimonial[]> => {
  const result = await payload.find({
    // The slug is configurable, so it cannot be typed against the site's generated collections.
    collection: slug as Parameters<Payload['find']>[0]['collection'],
    depth: 1,
    draft,
    pagination: false,
    overrideAccess: true,
    populate: Object.fromEntries(linkCollections.map((c) => [c, { slug: true, title: true }])) as never,
    ...(locale ? { locale: locale as 'all' } : {}),
    ...(draft ? {} : { where: { _status: { equals: 'published' } } }),
  })
  return result.docs as unknown as Testimonial[]
}

export interface GetTestimonialsArgs extends LoadPoolArgs {
  block: TestimonialsBlockData
  /** The page layout and this block's index in it; enables dedupe across blocks. */
  layout?: unknown[] | null
  blockIndex?: number
  now?: Date
  cacheTag?: string
  blockSlug?: string
}

/**
 * Testimonials for one block. Outside draft mode the pool is cached under the `testimonials`
 * tag (revalidated by the collection hooks) and at most a day, so an `approvedUntil` date takes
 * effect without a save. Never throws: a failure logs and renders nothing.
 */
export const getTestimonials = async (args: GetTestimonialsArgs): Promise<Selected[]> => {
  const { payload, block, layout, blockIndex, now = new Date(), draft = false, locale, cacheTag = DEFAULT_CACHE_TAG, blockSlug = 'testimonials' } = args
  const slug = args.slug || 'testimonials'
  try {
    const pool = draft
      ? await loadPool({ ...args, slug, draft: true })
      : await unstable_cache(() => loadPool({ ...args, slug, draft: false }), ['testimonials-pool', slug, locale || ''], {
          tags: [cacheTag],
          revalidate: POOL_REVALIDATE_SECONDS,
        })()
    if (layout && typeof blockIndex === 'number') {
      return selectForLayout({ layout, pool, blockSlug, now }).get(blockIndex) || []
    }
    return selectTestimonials({ pool, block, now })
  } catch (err) {
    payload.logger.error({ err }, '[testimonials] could not load testimonials')
    return []
  }
}
