import type { Block } from 'payload'
import {
  BlockquoteFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

// `sectionSettings()` defaults `spacing` to `'default'`. This block draws its own vertical
// rhythm (its header band is tinted), so the default is mutated to `'none'` here instead of
// passing an override through `sectionSettings({ overrides: ... })`.
const settings = sectionSettings()
if (settings.type === 'group') {
  const row = settings.fields[0]
  if (row.type === 'row') {
    const spacing = row.fields.find((f) => 'name' in f && f.name === 'spacing')
    if (spacing && spacing.type === 'select') spacing.defaultValue = 'none'
  }
}

/** Long-form text page (terms, privacy, imprint, help article) with sidebar, dates and TOC. */
export const Document: Block = {
  slug: 'document',
  interfaceName: 'DocumentBlock',
  labels: {
    singular: { de: 'Dokument mit Seitenleiste', en: 'Document with sidebar' },
    plural: { de: 'Dokumente', en: 'Documents' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'sidebar',
      type: 'relationship',
      relationTo: 'sidebars',
      label: { de: 'Seitenleiste (optional)', en: 'Sidebar (optional)' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'meta',
          type: 'group',
          label: { de: 'Stand', en: 'Dates' },
          admin: { hideGutter: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'lastUpdated', type: 'date', label: { de: 'Stand (zuletzt geändert)', en: 'Last updated' }, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                { name: 'effectiveFrom', type: 'date', label: { de: 'Gültig ab', en: 'Effective from' }, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                { name: 'version', type: 'text', label: { de: 'Version (z. B. 2.1)', en: 'Version (e.g. 2.1)' }, admin: { width: '33%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bindingLanguage',
          type: 'select',
          defaultValue: 'de',
          label: { de: 'Verbindliche Sprache', en: 'Binding language' },
          admin: {
            width: '50%',
            description: {
              de: 'Andere Sprachen zeigen einen Hinweis, dass nur diese Fassung gilt.',
              en: 'Other languages show a note that only this version is binding.',
            },
          },
          options: [
            { label: { de: 'Keine (alle Fassungen gleichwertig)', en: 'None (all versions equal)' }, value: 'none' },
            { label: 'Deutsch', value: 'de' },
            { label: 'English', value: 'en' },
          ],
        },
        {
          name: 'showToc',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Inhaltsverzeichnis anzeigen', en: 'Show table of contents' },
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: { de: 'Text', en: 'Text' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          HorizontalRuleFeature(),
          EXPERIMENTAL_TableFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'history',
      type: 'array',
      label: { de: 'Änderungshistorie (frühere Fassungen)', en: 'Change history (previous versions)' },
      labels: { singular: { de: 'Eintrag', en: 'Entry' }, plural: { de: 'Einträge', en: 'Entries' } },
      maxRows: 20,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'date', required: true, label: { de: 'Datum', en: 'Date' }, admin: { width: '30%', date: { pickerAppearance: 'dayOnly' } } },
            { name: 'note', type: 'text', required: true, localized: true, label: { de: 'Was sich geändert hat', en: 'What changed' }, admin: { width: '70%' } },
          ],
        },
      ],
    },
    settings,
  ],
}
