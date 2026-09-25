import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

/** Text, up to four points and two actions beside a scene. The only composite section block. */
export const Split: Block = {
  slug: 'split',
  interfaceName: 'SplitBlock',
  labels: {
    singular: { de: 'Text neben Szene', en: 'Text beside scene' },
    plural: { de: 'Text neben Szene', en: 'Text beside scene' },
  },
  fields: [
    sectionHeader({ optionalHeading: true, withAlign: false }),
    {
      name: 'mediaSide',
      type: 'radio',
      defaultValue: 'right',
      label: { de: 'Szene', en: 'Scene' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
        { label: { de: 'Links', en: 'Left' }, value: 'left' },
      ],
    },
    visual({ defaultIllustration: 'builder' }),
    {
      name: 'points',
      type: 'array',
      label: { de: 'Punkte (max. 4)', en: 'Points (max. 4)' },
      labels: { singular: { de: 'Punkt', en: 'Point' }, plural: { de: 'Punkte', en: 'Points' } },
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/Items/RowLabel#ItemRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            iconSelect({ admin: { width: '25%' } }),
            { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Titel', en: 'Title' }, admin: { width: '75%' } },
          ],
        },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text (1–2 Sätze)', en: 'Text (1–2 sentences)' } },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Aktionen (max. 2)', en: 'Actions (max. 2)' } },
    }),
    sectionSettings(),
  ],
}
