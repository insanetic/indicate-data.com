import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'
import { illustrationOptions, type IllustrationKey } from '@/components/Illustrations/registry'

type Options = {
  defaultIllustration?: IllustrationKey
  overrides?: Partial<GroupField>
}

/**
 * Lets the marketer choose a code-built illustration by name, or upload an image instead.
 * Rendered by `<Visual>`.
 */
export const visual = ({ defaultIllustration = 'dashboard', overrides = {} }: Options = {}): Field => {
  const field: GroupField = {
    name: 'visual',
    type: 'group',
    label: { de: 'Bild', en: 'Visual' },
    fields: [
      {
        name: 'type',
        type: 'radio',
        defaultValue: 'illustration',
        admin: { layout: 'horizontal' },
        label: { de: 'Art', en: 'Type' },
        options: [
          { label: { de: 'Illustration (eingebaut)', en: 'Illustration (built in)' }, value: 'illustration' },
          { label: { de: 'Eigenes Bild', en: 'Uploaded image' }, value: 'image' },
        ],
      },
      {
        name: 'illustration',
        type: 'select',
        defaultValue: defaultIllustration,
        label: { de: 'Illustration', en: 'Illustration' },
        options: [...illustrationOptions],
        admin: { condition: (_, siblingData) => siblingData?.type !== 'image' },
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: { de: 'Bild', en: 'Image' },
        admin: { condition: (_, siblingData) => siblingData?.type === 'image' },
      },
    ],
  }
  return deepMerge(field, overrides)
}
