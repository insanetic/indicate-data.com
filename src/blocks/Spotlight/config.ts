import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * A promotional box for one thing (Resi): heading, a sentence, up to two links, framed by
 * the travelling gradient border. `banner` is the tall home page version with the mark and
 * the animated aura; `compact` is one row for a cross-reference on a subpage.
 */
export const Spotlight: Block = {
  slug: 'spotlight',
  interfaceName: 'SpotlightBlock',
  labels: {
    singular: { de: 'Spotlight (Resi-Banner)', en: 'Spotlight (Resi banner)' },
    plural: { de: 'Spotlights', en: 'Spotlights' },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'banner',
          label: { de: 'Darstellung', en: 'Layout' },
          admin: { width: '50%' },
          options: [
            { label: { de: 'Banner (groß, mit Mark)', en: 'Banner (large, with mark)' }, value: 'banner' },
            { label: { de: 'Kompakt (eine Zeile)', en: 'Compact (one row)' }, value: 'compact' },
          ],
        },
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: { de: 'Kleine Zeile über der Überschrift', en: 'Eyebrow (small line above)' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: { de: 'Überschrift (z. B. „Sag hallo zu Resi.“)', en: 'Heading (e.g. “Meet Resi.”)' },
    },
    {
      name: 'text',
      type: 'textarea',
      localized: true,
      label: { de: 'Text (1–2 Sätze)', en: 'Text (1–2 sentences)' },
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Links (max. 2)', en: 'Links (max. 2)' } },
    }),
    sectionSettings(),
  ],
}
