import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: {
    singular: { de: 'Karten-Raster', en: 'Card grid' },
    plural: { de: 'Karten-Raster', en: 'Card grids' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid-4',
      label: { de: 'Anordnung', en: 'Layout' },
      options: [
        { label: { de: 'Drei Spalten', en: 'Three columns' }, value: 'grid-3' },
        { label: { de: 'Vier Spalten', en: 'Four columns' }, value: 'grid-4' },
        { label: { de: 'Bento (große + kleine Karten)', en: 'Bento (large + small cards)' }, value: 'bento' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: { de: 'Karten', en: 'Cards' },
      labels: { singular: { de: 'Karte', en: 'Card' }, plural: { de: 'Karten', en: 'Cards' } },
      minRows: 1,
      maxRows: 8,
      admin: { components: { RowLabel: '@/blocks/CardGrid/RowLabel#CardRowLabel' } },
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
              admin: { width: '50%' },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'sm',
              label: { de: 'Größe (nur Bento)', en: 'Size (bento only)' },
              admin: { width: '25%' },
              options: [
                { label: { de: 'Klein', en: 'Small' }, value: 'sm' },
                { label: { de: 'Groß', en: 'Large' }, value: 'lg' },
              ],
            },
          ],
        },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
        {
          name: 'points',
          type: 'array',
          label: { de: 'Stichpunkte (optional)', en: 'Bullet points (optional)' },
          maxRows: 5,
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: { de: 'Punkt', en: 'Point' } }],
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
