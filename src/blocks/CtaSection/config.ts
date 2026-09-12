import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const CtaSection: Block = {
  slug: 'ctaSection',
  interfaceName: 'CtaSectionBlock',
  labels: {
    singular: { de: 'Handlungsaufruf (großer Abschluss)', en: 'Call to action (closing section)' },
    plural: { de: 'Handlungsaufrufe', en: 'Calls to action' },
  },
  fields: [
    sectionHeader(),
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Buttons (max. 2)', en: 'Buttons (max. 2)' } },
    }),
    {
      name: 'note',
      type: 'text',
      localized: true,
      label: { de: 'Kleine Zeile unter den Buttons', en: 'Small line below the buttons' },
    },
    sectionSettings({ defaultBackground: 'dark' }),
  ],
}
