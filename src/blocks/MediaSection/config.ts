import type { Block } from 'payload'

import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

/** A built-in illustration or an uploaded image, full container width or narrow and centred. */
export const MediaSection: Block = {
  slug: 'media',
  interfaceName: 'MediaSectionBlock',
  labels: {
    singular: { de: 'Bild / Szene', en: 'Media / scene' },
    plural: { de: 'Bilder / Szenen', en: 'Media / scenes' },
  },
  fields: [
    visual({ defaultIllustration: 'dashboard' }),
    {
      name: 'width',
      type: 'radio',
      defaultValue: 'full',
      label: { de: 'Breite', en: 'Width' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Volle Breite', en: 'Full width' }, value: 'full' },
        { label: { de: 'Schmal, mittig', en: 'Narrow, centred' }, value: 'narrow' },
      ],
    },
    sectionSettings(),
  ],
}
