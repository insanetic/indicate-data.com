import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline' | 'ghost' | 'link'

export const appearanceOptions: Record<
  LinkAppearances,
  { label: Record<'de' | 'en', string>; value: string }
> = {
  default: {
    label: { de: 'Hauptaktion (gefüllt)', en: 'Primary (filled)' },
    value: 'default',
  },
  outline: {
    label: { de: 'Zweite Aktion (Rahmen)', en: 'Secondary (outlined)' },
    value: 'outline',
  },
  ghost: {
    label: { de: 'Dezent', en: 'Quiet' },
    value: 'ghost',
  },
  link: {
    label: { de: 'Textlink', en: 'Text link' },
    value: 'link',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  /** Store the label per language. Only for new fields: the starter blocks keep one label. */
  localized?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const link: LinkType = ({
  appearances,
  disableLabel = false,
  localized = false,
  overrides = {},
} = {}) => {
  const linkResult: GroupField = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: { de: 'Interne Seite', en: 'Internal page' },
                value: 'reference',
              },
              {
                label: { de: 'Eigene URL', en: 'Custom URL' },
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: { de: 'In neuem Tab öffnen', en: 'Open in new tab' },
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: { de: 'Ziel-Seite', en: 'Page to link to' },
      relationTo: ['pages', 'posts'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: { de: 'URL (auch #anker oder https://…)', en: 'URL (also #anchor or https://…)' },
      required: true,
    },
  ]

  if (!disableLabel) {
    linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: { de: 'Beschriftung', en: 'Label' },
          localized,
          required: true,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      admin: {
        description: { de: 'Darstellung des Links.', en: 'How the link is rendered.' },
      },
      // The default must be one of the allowed values, or Postgres rejects the enum default.
      defaultValue: appearanceOptionsToUse[0]?.value || 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}
