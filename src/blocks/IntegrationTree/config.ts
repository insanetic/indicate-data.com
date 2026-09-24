import type { Block } from 'payload'

import { sectionSettings } from '@/fields/sectionSettings'

/**
 * The lit integration tree. Its tiles are the systems of the groups below; a system without an
 * uploaded logo takes the mark from the connector catalogue.
 */
export const IntegrationTree: Block = {
  slug: 'integrationTree',
  // The default table names run past Postgres' 63 characters on the version tables
  // (`_pages_v_blocks_integration_tree_groups_items_logo_id_media_id_fk`). A string replaces the
  // whole name; versions become `_pages_blocks_int_tree_v`. Only the Pages layout uses this block.
  dbName: 'pages_blocks_int_tree',
  interfaceName: 'IntegrationTreeBlock',
  labels: {
    singular: { de: 'Integrations-Grafik', en: 'Integration tree' },
    plural: { de: 'Integrations-Grafiken', en: 'Integration trees' },
  },
  fields: [
    {
      name: 'groups',
      type: 'array',
      label: { de: 'Gruppen (z. B. PMS, Marketing)', en: 'Groups (e.g. PMS, marketing)' },
      labels: { singular: { de: 'Gruppe', en: 'Group' }, plural: { de: 'Gruppen', en: 'Groups' } },
      maxRows: 6,
      admin: { components: { RowLabel: '@/blocks/IntegrationTree/RowLabel#GroupRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Gruppentitel', en: 'Group title' } },
        {
          name: 'items',
          type: 'array',
          label: { de: 'Systeme', en: 'Systems' },
          maxRows: 12,
          admin: { components: { RowLabel: '@/blocks/IntegrationTree/RowLabel#ItemRowLabel' } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '60%' } },
                { name: 'logo', type: 'upload', relationTo: 'media', label: { de: 'Logo (optional)', en: 'Logo (optional)' }, admin: { width: '40%' } },
              ],
            },
          ],
        },
      ],
    },
    sectionSettings(),
  ],
}
