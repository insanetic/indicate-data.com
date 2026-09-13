import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: { de: 'Hero (Seitenanfang)', en: 'Hero (page top)' },
    plural: { de: 'Heros', en: 'Heroes' },
  },
  fields: [
    sectionHeader(),
    linkGroup({
      appearances: ['default', 'outline', 'ghost', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Buttons (max. 2)', en: 'Buttons (max. 2)' } },
    }),
    {
      name: 'trust',
      type: 'group',
      label: { de: 'Vertrauenszeile unter den Buttons', en: 'Trust line below the buttons' },
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
          label: { de: 'Text', en: 'Text' },
        },
        {
          name: 'logos',
          type: 'array',
          label: { de: 'Kundenlogos', en: 'Customer logos' },
          maxRows: 6,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '50%' } },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: { de: 'Logo (optional, sonst Text)', en: 'Logo (optional, otherwise text)' },
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    visual({ defaultIllustration: 'stage' }),
    sectionSettings(),
  ],
}
