import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const LogoWall: Block = {
  slug: 'logoWall',
  interfaceName: 'LogoWallBlock',
  labels: {
    singular: { de: 'Logo-Leiste (Kunden)', en: 'Logo wall (customers)' },
    plural: { de: 'Logo-Leisten', en: 'Logo walls' },
  },
  fields: [
    sectionHeader({ optionalHeading: true }),
    {
      name: 'display',
      type: 'radio',
      defaultValue: 'marquee',
      label: { de: 'Darstellung', en: 'Display' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Laufband', en: 'Marquee' }, value: 'marquee' },
        { label: { de: 'Raster', en: 'Grid' }, value: 'grid' },
      ],
    },
    {
      name: 'logos',
      type: 'array',
      label: { de: 'Logos', en: 'Logos' },
      labels: { singular: { de: 'Logo', en: 'Logo' }, plural: { de: 'Logos', en: 'Logos' } },
      minRows: 1,
      maxRows: 24,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '40%' } },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Logo (optional, sonst Text)', en: 'Logo (optional, otherwise text)' },
              admin: { width: '30%' },
            },
            { name: 'url', type: 'text', label: 'URL', admin: { width: '30%' } },
          ],
        },
      ],
    },
    sectionSettings({ defaultBackground: 'default' }),
  ],
}
