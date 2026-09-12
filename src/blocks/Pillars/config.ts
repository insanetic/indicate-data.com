import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const Pillars: Block = {
  slug: 'pillars',
  interfaceName: 'PillarsBlock',
  labels: {
    singular: { de: 'Warum Indicate (Säulen + Kacheln)', en: 'Why Indicate (pillars + tiles)' },
    plural: { de: 'Warum-Abschnitte', en: 'Why sections' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'pillars',
      type: 'array',
      label: { de: 'Säulen (3)', en: 'Pillars (3)' },
      minRows: 1,
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/Pillars/RowLabel#PillarRowLabel' } },
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
        { name: 'text', type: 'textarea', required: true, localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    {
      name: 'tiles',
      type: 'array',
      label: { de: 'Kacheln (Zahl oder Stichwort + Link)', en: 'Tiles (number or keyword + link)' },
      maxRows: 6,
      admin: { components: { RowLabel: '@/blocks/Pillars/RowLabel#TileRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              label: { de: 'Zahl (optional, z. B. 40)', en: 'Number (optional, e.g. 40)' },
              admin: { width: '25%', description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
            {
              name: 'suffix',
              type: 'text',
              label: { de: 'Zusatz (z. B. %)', en: 'Suffix (e.g. %)' },
              admin: { width: '20%' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Beschriftung', en: 'Label' },
              admin: { width: '55%' },
            },
          ],
        },
        linkGroup({
          appearances: ['link'],
          localized: true,
          overrides: { maxRows: 1, label: { de: 'Link (optional)', en: 'Link (optional)' } },
        }),
      ],
    },
    sectionSettings(),
  ],
}
