import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionSettings } from '@/fields/sectionSettings'

/** One or two buttons or links on their own row, e.g. under the points of a section. */
export const Actions: Block = {
  slug: 'actions',
  interfaceName: 'ActionsBlock',
  labels: {
    singular: { de: 'Aktionen (Buttons / Links)', en: 'Actions (buttons / links)' },
    plural: { de: 'Aktionen', en: 'Actions' },
  },
  fields: [
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { minRows: 1, maxRows: 2, label: { de: 'Aktionen (max. 2)', en: 'Actions (max. 2)' } },
    }),
    {
      name: 'align',
      type: 'radio',
      defaultValue: 'left',
      label: { de: 'Ausrichtung', en: 'Alignment' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Links', en: 'Left' }, value: 'left' },
        { label: { de: 'Zentriert', en: 'Centred' }, value: 'center' },
        { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
      ],
    },
    sectionSettings(),
  ],
}
