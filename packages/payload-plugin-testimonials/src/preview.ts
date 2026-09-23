import { countEligible, selectForLayout, selectTestimonials } from './select'
import type { Reason, Testimonial, TestimonialsBlockData } from './types'

/** A validated preview request: the block, and optionally the page layout up to and including it. */
export interface PreviewRequest {
  block: TestimonialsBlockData
  layout?: unknown[]
  blockIndex?: number
  locale?: string
}

export interface PreviewItem {
  id: Testimonial['id']
  title: string
  reason: Reason
}

type Parsed = { ok: true; request: PreviewRequest } | { ok: false; error: string }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Validates the preview endpoint's JSON body. `layout` and `blockIndex` come together, and the
 * index must point into the layout; the block is then the layout entry at that index. An unknown
 * locale falls back to the request's own, so the body cannot ask for a locale the config lacks.
 */
export const parsePreviewBody = (body: unknown, { localeCodes, fallbackLocale }: { localeCodes?: string[]; fallbackLocale?: string }): Parsed => {
  const raw = isObject(body) ? body : {}
  const locale = typeof raw.locale === 'string' && (!localeCodes || localeCodes.includes(raw.locale)) ? raw.locale : fallbackLocale
  if (raw.layout === undefined && raw.blockIndex === undefined) {
    return { ok: true, request: { block: isObject(raw.block) ? (raw.block as TestimonialsBlockData) : {}, locale } }
  }
  if (!Array.isArray(raw.layout)) return { ok: false, error: 'layout must be an array' }
  const { blockIndex, layout } = raw
  if (typeof blockIndex !== 'number' || !Number.isInteger(blockIndex) || blockIndex < 0 || blockIndex >= layout.length) {
    return { ok: false, error: 'blockIndex must be a non-negative integer below layout.length' }
  }
  const block = isObject(layout[blockIndex]) ? (layout[blockIndex] as TestimonialsBlockData) : {}
  return { ok: true, request: { block, layout, blockIndex, locale } }
}

/**
 * What the block shows, computed the way the site computes it: with a layout, earlier blocks on
 * the page are resolved first, so the automatic picks skip what they show. `matching` counts what
 * the block's own filter matches, before that dedupe.
 */
export const previewSelection = ({ pool, request, now = new Date() }: { pool: Testimonial[]; request: PreviewRequest; now?: Date }) => {
  const { block, layout, blockIndex } = request
  const selected =
    layout && typeof blockIndex === 'number'
      ? selectForLayout({ layout, pool, blockSlug: block.blockType || 'testimonials', now }).get(blockIndex) || []
      : selectTestimonials({ pool, block, now })
  const items: PreviewItem[] = selected.map(({ testimonial, reason }) => ({
    id: testimonial.id,
    title: testimonial.title || testimonial.name || String(testimonial.id),
    reason,
  }))
  return { items, matching: countEligible({ pool, block, now }) }
}
