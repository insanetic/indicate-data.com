import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const Faq: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: {
    singular: { de: 'Häufige Fragen (FAQ)', en: 'FAQ' },
    plural: { de: 'FAQ-Abschnitte', en: 'FAQ sections' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'items',
      type: 'array',
      label: { de: 'Fragen', en: 'Questions' },
      labels: { singular: { de: 'Frage', en: 'Question' }, plural: { de: 'Fragen', en: 'Questions' } },
      minRows: 1,
      maxRows: 12,
      admin: { components: { RowLabel: '@/blocks/Faq/RowLabel#FaqRowLabel' } },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
          label: { de: 'Frage', en: 'Question' },
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          localized: true,
          label: { de: 'Antwort', en: 'Answer' },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()],
          }),
        },
      ],
    },
    sectionSettings(),
  ],
}
