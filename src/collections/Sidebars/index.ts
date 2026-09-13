import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { link } from '@/fields/link'

/**
 * Grouped link lists shown beside long documents (legal, help, company). A page's
 * `document` block picks one; several pages share the same sidebar.
 */
export const Sidebars: CollectionConfig<'sidebars'> = {
  slug: 'sidebars',
  labels: { singular: { de: 'Seitenleiste', en: 'Sidebar' }, plural: { de: 'Seitenleisten', en: 'Sidebars' } },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: { de: 'Website', en: 'Site' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { de: 'Interner Name (z. B. Rechtliches)', en: 'Internal name (e.g. Legal)' },
    },
    {
      name: 'groups',
      type: 'array',
      label: { de: 'Gruppen', en: 'Groups' },
      labels: { singular: { de: 'Gruppe', en: 'Group' }, plural: { de: 'Gruppen', en: 'Groups' } },
      minRows: 1,
      maxRows: 8,
      admin: { components: { RowLabel: '@/collections/Sidebars/RowLabel#GroupRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Gruppentitel', en: 'Group title' } },
        {
          name: 'links',
          type: 'array',
          label: { de: 'Links', en: 'Links' },
          maxRows: 12,
          admin: { components: { RowLabel: '@/collections/Sidebars/RowLabel#LinkRowLabel' } },
          fields: [link({ appearances: false, localized: true })],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: { de: 'Kontaktkarte am Ende', en: 'Contact card at the end' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: { de: 'Anzeigen', en: 'Show' } },
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
        { name: 'email', type: 'email', label: 'E-Mail' },
      ],
    },
  ],
}
