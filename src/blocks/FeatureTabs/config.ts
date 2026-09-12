import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

export const FeatureTabs: Block = {
  slug: 'featureTabs',
  interfaceName: 'FeatureTabsBlock',
  labels: {
    singular: { de: 'Produkt-Tabs', en: 'Product tabs' },
    plural: { de: 'Produkt-Tabs', en: 'Product tabs' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'tabs',
      type: 'array',
      label: { de: 'Tabs', en: 'Tabs' },
      labels: { singular: { de: 'Tab', en: 'Tab' }, plural: { de: 'Tabs', en: 'Tabs' } },
      minRows: 2,
      maxRows: 5,
      admin: { components: { RowLabel: '@/blocks/FeatureTabs/RowLabel#TabRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Tab-Beschriftung', en: 'Tab label' },
              admin: { width: '70%' },
            },
            iconSelect({ admin: { width: '30%' } }),
          ],
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          localized: true,
          label: { de: 'Überschrift', en: 'Heading' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { de: 'Beschreibung', en: 'Description' },
        },
        {
          name: 'points',
          type: 'array',
          label: { de: 'Vorteile (max. 4)', en: 'Benefits (max. 4)' },
          maxRows: 4,
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
            { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
          ],
        },
        visual({ defaultIllustration: 'dashboard' }),
        linkGroup({
          appearances: ['link', 'outline'],
          localized: true,
          overrides: { maxRows: 1, label: { de: 'Link (optional)', en: 'Link (optional)' } },
        }),
      ],
    },
    sectionSettings(),
  ],
}
