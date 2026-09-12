import type { ArrayField, Field } from 'payload'

import type { LinkAppearances } from './link'

import deepMerge from '@/utilities/deepMerge'
import { link } from './link'

type LinkGroupType = (options?: {
  appearances?: LinkAppearances[] | false
  localized?: boolean
  overrides?: Partial<ArrayField>
}) => Field

export const linkGroup: LinkGroupType = ({ appearances, localized, overrides = {} } = {}) => {
  const generatedLinkGroup: Field = {
    name: 'links',
    type: 'array',
    labels: { singular: { de: 'Link', en: 'Link' }, plural: { de: 'Links', en: 'Links' } },
    fields: [
      link({
        appearances,
        localized,
      }),
    ],
    admin: {
      initCollapsed: true,
    },
  }

  return deepMerge(generatedLinkGroup, overrides)
}
