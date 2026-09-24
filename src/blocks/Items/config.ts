import type { Block, Condition } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionSettings } from '@/fields/sectionSettings'

import type { ItemStyle } from './columns'

/** Shows a row field only for the given styles of the surrounding block. */
const forStyles =
  (...styles: ItemStyle[]): Condition =>
  (_data, _siblingData, { blockData }) =>
    styles.includes(((blockData as { style?: ItemStyle } | undefined)?.style || 'points') as ItemStyle)

/**
 * A row of points, cards, numbered steps or numbers. Columns follow the entry count unless set;
 * `panel` puts the row on one rounded surface with hairline dividers.
 */
export const Items: Block = {
  slug: 'items',
  interfaceName: 'ItemsBlock',
  labels: {
    singular: { de: 'Punkte, Karten, Schritte oder Zahlen', en: 'Points, cards, steps or numbers' },
    plural: { de: 'Listen', en: 'Lists' },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'points',
          label: { de: 'Darstellung', en: 'Style' },
          admin: { width: '34%' },
          options: [
            { label: { de: 'Punkte (Icon, Titel, Text)', en: 'Points (icon, title, text)' }, value: 'points' },
            { label: { de: 'Karten', en: 'Cards' }, value: 'cards' },
            { label: { de: 'Schritte (nummeriert)', en: 'Steps (numbered)' }, value: 'steps' },
            { label: { de: 'Zahlen', en: 'Numbers' }, value: 'stats' },
          ],
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: 'auto',
          label: { de: 'Spalten', en: 'Columns' },
          admin: { width: '22%' },
          options: [
            { label: { de: 'Automatisch', en: 'Automatic' }, value: 'auto' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
          ],
        },
        {
          name: 'frame',
          type: 'select',
          defaultValue: 'none',
          label: { de: 'Rahmen', en: 'Frame' },
          admin: { width: '22%' },
          options: [
            { label: { de: 'Ohne', en: 'None' }, value: 'none' },
            { label: { de: 'Gemeinsame Fläche', en: 'Shared panel' }, value: 'panel' },
          ],
        },
        {
          name: 'divider',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Linie darüber', en: 'Rule above' },
          admin: { width: '22%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      label: { de: 'Einträge', en: 'Entries' },
      labels: { singular: { de: 'Eintrag', en: 'Entry' }, plural: { de: 'Einträge', en: 'Entries' } },
      admin: { components: { RowLabel: '@/blocks/Items/RowLabel#ItemRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            iconSelect({ admin: { width: '25%', condition: forStyles('points', 'cards', 'steps') } }),
            {
              name: 'value',
              type: 'text',
              label: { de: 'Zahl (z. B. 40)', en: 'Number (e.g. 40)' },
              admin: { width: '20%', condition: forStyles('stats'), description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
            {
              name: 'suffix',
              type: 'text',
              label: { de: 'Zusatz (z. B. %)', en: 'Suffix (e.g. %)' },
              admin: { width: '15%', condition: forStyles('stats') },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel / Beschriftung', en: 'Title / label' },
              admin: { width: '40%' },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'sm',
              label: { de: 'Breite', en: 'Width' },
              admin: { width: '20%', condition: forStyles('cards') },
              options: [
                { label: { de: 'Normal', en: 'Normal' }, value: 'sm' },
                { label: { de: 'Doppelt', en: 'Double' }, value: 'lg' },
              ],
            },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { de: 'Text (bei Zahlen: Quelle / Hinweis)', en: 'Text (for numbers: source / note)' },
        },
        {
          name: 'points',
          type: 'array',
          maxRows: 5,
          label: { de: 'Stichpunkte (optional)', en: 'Bullet points (optional)' },
          admin: { condition: forStyles('cards') },
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: { de: 'Punkt', en: 'Point' } }],
        },
        linkGroup({
          appearances: ['link'],
          localized: true,
          overrides: {
            maxRows: 1,
            label: { de: 'Link (optional)', en: 'Link (optional)' },
            admin: { condition: forStyles('cards', 'stats') },
          },
        }),
      ],
    },
    sectionSettings(),
  ],
}
