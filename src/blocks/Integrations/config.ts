import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

export const Integrations: Block = {
  slug: 'integrations',
  interfaceName: 'IntegrationsBlock',
  labels: {
    singular: { de: 'Integrationen', en: 'Integrations' },
    plural: { de: 'Integrations-Abschnitte', en: 'Integration sections' },
  },
  fields: [
    sectionHeader(),
    visual({ defaultIllustration: 'integrations' }),
    {
      name: 'groups',
      type: 'array',
      label: { de: 'Gruppen (z. B. PMS, Marketing)', en: 'Groups (e.g. PMS, marketing)' },
      labels: { singular: { de: 'Gruppe', en: 'Group' }, plural: { de: 'Gruppen', en: 'Groups' } },
      maxRows: 6,
      admin: { components: { RowLabel: '@/blocks/Integrations/RowLabel#GroupRowLabel' } },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: { de: 'Gruppentitel', en: 'Group title' },
        },
        {
          name: 'items',
          type: 'array',
          label: { de: 'Systeme', en: 'Systems' },
          maxRows: 12,
          admin: { components: { RowLabel: '@/blocks/Integrations/RowLabel#ItemRowLabel' } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '60%' } },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: { de: 'Logo (optional)', en: 'Logo (optional)' },
                  admin: { width: '40%' },
                },
              ],
            },
          ],
        },
      ],
    },
    linkGroup({
      appearances: ['link', 'outline'],
      localized: true,
      overrides: { maxRows: 1, label: { de: 'Link zu allen Integrationen (optional)', en: 'Link to all integrations (optional)' } },
    }),
    sectionSettings({ defaultBackground: 'tinted' }),
  ],
}
