import type { Payload } from 'payload'

import type { Form } from '@/payload-types'

import { paragraphs } from './lexical'

type FormEmail = NonNullable<Form['emails']>[number]

export const CONTACT_FORM_TITLE = 'Kontaktformular'
/** Where replies to a confirmation go. */
export const TEAM_REPLY_TO = 'hello@indicate-data.io'

const message = (texts: string[]) => paragraphs(texts) as unknown as FormEmail['message']

/**
 * Team notification (empty "To": the team recipients from Website -> E-Mail; reply goes to the
 * visitor) and one confirmation per language. Confirmations carry nothing the visitor typed.
 */
export const contactFormEmails: FormEmail[] = [
  {
    emailTo: '',
    emailFrom: '',
    replyTo: '{{email}}',
    subject: 'Neue Kontaktanfrage: {{name}}',
    language: 'all',
    message: message(['Neue Anfrage über das Kontaktformular der Website:', '{{*:table}}']),
  },
  {
    emailTo: '{{email}}',
    emailFrom: '',
    replyTo: TEAM_REPLY_TO,
    subject: 'Danke für Ihre Nachricht',
    language: 'de',
    message: message([
      'Guten Tag,',
      'vielen Dank für Ihre Nachricht an Indicate Data. Wir haben sie erhalten und melden uns innerhalb eines Werktags.',
      'Möchten Sie noch etwas ergänzen? Antworten Sie einfach auf diese E-Mail.',
      'Viele Grüße',
      'Ihr Team von Indicate Data',
    ]),
  },
  {
    emailTo: '{{email}}',
    emailFrom: '',
    replyTo: TEAM_REPLY_TO,
    subject: 'Thank you for your message',
    language: 'en',
    message: message([
      'Hello,',
      'thank you for your message to Indicate Data. We have received it and will get back to you within one business day.',
      'Would you like to add anything? Simply reply to this email.',
      'Best regards',
      'The Indicate Data team',
    ]),
  },
]

/** Sets the seed's email entries on the existing contact form (found by title). Safe to run again. */
export const applyContactFormEmails = async (
  payload: Payload,
): Promise<{ updated: false } | { updated: true; id: number | string; before: string[] }> => {
  const { docs } = await payload.find({
    collection: 'forms',
    where: { title: { equals: CONTACT_FORM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const form = docs[0] as { id: number | string; emails?: { emailTo?: string | null; subject?: string | null }[] | null } | undefined
  if (!form) return { updated: false }
  const before = (form.emails || []).map((e) => `${e.subject ?? ''} → ${e.emailTo || '(team)'}`)
  await payload.update({ collection: 'forms', id: form.id, data: { emails: contactFormEmails }, overrideAccess: true })
  return { updated: true, id: form.id, before }
}
