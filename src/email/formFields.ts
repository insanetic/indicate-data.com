import type { Field } from 'payload'

import { defaultLocale, localeLabels, locales } from '@/i18n/config'

/** Per form email: only send when the form was filled in on a page in this language. */
export const emailLanguageField: Field = {
  name: 'language',
  type: 'select',
  required: true,
  defaultValue: 'all',
  label: { de: 'Sprache', en: 'Language' },
  options: [
    { label: { de: 'Alle Sprachen', en: 'All languages' }, value: 'all' },
    ...locales.map((code) => ({ label: localeLabels[code], value: code })),
  ],
  admin: {
    description: {
      de: 'Nur senden, wenn das Formular auf einer Seite in dieser Sprache ausgefüllt wurde.',
      en: 'Only send when the form was filled in on a page in this language.',
    },
  },
}

/** Appends the language select to the form builder's `emails` array. */
export const withEmailLanguage = (field: Field): Field =>
  'name' in field && field.name === 'emails' && field.type === 'array' ? { ...field, fields: [...field.fields, emailLanguageField] } : field

/** Page language of a submission, sent by the form block. */
export const submissionLocaleField: Field = {
  name: 'locale',
  type: 'select',
  defaultValue: defaultLocale,
  label: { de: 'Sprache', en: 'Language' },
  options: locales.map((code) => ({ label: localeLabels[code], value: code })),
  admin: { position: 'sidebar', readOnly: true },
}
