import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

/**
 * One feature or audience told as a story: heading and lead on one side, an animated product
 * scene (or an uploaded image) on the other, plus up to four short points and a link.
 * Used for the "build", "flying KPIs", "hotels" and "agencies" sections; reusable on any page.
 */
export const FeatureStory: Block = {
  slug: 'featureStory',
  interfaceName: 'FeatureStoryBlock',
  labels: {
    singular: { de: 'Feature-Story (Text + Szene)', en: 'Feature story (text + scene)' },
    plural: { de: 'Feature-Stories', en: 'Feature stories' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'layout',
      type: 'radio',
      defaultValue: 'stacked',
      label: { de: 'Anordnung', en: 'Layout' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Überschrift, breite Szene, Punkte darunter', en: 'Heading, wide scene, points below' }, value: 'stacked' },
        { label: { de: 'Text links, Szene rechts', en: 'Text left, scene right' }, value: 'visual-right' },
        { label: { de: 'Szene links, Text rechts', en: 'Scene left, text right' }, value: 'visual-left' },
      ],
    },
    visual({ defaultIllustration: 'builder' }),
    {
      name: 'points',
      type: 'array',
      label: { de: 'Punkte (max. 4)', en: 'Points (max. 4)' },
      labels: { singular: { de: 'Punkt', en: 'Point' }, plural: { de: 'Punkte', en: 'Points' } },
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/FeatureStory/RowLabel#PointRowLabel' } },
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
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text (1–2 Sätze)', en: 'Text (1–2 sentences)' } },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Links (max. 2)', en: 'Links (max. 2)' } },
    }),
    sectionSettings(),
  ],
}
