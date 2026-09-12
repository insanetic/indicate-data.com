import type { Field, GroupField, TextFieldSingleValidation } from 'payload'

import deepMerge from '@/utilities/deepMerge'

type Options = {
  defaultBackground?: 'default' | 'tinted' | 'dark' | 'accent'
  overrides?: Partial<GroupField>
}

/** Background, spacing and anchor for a block. Rendered by `<Section>`. */
export const sectionSettings = ({ defaultBackground = 'default', overrides = {} }: Options = {}): Field => {
  const field: GroupField = {
    name: 'settings',
    type: 'group',
    label: { de: 'Abschnitt', en: 'Section' },
    admin: { hideGutter: true },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'background',
            type: 'select',
            defaultValue: defaultBackground,
            label: { de: 'Hintergrund', en: 'Background' },
            admin: { width: '33%' },
            options: [
              { label: { de: 'Standard (dunkel)', en: 'Default (dark)' }, value: 'default' },
              { label: { de: 'Leicht abgehoben', en: 'Slightly raised' }, value: 'tinted' },
              { label: { de: 'Tiefer dunkel', en: 'Deeper dark' }, value: 'dark' },
              { label: { de: 'Gelb (Akzent)', en: 'Yellow (accent)' }, value: 'accent' },
            ],
          },
          {
            name: 'spacing',
            type: 'select',
            defaultValue: 'default',
            label: { de: 'Abstand', en: 'Spacing' },
            admin: { width: '33%' },
            options: [
              { label: { de: 'Normal', en: 'Default' }, value: 'default' },
              { label: { de: 'Kompakt', en: 'Compact' }, value: 'compact' },
              { label: { de: 'Ohne', en: 'None' }, value: 'none' },
            ],
          },
          {
            name: 'anchor',
            type: 'text',
            label: { de: 'Anker (für Links wie #produkt)', en: 'Anchor (for links like #product)' },
            admin: { width: '33%' },
            validate: ((value) =>
              !value || /^[a-z0-9-]+$/.test(String(value))
                ? true
                : 'Nur Kleinbuchstaben, Zahlen und Bindestriche / lowercase letters, digits and hyphens only') as TextFieldSingleValidation,
          },
        ],
      },
    ],
  }
  return deepMerge(field, overrides)
}
