import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'
import { bareAddress, getEmailSettings, splitAddressList } from '@subneo/payload-lettermint'

import { defaultLocale, isLocale } from '@/i18n/config'

import { confirmationCap } from './confirmationCap'

type EmailEntry = { emailTo?: string | null; language?: string | null }

/** A recipient built from the submission (`{{email}}`), i.e. an address the visitor typed. */
export const visitorAddressed = (emailTo: string | null | undefined): boolean => Boolean(emailTo && /\{\{.+?\}\}/.test(emailTo))

/**
 * Runs after the form builder has formatted one mail per form email entry, in entry order. Drops
 * entries for another language, sends entries without "To" to the team recipients, and caps mails
 * to visitor-supplied addresses.
 */
export const createBeforeEmail =
  (cap = confirmationCap): BeforeEmail =>
  async (emails, params) => {
    const { req } = params
    // The form builder calls this from afterChange, so `doc` is there at runtime; its type says beforeChange.
    const source = ((params as { doc?: Record<string, unknown> }).doc ?? params.data ?? {}) as Record<string, unknown>
    const locale = isLocale(source.locale) ? source.locale : defaultLocale
    const formRef = source.form
    const formId = typeof formRef === 'object' && formRef !== null ? (formRef as { id: number | string }).id : formRef
    const form = await req.payload.findByID({ collection: 'forms', id: formId as number, depth: 0, req })
    const entries = (form.emails || []) as EmailEntry[]
    const settings = await getEmailSettings(req.payload)

    return emails.flatMap((email, index) => {
      const entry = entries[index] || {}
      const language = entry.language || 'all'
      if (language !== 'all' && language !== locale) return []
      if (!entry.emailTo?.trim()) return [{ ...email, to: settings.notifyTo.join(', ') }]
      if (visitorAddressed(entry.emailTo)) {
        const recipients = splitAddressList(String(email.to))
        const recipient = recipients.length === 1 ? bareAddress(recipients[0]).toLowerCase() : ''
        if (!recipient.includes('@')) {
          req.payload.logger.warn('[email] confirmation recipient is not a single address; mail not sent')
          return []
        }
        if (!cap.allow(recipient)) {
          req.payload.logger.warn(`[email] confirmation limit reached for an address at ${recipient.split('@')[1]}; mail not sent`)
          return []
        }
      }
      return [email]
    })
  }
