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
 * A row of entries, numbered steps or numbers. Columns follow the entry count unless set;
 * `panel` puts a row of numbers on one rounded surface with hairline dividers.
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
          // Cards render exactly like points now; the value stays for existing rows but is no longer offered.
          filterOptions: ({ options, siblingData }) =>
            options.filter((o) => (typeof o === 'string' ? o : o.value) !== 'cards' || (siblingData as { style?: string })?.style === 'cards'),
          options: [
            { label: { de: 'Einträge (Icon, Titel, Text, Link)', en: 'Entries (icon, title, text, link)' }, value: 'points' },
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
          admin: { width: '22%', condition: (_data, siblingData) => siblingData?.style === 'stats' },
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
              name: 'unit',
              type: 'text',
              localized: true,
              label: { de: 'Zusatz (z. B. %, Jahre)', en: 'Unit (e.g. %, years)' },
              admin: { width: '15%', condition: forStyles('stats') },
            },
            // Replaced by the translatable `unit`; the stat_unit migration moved its values over.
            { name: 'suffix', type: 'text', admin: { hidden: true } },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel / Beschriftung', en: 'Title / label' },
              admin: { width: '40%' },
            },
            {
              name: 'width',
              type: 'select',
              defaultValue: 'auto',
              label: { de: 'Breite', en: 'Width' },
              admin: { width: '25%', condition: forStyles('stats') },
              options: [
                { label: { de: 'Automatisch (eine Spalte)', en: 'Automatic (one column)' }, value: 'auto' },
                { label: '1/5', value: 'fifth' },
                { label: '1/4', value: 'quarter' },
                { label: '1/3', value: 'third' },
                { label: '1/2', value: 'half' },
                { label: { de: 'Ganze Zeile', en: 'Full row' }, value: 'full' },
              ],
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'sm',
              label: { de: 'Breite', en: 'Width' },
              admin: { width: '20%', condition: forStyles('points', 'cards') },
              options: [
                { label: { de: 'Normal', en: 'Normal' }, value: 'sm' },
                { label: { de: 'Doppelt', en: 'Double' }, value: 'lg' },
              ],
            },
          ],
        },
        {
          name: 'word',
          type: 'text',
          localized: true,
          label: { de: 'Wort statt Zahl (optional)', en: 'Word instead of a number (optional)' },
          admin: {
            condition: forStyles('stats'),
            description: {
              de: 'Steht groß wie eine Zahl, z. B. „DSGVO“. Wird nur ohne Zahl gezeigt.',
              en: 'Shown large like a number, e.g. "GDPR". Only used when there is no number.',
            },
          },
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
          admin: { condition: forStyles('points', 'cards') },
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: { de: 'Punkt', en: 'Point' } }],
        },
        linkGroup({
          appearances: ['link'],
          localized: true,
          overrides: {
            maxRows: 1,
            label: { de: 'Link (optional)', en: 'Link (optional)' },
            admin: { condition: forStyles('points', 'cards', 'stats') },
          },
        }),
      ],
    },
    sectionSettings(),
  ],
}
