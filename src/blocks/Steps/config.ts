import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const Steps: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: {
    singular: { de: 'Schritte (So funktioniert es)', en: 'Steps (how it works)' },
    plural: { de: 'Schritt-Abschnitte', en: 'Step sections' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'steps',
      type: 'array',
      label: { de: 'Schritte', en: 'Steps' },
      labels: { singular: { de: 'Schritt', en: 'Step' }, plural: { de: 'Schritte', en: 'Steps' } },
      minRows: 2,
      maxRows: 5,
      admin: { components: { RowLabel: '@/blocks/Steps/RowLabel#StepRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            iconSelect({ admin: { width: '25%' } }),
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel', en: 'Title' },
              admin: { width: '75%' },
            },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          required: true,
          localized: true,
          label: { de: 'Text', en: 'Text' },
        },
      ],
    },
    sectionSettings(),
  ],
}
