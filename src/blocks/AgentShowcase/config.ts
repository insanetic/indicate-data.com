import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const AgentShowcase: Block = {
  slug: 'agentShowcase',
  interfaceName: 'AgentShowcaseBlock',
  labels: {
    singular: { de: 'KI-Agent (Frage & Antwort)', en: 'AI agent (question & answer)' },
    plural: { de: 'KI-Agent-Abschnitte', en: 'AI agent sections' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'prompts',
      type: 'array',
      label: { de: 'Beispielfragen', en: 'Example questions' },
      labels: { singular: { de: 'Frage', en: 'Question' }, plural: { de: 'Fragen', en: 'Questions' } },
      minRows: 1,
      maxRows: 5,
      admin: { components: { RowLabel: '@/blocks/AgentShowcase/RowLabel#PromptRowLabel' } },
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
          type: 'textarea',
          required: true,
          localized: true,
          label: { de: 'Antwort des Agenten (2–3 Sätze)', en: 'Agent answer (2–3 sentences)' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'chart',
              type: 'select',
              defaultValue: 'line',
              label: { de: 'Diagramm', en: 'Chart' },
              admin: { width: '25%' },
              options: [
                { label: { de: 'Linie', en: 'Line' }, value: 'line' },
                { label: { de: 'Balken', en: 'Bars' }, value: 'bars' },
                { label: { de: 'Kreis', en: 'Donut' }, value: 'donut' },
                { label: { de: 'Keins', en: 'None' }, value: 'none' },
              ],
            },
            {
              name: 'kpiLabel',
              type: 'text',
              localized: true,
              label: { de: 'Kennzahl (Name)', en: 'KPI (name)' },
              admin: { width: '25%' },
            },
            {
              name: 'kpiValue',
              type: 'text',
              label: { de: 'Wert', en: 'Value' },
              admin: { width: '25%', description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
            {
              name: 'kpiDelta',
              type: 'text',
              label: { de: 'Veränderung (z. B. +4,2 %)', en: 'Change (e.g. +4.2 %)' },
              admin: { width: '25%', description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
          ],
        },
      ],
    },
    {
      name: 'points',
      type: 'array',
      label: { de: 'Vertrauensargumente (max. 3)', en: 'Trust points (max. 3)' },
      maxRows: 3,
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
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Buttons (max. 2)', en: 'Buttons (max. 2)' } },
    }),
    sectionSettings({ defaultBackground: 'dark' }),
  ],
}
