import type { Block } from 'payload'

import { link } from '@/fields/link'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * The searchable connector directory. The list itself is not edited here: it comes from
 * `src/integrations` (static today, the marketplace endpoint later). The marketer edits the
 * heading and where "request an integration" leads.
 */
export const IntegrationDirectory: Block = {
  slug: 'integrationDirectory',
  interfaceName: 'IntegrationDirectoryBlock',
  labels: {
    singular: { de: 'Integrations-Verzeichnis (durchsuchbar)', en: 'Integration directory (searchable)' },
    plural: { de: 'Integrations-Verzeichnisse', en: 'Integration directories' },
  },
  fields: [
    sectionHeader({ optionalHeading: true }),
    {
      name: 'request',
      type: 'group',
      label: { de: 'Integration anfragen', en: 'Request an integration' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { de: 'Titel', en: 'Title' },
          defaultValue: 'Ihr System fehlt?',
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { de: 'Text', en: 'Text' },
        },
        link({ appearances: false, localized: true }),
      ],
    },
    sectionSettings(),
  ],
}
