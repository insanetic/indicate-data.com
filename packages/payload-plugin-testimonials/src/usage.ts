import { selectForLayout } from './select'
import { idsOf, type Id, type Reason, type Testimonial, type TestimonialsBlockData } from './types'

export interface Usage {
  collection: string
  docId: Id
  docTitle: string
  blockIndex: number
  heading: string | null
  reason: Reason
  /** False when the block references it but it is not rendered (draft, deduped). */
  shown: boolean
}

type Doc = { id: Id } & Record<string, unknown>

/** Reads a dotted path (`content.layout`) from a document. */
const getPath = (doc: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), doc)

/**
 * Where one testimonial appears: hand-picked or pinned references, plus automatic picks. Uses
 * the same selection as the site, so "auto" means "rendered there right now".
 */
export const findUsage = ({
  collection,
  docs,
  path,
  titleField = 'title',
  blockSlug,
  pool,
  testimonialId,
}: {
  collection: string
  docs: Doc[]
  /** Dotted path of the blocks field, e.g. `layout`. */
  path: string
  /** Field shown as the document's name (the collection's `useAsTitle`); falls back to the id. */
  titleField?: string
  blockSlug: string
  pool: Testimonial[]
  testimonialId: Id
}): Usage[] => {
  const target = String(testimonialId)
  const usages: Usage[] = []
  for (const doc of docs) {
    const value = getPath(doc, path)
    const layout = Array.isArray(value) ? value : []
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
      const title = doc[titleField]
      usages.push({
        collection,
        docId: doc.id,
        docTitle: typeof title === 'string' && title ? title : String(doc.id),
        blockIndex,
        heading: block.header?.heading || null,
        reason,
        shown: shownIds.includes(target),
      })
    })
  }
  return usages
}
