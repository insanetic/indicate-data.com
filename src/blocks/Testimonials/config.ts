import type { Field } from 'payload'

import { createTestimonialsBlock } from '@subneo/payload-testimonials'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * The quotes this block stored inline before testimonials became central. Kept (hidden) so the
 * dev schema push stays additive; `scripts/convert-testimonials.ts` moves them into the
 * collection. Drop in a later, separate change.
 */
const legacyInlineItems: Field = {
  name: 'items',
  type: 'array',
  admin: { hidden: true },
  fields: [
    { name: 'quote', type: 'textarea', localized: true },
    { name: 'name', type: 'text' },
    { name: 'role', type: 'text', localized: true },
    { name: 'company', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
  ],
}

/** Central testimonials, wrapped in this site's section header and settings. */
export const Testimonials = createTestimonialsBlock({
  localized: true,
  before: [sectionHeader({ optionalHeading: true })],
  after: [sectionSettings()],
  extraFields: [legacyInlineItems],
})
