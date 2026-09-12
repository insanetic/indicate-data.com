import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: {
    singular: { de: 'Kennzahlen-Leiste', en: 'Stats strip' },
    plural: { de: 'Kennzahlen-Leisten', en: 'Stats strips' },
  },
  fields: [
    sectionHeader({ optionalHeading: true }),
    {
      name: 'items',
      type: 'array',
      label: { de: 'Kennzahlen', en: 'Stats' },
      labels: { singular: { de: 'Kennzahl', en: 'Stat' }, plural: { de: 'Kennzahlen', en: 'Stats' } },
      minRows: 2,
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/Stats/RowLabel#StatRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, label: { de: 'Wert (z. B. 40)', en: 'Value (e.g. 40)' }, admin: { width: '30%' } },
            { name: 'suffix', type: 'text', label: { de: 'Zusatz (z. B. %, +)', en: 'Suffix (e.g. %, +)' }, admin: { width: '20%' } },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Beschriftung', en: 'Label' },
              admin: { width: '50%' },
            },
          ],
        },
        { name: 'note', type: 'text', localized: true, label: { de: 'Quelle / Hinweis (optional)', en: 'Source / note (optional)' } },
      ],
    },
    sectionSettings({ defaultBackground: 'tinted' }),
  ],
}
