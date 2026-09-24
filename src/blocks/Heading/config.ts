import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * Eyebrow, heading and lead with up to two actions. Opens a section: media, items and actions
 * placed below it continue that section (see `resolveSpacing`).
 */
export const Heading: Block = {
  slug: 'heading',
  interfaceName: 'HeadingBlock',
  labels: {
    singular: { de: 'Überschrift', en: 'Heading' },
    plural: { de: 'Überschriften', en: 'Headings' },
  },
  fields: [
    sectionHeader({
      optionalHeading: true,
      overrides: {
        admin: {
          description: {
            de: 'Links: Überschrift links, Einleitung rechts. Rechts: gespiegelt. Zentriert: alles mittig untereinander.',
            en: 'Left: heading left, lead right. Right: mirrored. Centred: everything stacked in the middle.',
          },
        },
      },
    }),
    {
      name: 'size',
      type: 'radio',
      defaultValue: 'h2',
      label: { de: 'Größe', en: 'Size' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Normal', en: 'Normal' }, value: 'h2' },
        { label: { de: 'Groß (Abschluss)', en: 'Large (closing)' }, value: 'display' },
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
