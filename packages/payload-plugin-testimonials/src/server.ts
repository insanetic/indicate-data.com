import type { Payload } from 'payload'

import { unstable_cache } from 'next/cache'

import { selectForLayout, selectTestimonials } from './select'
import { getPluginOptions, type Selected, type Testimonial, type TestimonialsBlockData } from './types'

export { countEligible, selectForLayout, selectTestimonials } from './select'

export interface LoadPoolArgs {
  payload: Payload
  locale?: string
  /** Include drafts (site draft mode / live preview). */
  draft?: boolean
}

/**
 * Loads every testimonial that may be shown, in one query. The pool is small (hundreds at most),
 * so one list per locale is cheaper than a query per block. Linked docs are reduced to slug and
 * title so a case-study link does not drag a whole page layout along. The internal note is left
 * out: the pool is cached and rendered, and the note is never meant to leave the admin.
 * Slugs come from the plugin's options in `payload.config`.
 */
export const loadPool = async ({ payload, locale, draft = false }: LoadPoolArgs): Promise<Testimonial[]> => {
  const { slugs, linkCollections } = getPluginOptions(payload)
  const result = await payload.find({
    // The slug is configurable, so it cannot be typed against the site's generated collections.
    collection: slugs.testimonials as Parameters<Payload['find']>[0]['collection'],
    depth: 1,
    draft,
    pagination: false,
    overrideAccess: true,
    populate: Object.fromEntries(linkCollections.map((c) => [c, { slug: true, title: true }])) as never,
    select: { internalNote: false } as never,
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
}

/**
 * Testimonials for one block. Outside draft mode the pool is cached under the plugin's cache tag,
 * which the collection hooks revalidate when a testimonial or tag is saved or deleted. Never
 * throws: a failure logs and renders nothing.
 */
export const getTestimonials = async (args: GetTestimonialsArgs): Promise<Selected[]> => {
  const { payload, block, layout, blockIndex, draft = false, locale } = args
  try {
    const { slugs, linkCollections, cacheTag } = getPluginOptions(payload)
    const pool = draft
      ? await loadPool({ payload, locale, draft: true })
      : // Different link collections populate different fields, so they get their own cache entry.
        await unstable_cache(() => loadPool({ payload, locale, draft: false }), ['testimonials-pool', slugs.testimonials, locale || '', linkCollections.join(',')], {
          tags: [cacheTag],
        })()
    if (layout && typeof blockIndex === 'number') {
      const own = layout[blockIndex] as TestimonialsBlockData | undefined
      return selectForLayout({ layout, pool, blockSlug: own?.blockType || block.blockType || 'testimonials' }).get(blockIndex) || []
    }
    return selectTestimonials({ pool, block })
  } catch (err) {
    payload.logger.error({ err }, '[testimonials] could not load testimonials')
    return []
  }
}
