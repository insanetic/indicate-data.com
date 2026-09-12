import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: { de: 'Kundenstimmen', en: 'Testimonials' },
    plural: { de: 'Kundenstimmen-Abschnitte', en: 'Testimonial sections' },
  },
  fields: [
    sectionHeader({ optionalHeading: true }),
    {
      name: 'items',
      type: 'array',
      label: { de: 'Zitate', en: 'Quotes' },
      labels: { singular: { de: 'Zitat', en: 'Quote' }, plural: { de: 'Zitate', en: 'Quotes' } },
      minRows: 1,
      maxRows: 6,
      admin: { components: { RowLabel: '@/blocks/Testimonials/RowLabel#QuoteRowLabel' } },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          localized: true,
          label: { de: 'Zitat', en: 'Quote' },
        },
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '34%' } },
            { name: 'role', type: 'text', localized: true, label: { de: 'Rolle', en: 'Role' }, admin: { width: '33%' } },
            { name: 'company', type: 'text', label: { de: 'Unternehmen', en: 'Company' }, admin: { width: '33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Foto (optional)', en: 'Photo (optional)' },
              admin: { width: '50%' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Firmenlogo (optional)', en: 'Company logo (optional)' },
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    sectionSettings(),
  ],
}
