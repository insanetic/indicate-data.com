import { selectForLayout } from './select'
import { idsOf, type Id, type Reason, type Testimonial, type TestimonialsBlockData } from './types'

export interface Usage {
  docId: Id
  docTitle: string
  blockIndex: number
  heading: string | null
  reason: Reason
  /** False when the block references it but it is not rendered (draft, deduped). */
  shown: boolean
}

type Doc = { id: Id; title?: string | null } & Record<string, unknown>

/**
 * Where one testimonial appears: hand-picked or pinned references, plus automatic picks. Uses
 * the same selection as the site, so "auto" means "rendered there right now".
 */
export const findUsage = ({
  docs,
  field,
  blockSlug,
  pool,
  testimonialId,
}: {
  docs: Doc[]
  field: string
  blockSlug: string
  pool: Testimonial[]
  testimonialId: Id
}): Usage[] => {
  const target = String(testimonialId)
  const usages: Usage[] = []
  for (const doc of docs) {
    const layout = (doc[field] as unknown[] | null | undefined) || []
    const selected = selectForLayout({ layout, pool, blockSlug })
    layout.forEach((raw, blockIndex) => {
      const block = raw as TestimonialsBlockData & { header?: { heading?: string | null } }
      if (block?.blockType !== blockSlug) return
      const shownIds = (selected.get(blockIndex) || []).map((s) => String(s.testimonial.id))
      const reason: Reason | null =
        block.mode === 'manual'
          ? idsOf(block.testimonials).includes(target) ? 'manual' : null
          : idsOf(block.pinned).includes(target) ? 'pinned' : shownIds.includes(target) ? 'auto' : null
      if (!reason) return
      usages.push({
        docId: doc.id,
        docTitle: doc.title || String(doc.id),
        blockIndex,
        heading: block.header?.heading || null,
        reason,
        shown: shownIds.includes(target),
      })
    })
  }
  return usages
}
