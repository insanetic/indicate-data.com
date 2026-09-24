import type { Field, GroupField, SelectField, TextFieldSingleValidation } from 'payload'

import deepMerge from '@/utilities/deepMerge'

type Options = {
  defaultBackground?: 'default' | 'tinted' | 'dark' | 'accent'
  overrides?: Partial<GroupField>
}

const gapOptions: SelectField['options'] = [
  { label: { de: 'Automatisch', en: 'Automatic' }, value: 'auto' },
  { label: { de: 'Keiner', en: 'None' }, value: 'none' },
  { label: { de: 'Eng', en: 'Tight' }, value: 'tight' },
  { label: { de: 'Normal', en: 'Normal' }, value: 'normal' },
  { label: { de: 'Groß', en: 'Large' }, value: 'large' },
]

const gapDescription = {
  de: 'Automatisch: voller Abstand, wo ein Abschnitt beginnt oder endet, eng innerhalb.',
  en: 'Automatic: full space where a section starts or ends, tight inside one.',
}

/**
 * Background, space above and below, and anchor for a block. Rendered by `<Section>`; `auto`
 * gaps are resolved from the neighbouring blocks by `resolveSpacing`.
 */
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
            admin: { width: '25%' },
            options: [
              { label: { de: 'Standard (dunkel)', en: 'Default (dark)' }, value: 'default' },
              { label: { de: 'Leicht abgehoben', en: 'Slightly raised' }, value: 'tinted' },
              { label: { de: 'Tiefer dunkel', en: 'Deeper dark' }, value: 'dark' },
              { label: { de: 'Gelb (Akzent)', en: 'Yellow (accent)' }, value: 'accent' },
            ],
          },
          {
            name: 'gapTop',
            type: 'select',
            defaultValue: 'auto',
            label: { de: 'Abstand oben', en: 'Space above' },
            admin: { width: '25%', description: gapDescription },
            options: gapOptions,
          },
          {
            name: 'gapBottom',
            type: 'select',
            defaultValue: 'auto',
            label: { de: 'Abstand unten', en: 'Space below' },
            admin: { width: '25%', description: gapDescription },
            options: gapOptions,
          },
          {
            name: 'anchor',
            type: 'text',
            label: { de: 'Anker (für Links wie #produkt)', en: 'Anchor (for links like #product)' },
            admin: { width: '25%' },
            validate: ((value) =>
              !value || /^[a-z0-9-]+$/.test(String(value))
                ? true
                : 'Nur Kleinbuchstaben, Zahlen und Bindestriche / lowercase letters, digits and hyphens only') as TextFieldSingleValidation,
          },
        ],
      },
      {
        // Replaced by gapTop / gapBottom; the section conversion moves its values over. Kept
        // hidden so the dev schema push never drops a populated column; phase 2 removes it.
        name: 'spacing',
        type: 'select',
        defaultValue: 'default',
        admin: { hidden: true },
        options: [
          { label: { de: 'Normal', en: 'Default' }, value: 'default' },
          { label: { de: 'Kompakt', en: 'Compact' }, value: 'compact' },
          { label: { de: 'Ohne', en: 'None' }, value: 'none' },
        ],
      },
    ],
  }
  return deepMerge(field, overrides)
}
