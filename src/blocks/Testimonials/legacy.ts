import type { Selected } from '@subneo/payload-testimonials'

import type { TestimonialsBlock } from '@/payload-types'

/**
 * Blocks saved before testimonials became central keep their quotes inline until
 * `scripts/convert-testimonials.ts` runs. Render those instead of an automatic pick, so the
 * deploy order (schema first, conversion second) never changes what a page shows.
 */
export const legacySelection = (block: TestimonialsBlock): Selected[] | null => {
  const inline = (block.items || []).filter((i) => i.quote && i.name)
  if (inline.length === 0 || (block.testimonials || []).length > 0) return null
  return inline.map((i, index) => ({
    testimonial: { id: i.id || `legacy-${index}`, quote: i.quote, name: i.name, role: i.role, company: i.company, avatar: i.avatar, logo: i.logo },
    reason: 'manual',
  }))
}
