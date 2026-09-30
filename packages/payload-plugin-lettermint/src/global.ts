import type { Field, GlobalConfig } from 'payload'

import { isAdminUser } from './access'
import { l } from './labels'
import { bareAddress, splitAddressList } from './message'
import type { ResolvedLettermintOptions } from './types'

/** Import-map path of the status panel; must match the `./admin` export. */
export const STATUS_FIELD_PATH = '@subneo/payload-lettermint/admin#EmailStatusField'

const EMAIL = /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/

/** Comma-separated list with at least one address, each of them valid. */
export const validateAddressList = (value: unknown, options?: { req?: { i18n?: { language?: string } } }): true | string => {
  const en = options?.req?.i18n?.language === 'en'
  const list = typeof value === 'string' ? splitAddressList(value) : []
  if (!list.length) return en ? 'Enter at least one address.' : 'Mindestens eine Adresse angeben.'
  const invalid = list.find((entry) => !EMAIL.test(bareAddress(entry)))
  if (invalid) return en ? `Not a valid address: ${invalid}` : `Keine gültige Adresse: ${invalid}`
  return true
}

/** Sender, team recipients and route. Readable only by admin users; the token is never here. */
export const createEmailSettingsGlobal = (o: ResolvedLettermintOptions): GlobalConfig => ({
  slug: o.globalSlug,
  label: l('E-Mail', 'Email'),
  access: {
    read: ({ req }) => isAdminUser(req),
    update: ({ req }) => isAdminUser(req),
  },
  admin: {
    group: o.adminGroup,
    description: l(
      `Versand über Lettermint. Der Token steht nur in der Umgebungsvariable ${o.env.apiToken}, nie in der Datenbank.`,
      `Sent through Lettermint. The token lives only in the environment variable ${o.env.apiToken}, never in the database.`,
    ),
  },
  fields: [
    { name: 'status', type: 'ui', admin: { components: { Field: STATUS_FIELD_PATH } } },
    {
      type: 'row',
      fields: [
        {
          name: 'fromAddress',
          type: 'email',
          required: true,
          defaultValue: o.defaultFrom.address,
          label: l('Absenderadresse', 'Sender address'),
          admin: {
            width: '50%',
            description: l('Muss zu einer in Lettermint bestätigten Domain gehören.', 'Must be on a domain verified in Lettermint.'),
          },
        },
        {
          name: 'fromName',
          type: 'text',
          required: true,
          defaultValue: o.defaultFrom.name,
          label: l('Absendername', 'Sender name'),
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'notifyTo',
      type: 'text',
      required: true,
      defaultValue: o.defaultNotifyTo,
      label: l('Team-Empfänger', 'Team recipients'),
      validate: validateAddressList as never,
      admin: {
        description: l(
          'Kommagetrennt. Erhält die Formular-Benachrichtigungen, deren Feld „An“ leer ist.',
          'Comma-separated. Receives the form notifications whose "To" is empty.',
        ),
      },
    },
    {
      name: 'route',
      type: 'text',
      label: l('Lettermint-Route', 'Lettermint route'),
      admin: {
        description: l(
          'Leer: die Standard-Route des Projekts. Sollte eine Transaktions-Route sein.',
          "Empty: the project's default route. Should be a transactional route.",
        ),
      },
    },
  ] as Field[],
})
