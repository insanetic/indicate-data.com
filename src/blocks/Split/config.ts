import type { Block, Condition } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

const inStepsMode: Condition = (_data, _siblingData, { blockData }) => (blockData as { pointStyle?: string } | undefined)?.pointStyle === 'steps'

/** Text, up to four points or numbered steps, and two actions beside a scene. The only composite section block. */
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
      name: 'pointStyle',
      type: 'select',
      defaultValue: 'points',
      label: { de: 'Darstellung der Punkte', en: 'Point style' },
      admin: { description: { de: 'Schritte: nummeriert, die Szene wechselt beim Scrollen zum Schritt.', en: 'Steps: numbered, the scene follows the step in view while scrolling.' } },
      options: [
        { label: { de: 'Punkte', en: 'Points' }, value: 'points' },
        { label: { de: 'Schritte (nummeriert)', en: 'Steps (numbered)' }, value: 'steps' },
      ],
    },
    {
      name: 'points',
      type: 'array',
      label: { de: 'Punkte oder Schritte (max. 4)', en: 'Points or steps (max. 4)' },
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
        {
          name: 'ownVisual',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Eigene Szene für diesen Schritt', en: 'Own scene for this step' },
          admin: { condition: inStepsMode },
        },
        visual({
          overrides: {
            admin: {
              condition: (data, siblingData, ctx) => Boolean(inStepsMode(data, siblingData, ctx) && siblingData?.ownVisual),
            },
          },
        }),
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
