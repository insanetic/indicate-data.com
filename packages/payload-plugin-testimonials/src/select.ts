import { score } from './hash'
import { DEFAULT_COUNT, MAX_COUNT, idOf, idsOf, type Selected, type Testimonial, type TestimonialsBlockData } from './types'

const matchesTags = (t: Testimonial, block: TestimonialsBlockData) => {
  const wanted = idsOf(block.tags)
  if (wanted.length === 0) return true
  const has = new Set(idsOf(t.tags))
  return block.tagMatch === 'all' ? wanted.every((id) => has.has(id)) : wanted.some((id) => has.has(id))
}

const clampCount = (count: number | null | undefined) =>
  Math.min(MAX_COUNT, Math.max(1, typeof count === 'number' && Number.isFinite(count) ? Math.round(count) : DEFAULT_COUNT))

const seedOf = (block: TestimonialsBlockData) => block.seed || block.id || ''

interface Args {
  pool: Testimonial[]
  block: TestimonialsBlockData
  /** Ids shown by earlier blocks on the same page; automatic picks skip them, pinned ones do not. */
  alreadyShown?: Set<string>
}

/** In the pool, not excluded and matching the block's tags. */
const eligible = ({ pool, block }: Args) => {
  const excluded = new Set(idsOf(block.exclude))
  return pool.filter((t) => !excluded.has(String(t.id)) && matchesTags(t, block))
}

/** Number of testimonials matching the block's filter (for the admin hint). */
export const countEligible = (args: Args): number => eligible(args).length

/**
 * Picks the testimonials a block shows. Pure: the site, the admin preview and the usage
 * endpoint all call this, so they always agree. The pool must already hold only what may be
 * shown (published, or drafts in preview); deleted or unpublished ids are simply not found.
 *
 * Pinned means "always show": an eligible pinned testimonial appears even when an earlier block
 * on the page already shows it. `alreadyShown` only keeps automatic picks from repeating.
 */
export const selectTestimonials = (args: Args): Selected[] => {
  const { pool, block, alreadyShown = new Set<string>() } = args
  const byId = new Map(pool.map((t) => [String(t.id), t]))

  if (block.mode === 'manual') {
    return idsOf(block.testimonials)
      .map((id) => byId.get(id))
      .filter((t): t is Testimonial => Boolean(t))
      .map((testimonial) => ({ testimonial, reason: 'manual' as const }))
  }

  const count = clampCount(block.count)
  const matching = eligible({ pool, block })
  const matchingIds = new Set(matching.map((t) => String(t.id)))

  const pinned = idsOf(block.pinned)
    .filter((id) => matchingIds.has(id))
    .slice(0, count)
    .map((id) => ({ testimonial: byId.get(id) as Testimonial, reason: 'pinned' as const }))
  const taken = new Set(pinned.map((p) => String(p.testimonial.id)))

  const seed = seedOf(block)
  const rest = matching
    .filter((t) => !taken.has(String(t.id)) && !alreadyShown.has(String(t.id)))
    .map((t) => ({ t, s: score(seed, String(t.id)) }))
    .sort((a, b) => b.s - a.s || String(a.t.id).localeCompare(String(b.t.id)))
    .slice(0, count - pinned.length)
    .map(({ t }) => ({ testimonial: t, reason: 'auto' as const }))

  return [...pinned, ...rest]
}

/**
 * Resolves every testimonials block of a page layout in order, so a later block's automatic
 * picks do not repeat what an earlier block already shows (pinned ones still appear). Keys are
 * layout indexes.
 */
export const selectForLayout = ({
  layout,
  pool,
  blockSlug = 'testimonials',
}: {
  layout: unknown[] | null | undefined
  pool: Testimonial[]
  blockSlug?: string
}): Map<number, Selected[]> => {
  const result = new Map<number, Selected[]>()
  const shown = new Set<string>()
  ;(layout || []).forEach((raw, index) => {
    const block = raw as TestimonialsBlockData
    if (block?.blockType !== blockSlug) return
    const selected = selectTestimonials({ pool, block, alreadyShown: shown })
    for (const s of selected) shown.add(String(s.testimonial.id))
    result.set(index, selected)
  })
  return result
}

export { idOf }
