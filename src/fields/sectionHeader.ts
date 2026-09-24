import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

type Options = {
  /** Make the heading optional (for blocks that can stand without a title). */
  optionalHeading?: boolean
  /** Leave out the align field (for blocks whose layout fixes the alignment). */
  withAlign?: boolean
  overrides?: Partial<GroupField>
}

/**
 * Eyebrow + heading + lead, all localised. Every marketing block starts with this so
 * sections look alike and the marketer finds the same fields everywhere.
 */
export const sectionHeader = ({ optionalHeading = false, withAlign = true, overrides = {} }: Options = {}): Field => {
  const field: GroupField = {
    name: 'header',
    type: 'group',
    label: { de: 'Überschrift', en: 'Heading' },
    fields: [
      {
        name: 'eyebrow',
        type: 'text',
        localized: true,
        label: { de: 'Kleine Zeile über der Überschrift', en: 'Eyebrow (small line above)' },
      },
      {
        name: 'heading',
        type: 'text',
        localized: true,
        required: !optionalHeading,
        label: { de: 'Überschrift', en: 'Heading' },
      },
      {
        name: 'lead',
        type: 'textarea',
        localized: true,
        label: { de: 'Einleitung (1–2 Sätze)', en: 'Lead (1–2 sentences)' },
      },
      ...(withAlign
        ? [
            {
              name: 'align',
              type: 'select',
              defaultValue: 'left',
              label: { de: 'Ausrichtung', en: 'Alignment' },
              options: [
                { label: { de: 'Links', en: 'Left' }, value: 'left' },
                { label: { de: 'Zentriert', en: 'Centred' }, value: 'center' },
                { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
              ],
            } satisfies Field,
          ]
        : []),
    ],
  }
  return deepMerge(field, overrides)
}
